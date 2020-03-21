---
post_id: 144
title: Creating Web Services in Salesforce
date: 2012-01-06T17:47:50+00:00
author: pcon
layout: post
permalink: /2012/01/06/creating-web-services-in-salesforce/
redirect_from:
- /blog/2012/01/06/creating-web-services-in-salesforce/
dsq_thread_id:
- "1800881813"
categories:
- development
- salesforce
tags:
- apex
- webservice
---
<div class="notification is-warning is-light">This article has been <a title="Web services development on Salesforce" href="http://blog.deadlypenguin.com/blog/2015/03/09/web-services-development-salesforce/">updated</a> to show lessons learned over the past three years.  The content of this article is still relevant, but is a little out-dated.</div>

# Preface

At my current job, we have several external systems that interact with Salesforce, and they do so through web-services. This document will cover what I have learned in regards to web-services, caveats with them and common pitfalls.

# Overview {#Overview}

The goal of our web-services is to provide a single point of entry for each _major_ object represented in Salesforce.  A _major_ object would be Account, Case, Case Comment etc.  The reason this is differentiated is that for instance, Case Groups would under the AccountAPI since they are a _minor_ object.  Each web-service consists of two parts.  First the actual **web-service class** which holds the externally facing methods and from which the WSDL is generated.  The second part is that of the **util class** which holds all of the logic and is reusable.

## Web-service class

### APIUtils

This class contains several static variables, exceptions and most importantly the classes that are returned from the web-service

#### Static Variables

The static variables listed here are used to set the returnCode in the resulting return class.  This helps to keep return codes consistent with what is expected by the calling app

#### Exceptions

There are two types of base exceptions in APIUtils

##### InvalidException

This is used for things that are passed into the web-service that are considered invalid.  For example an invalid username passed in, or if the account does not match the requesting contact.

##### UnknownException

This is used when the requested object cannot be found.  For example if the case 123456 was requested and was not found then this would be a_UnknownCaseException_

#### Generic Contexts

For most web-services, they will contain their own Context classes.  But there are some context classes that are common and reusable.  The primary one being the ContactContext.  The ContactContext is often passed into the method to determine access level.

#### Returned Classes

These are abstraction classes usually representative of a Salesforce object.

* Each field to be returned must be of type WebService
* Each class should have Integer returnCode and String message to be passed back to the caller.
* If the method is to return a List<Object> a wrapper class of APIObjects should contain returnCode, message and a List of Objects.  \[Example below\]
* Each class should have a constructor to aid in creation.  This will save time in the long run and will make writing tests 1000 times easier

_Note:_ You could probably throw exceptions out to the calling service instead of setting a returnCode.  I think that setting the returnCode instead of throwing an exception makes it easier for integration since the integrator does not need to know the exceptions.


### ObjectAPI

This class should be written primarily as a wrapper class for the Object's util class

#### Specific Contexts

If contexts are needed and they will only be used by this API, then they should be included directly in the API file

* Each field must be of type WebService
* Each class should have a constructor to aid in creation
* Do not assume that variables in contexts will be set

#### Methods

Each method should be disparate function of work and contain minimal logic.  These methods should call the required Util methods, transform data, catch exceptions and set returnCode/messages

* Method must be of type WebService
* Method must be static
* Method should return an APIObject
* Method should set the returnCode and the message of the APIObject
* All calls should be in a try-catch block so that no exceptions are leaked

### ObjectUtils

This class should have the majority of the logic.  The methods in this class should follow the idea of Samurai Programming.  Samurai Programming means the method should "return successful or not at all."  This means instead of returning null if an error happens (if the method should return something ie getCase) then the method should throw an exception.

* Most methods will be static
* Methods should throw an exception if the parameters are set incorrectly
* SOQL queries that are single lines should have their exceptions caught, reported then throw the appropriate exception.  For example if we are selecting a single Case using `Case c = [ select ... ]` then we should catch the exception in case the query fails, and then thrown an UnknownCaseException.

## Caveats

* Declaring a class as _virtual_ and then _implementing_ that class to try to have global variables that all classes get do not work.  The fields will not show up in the generated WSDL