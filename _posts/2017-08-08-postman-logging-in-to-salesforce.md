---
post_id: 1234
title: 'Postman &#8211; Logging in to Salesforce'
date: 2017-08-08T07:50:46+00:00
author: pcon
layout: post
permalink: /2017/08/08/postman-logging-in-to-salesforce/
redirect_from:
- /blog/2017/08/08/postman-logging-in-to-salesforce/
thumbnail: /assets/img/2017/08/08/post_thumbnail.png
comments: true
dsq_thread_id:
- "6049340271"
categories:
- development
- salesforce
tags:
- postman
- rest
---
We've been slowly replacing all of our SOAP endpoints with REST endpoints inside of Salesforce.  The upside of this is that they are much easier to use.  The downside is that they are harder to functionally test without a bunch of work to generate session Ids.  (This was made even more frustrating by [a recent change](https://salesforce.stackexchange.com/questions/179845/session-id-remove-issue-in-api-callouts-in-salesforce/180216#180216) that obfuscates out the session id in debug logs)  So, I decided to figure out how to run a Postman request that would then store the session id and server url for later requests to use.  This post will cover how to set that up and use this one request.  I plan on writing more in-depth blog later about how to use Postman to test custom REST endpoints later.

<!--more-->

# Environment Setup

In Postman, you can have multiple environments that store key/value pairs of data.  This is super useful when you have multiple sandboxes / orgs to log into.  For this setup, we'll need four bits of data.

![Environments](/assets/img/2017/08/08/environments.png)

These all should be pretty self-explanatory

* **username** &#8211; The Salesforce username
* **baseurl** &#8211; The url that is used to login.  This should be either `https://test.salesforce.com` or `https://login.salesforce.com`
* **password** &#8211; The password for the user
* **token** &#8211; The token for the user.  _This may not be required depending on your whitelist settings._

# Importing the Collection into Postman

There are two ways to do this.  The easiest it to go to _collection -> Import -> Import From Link_ and put in the URL below

`https://www.getpostman.com/collections/e3549555892d61e228ac`

Alternately you follow the URL above and copy / paste that into _Collection -> Import -> Paste Raw Text_

# Using the collection

Once you've imported it, you should have a new collection called "Salesforce" with a POST request called "Login."  Click on it and it will load up the request.  Click send and you're all logged in.  You can verify that it's working by clicking the eye icon next to the environment name and checking for three new variables.

![Updated Variables](/assets/img/2017/08/08/updatedVariables.png)

These new variables are

* **sessionid** &#8211; This is the session id you want to pass as part of your Authorization header
* **serverurl** &#8211; This is the base services URL you'd use for making standard REST calls
* **resturl** &#8211; This is a "helper" URL that makes it a bit easier to make custom REST calls

Once you've run this and they are stored in your environment, you can make any other REST requests you need.  You'll just use `{{serverurl}}` or `{{resturl}}` in your request URL and then add an `Authorization: Bearer {{sessionid}}` header to your request.

# Example

Let's say we have a custom REST service that exposes an HTTP GET endpoint with the following code

```apex
@RestResource(urlMapping = '/mycustomendpoint'
global with sharing class REST_CustomEndpoint {
    @HttpGet
    global static String getEndpoint() {
        return 'Hello World';
    }
}
```

To access this in Postman we'd create a request that looks like this

![Postman request](/assets/img/2017/08/08/postmanRequest.png)

Then after we click "Send" we'll get the "Hello World" string back from our REST endpoint.