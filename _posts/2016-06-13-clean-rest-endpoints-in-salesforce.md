---
post_id: 679
title: Clean REST Endpoints in Salesforce
date: 2016-06-13T07:00:37+00:00
author: pcon
layout: post
permalink: /2016/06/13/clean-rest-endpoints-in-salesforce/
redirect_from:
- /blog/2016/06/13/clean-rest-endpoints-in-salesforce/
dsq_thread_id:
- "4904851979"
categories:
- development
- salesforce
tags:
- rest
- webservice
---
One of the things I love working on are webservices.  However, one of the things I dislike about using SOAP is that using the endpoint isn't as nice as it could be.  This is something that has been addressed by how REST endpoints are interacted with.  By writing clean REST endpoints, your users can easily understand what is going on under the hood

# Clean REST Endpoints

What do I mean by clean REST endpoints?  Let's take a look at two possible URIs and see which ones are cleaner and easier to understand.  For the examples below, we are going to have two URIs, one to get a case by case number, and one to get it's comments

```bash
#Get case using url parameter
curl "$SFDC_URL/services/apexrest/v1/cases?number=012345"

#Get case comments using url parameter
curl "$SFDC_URL/services/apexrest/v1/comments?number=012345"

#Get case using number in url
curl "$SFDC_URL/services/apexrest/v1/cases/012345"

#Get case comments using number in url
curl "$SFDC_URL/services/apexrest/v1/cases/012345/comments"
```

While the parameters are perfectly acceptable, they are not pretty.  Also, it is difficult as a programmer to know if the param you have add to the URI is _number_, or _casenumber_ or what.  So instead if we have clean REST endpoints, we have the case number as part of the URI and it is just more logical as to knowing how to get a specific case.

<!--more-->

# Apex REST Endpoints

So, let's take a look at how to model this in our Apex code.

## GenericUtils

To make this scale, we need to write some utility methods for parsing the data URI.

```java
public class GenericUtils {
    public static final String MSG_GROUP_KEY_MISMATCH = 'The number of groups and the number of keys do not match';

    public virtual class InvalidPermissionsException extends Exception {}
    public virtual class BadException extends Exception {}
    public virtual class UnknownException extends Exception {}
    public virtual class ConflictException extends Exception {}

    /**
    * Returns a map of key, value pairs for matching patterns.
    *
    * NOTE: Apex does not support true named groups in the Pattern/Matcher classes. This method takes in an
    * ordered list of keys and will iterate through them and get each match in order and return them.
    *
    * @param patternString The regex pattern
    * @param stringToMatch The source string to match against
    * @param keys The name of keys to return
    * @throws BadException If the number of groups does not match the number keys
    */
    public static Map<String, String> getPatternMatch(String patternString, String stringToMatch, List<String> keys) {
        Map<String, String> results = new Map<String, String>();
        Pattern p = Pattern.compile(patternString);
        Matcher m = p.matcher(stringToMatch);

        if (!m.find()) {
            return results;
        }

        if (m.groupCount() != keys.size()) {
            throw new BadException(MSG_GROUP_KEY_MISMATCH);
        }

        for (Integer i = 0; i < keys.size(); i++) {
            results.put(keys.get(i), m.group(i + 1));
        }

        return results;
    }
}
```

What this method does is to fake named group matching inside of Apex.  This allows us to pass in our search string, our regex and a list of group names and get a map of group names to results.  Since I prefer to do samurai coding<sup>*</sup>, we'll thrown an exception instead of returning null.  This means that our other code just has to catch the exception, not do lots of if / else statements for null checks.

<sup>*</sup>Samurai coding is to return successful or don't return at all.  So in other words, don't return null unless that's a successful state.

## RESTUtils

Now, let's write some utility methods to help us with our REST endpoints.

```java
public class RESTUtils {
    public static Integer STATUS_OK = 200;
    public static Integer STATUS_BAD = 400;
    public static Integer STATUS_FORBIDDEN = 403;
    public static Integer STATUS_NOTFOUND = 404;
    public static Integer STATUS_CONFLICT = 409;
    public static Integer STATUS_ISE = 500;

    /** The header name that we should return the error message back on */
    public final static String HEADER_MESSAGE = 'Message';

    /**
    * Generates a rest response based on a status code and an exception
    *
    * @param res The REST response
    * @param statusCode The HTTP status code
    * @param e The exception
    * @return The updated REST response
    */
    public static RestResponse getRestResponse(RestResponse res, Integer statusCode, Exception e) {
        res.statusCode = statusCode;
        res.addHeader(HEADER_MESSAGE, e.getMessage());
        return res;
    }

    /**
    * Sets the status code to ok
    *
    * @param res The rest response
    * @return The rest response with an update status
    */
    public static RestResponse getSuccessResponse(RestResponse res) {
        res.statusCode = STATUS_OK;
        return res;
    }

    /**
    * Gets the appropriate rest response as well as logs the exception
    *
    * @param res The rest response
    * @param methodName The name of the method that the error has come from
    * @param paramList The parameters passed into the method
    * @param e The exception that was caught
    * @return The updated rest response
    */
    public static RestResponse getRestResponse(RestResponse res, Exception e) {
        Integer statusCode = STATUS_ISE;

        if (e instanceof GenericUtils.InvalidPermissionsException) {
            statusCode = STATUS_FORBIDDEN;
        } else if (e instanceof GenericUtils.BadException) {
            statusCode = STATUS_BAD;
        } else if (e instanceof GenericUtils.UnknownException) {
            statusCode = STATUS_NOTFOUND;
        } else if (e instanceof GenericUtils.ConflictException) {
            statusCode = STATUS_CONFLICT;
        }

        return getRestResponse(res, statusCode, e);
    }
}
```

Two of these methods _getRestResponse_ and _getSuccessResponse_ help us by setting the appropriate status codes and adding message headers based on if our call was successful.  We are putting the message in the header here because it's the same way that failures are handled when you do a GET against an unknown endpoint in Salesforce.

The last _getRestResponse_ handles our exceptions.  This makes our actual endpoint code much easier to navigate.

## REST\_Case\_v1

We'll start off with a pretty basic [REST endpoint](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_code_sample_basic.htm).

```java
@RestResource(urlMapping = '/v1/cases/\\d+/')
global class REST_Case_v1 {
  /** The case number identifier */
  @TestVisible private static String CASE_NUMBER_KEY = 'caseNumber';

  /** The URL format */
  @TestVisible private static String URL_FORMAT = '/v1/cases/(?<' + CASE_NUMBER_KEY + '>\\d+)';

  /** The keys for the url */
  @TestVisible private static List<String> URL_KEYS = new List<String> {
    CASE_NUMBER_KEY
  };

  @HttpGet
  global static Case getCase() {
    RestRequest req = RestContext.request;
    RestResponse res = RestContext.response;
    final String requestURL = req.requestURI;

    Case result = null;

    try {
      Map<String, String> urlParts = GenericUtils.getPatternMatch(URL_FORMAT, requestURL, URL_KEYS);

      List<Case> caseList = [
        select CaseNumber,
          Description,
          Subject
        from Case
        where CaseNumber = :String.escapeSingleQuotes(urlParts.get(CASE_NUMBER_KEY))
      ];

      if (caseList.isEmpty()) {
        throw new GenericUtils.UnknownException('Could not find case');
      }

      result = caseList.get(0);
      res = RESTUtils.getSuccessResponse(res);
    } catch (Exception e) {
      result = null;
      res = RESTUtils.getRestResponse(res, e);
    }

    return result;
  }
}
```

We can see here that the _urlMapping_ uses a regular expression to get the case number from the URL.  On line 7 we have a string that is our url format (again a regular expression) that we'll pass to our GenericUtils method to do our fake group matching.  From this we'll pull out the case number and query the case.  In the real world, we'd want to make this a utility method and pass in the value from the map.  If the case does not exist then we'll throw our _UnknownException_ that will cause our status code to be set to 404.

## REST\_Case\_Comment_v1

```java
@RestResource(urlMapping = '/v1/cases/\\d+/comments')
global class REST_Case_Comment_v1 {
  /** The case number identifier */
  @TestVisible private static String CASE_NUMBER_KEY = 'caseNumber';

  /** The URL format */
  @TestVisible private static String URL_FORMAT = '/v1/cases/(?<' + CASE_NUMBER_KEY + '>\\d+)/comments';

  /** The keys for the url */
  @TestVisible private static List<String> URL_KEYS = new List<String> {
    CASE_NUMBER_KEY
  };

  @HttpGet
  global static List<CaseComment> getComments() {
    RestRequest req = RestContext.request;
    RestResponse res = RestContext.response;
    final String requestURL = req.requestURI;

    List<CaseComment> result = new List<CaseComment>();

    try {
      Map<String, String> urlParts = GenericUtils.getPatternMatch(URL_FORMAT, requestURL, URL_KEYS);

      List<Case> caseList = [
        select CaseNumber,
          Description,
          Subject
        from Case
        where CaseNumber = :String.escapeSingleQuotes(urlParts.get(CASE_NUMBER_KEY))
      ];

      if (caseList.isEmpty()) {
        throw new GenericUtils.UnknownException('Could not find case');
      }

      Case c = caseList.get(0);

      result = [
        select CommentBody
        from CaseComment
        where ParentId = :c.Id
      ];

      res = RESTUtils.getSuccessResponse(res);
    } catch (Exception e) {
      result = null;
      res = RESTUtils.getRestResponse(res, e);
    }

    return result;
  }
}
```

Same as our case API, we parse the case number in order to get the case Id for our comment query.  Again, in the real world we would have these calls in utility methods.

# Testing

Now testing REST endpoints is a completely different topic.  But let's look at how we setup our REST contexts to do this type of clean REST endpoint.

```java
RestRequest req = new RestRequest();
req.requestURI = '/v1/cases/' + testCase.CaseNumber + '/comments';
RestResponse res = new RestResponse();

RestContext.request = req;
RestContext.response = res;
```

so we'll simply set the _requestURI_ and then when we set the global _RestContext_ value we can read it from that variable.