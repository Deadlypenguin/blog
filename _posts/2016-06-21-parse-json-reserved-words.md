---
post_id: 965
title: Parse JSON with Reserved Words
date: 2016-06-21T08:15:16+00:00
author: pcon
layout: post
permalink: /2016/06/21/parse-json-reserved-words/
thumbnail: /assets/img/2016/06/21/post_thumbnail.png
redirect_from:
- /blog/2016/06/21/parse-json-reserved-words/
dsq_thread_id:
- "4922855375"
categories:
- development
- salesforce
tags:
- apex
- json
---
One of the great things about Salesforce when dealing with external webservices is being able to easily parse JSON into Apex classes.  I've covered this in [several](/2015/11/30/json-deserialization-in-salesforce/) [previous](/2016/03/16/extending-objects-json-parsing/) [posts](/2016/03/01/runkeeper-data-in-salesforce/).   However a common problem is that the system you are integrating with is they may be using a variable name that is reserved.  With the following data, we can see that there is a variable named "case" if we ant to parse this data into a Apex class we won't be able to because case is a reserved name.

```javascript
{
    "data": [
        {
            "case": "123456",
            "subject": "Test case"
        }, {
            "case": "789012",
            "subject": "Another case"
        }
    ]
}
```

<!--more-->

If we tried to make a wrapper class for this called CaseData with the format below, we'd get an error stating "Identifier name is reserved: case"

```javascript
public class CaseData {
    public String case;
    public String subject;
}
```

So, one way to work around this is to not use the reserved name for the variable.  So if we make a new CaseData with following format we can save the class.

```java
public class CaseData {
    public String case_x;
    public String subject;
}
```

And now if we execute the following Apex, we can pull the data into an array of CaseData objects

```java
public class GistParser {
    public class CaseData {
        public String case_x;
        public String subject;
    }

    public class DataWrapper {
        public List<CaseData> data;
    }

    public static void readEndpoint() {
        String ENDPOINT = 'https://gist.githubusercontent.com/pcon/a12c84e2ef54370c25c26fc19f331971/raw/6a881590a5ca1467283ac17bea223a8916ce9528/gistfile1.txt';

        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint(ENDPOINT);
        Http h = new Http();
        HttpResponse res = h.send(req);
        System.debug(JSON.deserialize(res.getBody(), DataWrapper.class));
    }
}
```

Now, while this will save it will not store our case number into the _case_x_ variable because that is not the name of the field in the JSON data.  To work around this, we can do a search and replace on our incoming body.  The simplest way is to call

```java
System.debug(JSON.deserialize(res.getBody().replace('"case":', '"case_x":'), DataWrapper.class));
```

This search and replace works but is dangerous and honestly doesn't scale too well.  So, let's take a look at a way to make it scale better

```java
public static String mogrifyJSON(String data) {
    // Regex to match the start of the line and the key
    // surrounded by quotes and ending with a colon
    String regexFormat = '(?m)^\\s*"{0}"\\s*:';

    // Replacement format of the new key surrounded by
    // quotes and ending with a colon
    String replacementFormat = '"{0}" :';

    // A map of existing key to replacement key
    Map<String, String> replacements = new Map<String, String> {
        'case' => 'case_x'
    };

    // Since our JSON can come in formatted however the
    // endpoint wants, we need to format it to a standard
    // we know and can handle
    String formattedJSON = JSON.serializePretty(JSON.deserializeUntyped(data));

    // Iterate over all the keys we want to replace
    for (String key : replacements.keySet()) {
        // Generate our regex based on the key
        String regex = String.format(
            regexFormat,
            new List<String> {key}
        );

        // Generate our replacement
        String replacement = String.format(
            replacementFormat,
            new List<String> {replacements.get(key)}
        );

        // Find all and replace
        formattedJSON = formattedJSON.replaceAll(regex, replacement);
    }

    return formattedJSON;
}
```

This code iterates over a map of old keys to new keys and does a find and replace on all of them.  This method is "safer" because we first reformat the JSON into a known good format so that we only replace the initial key.  This prevents us from accidentally replacing a match for the key in the middle of the data.  We can then call it by saying

```java
System.debug(JSON.deserialize(mogrifyJSON(res.getBody()), DataWrapper.class));
```