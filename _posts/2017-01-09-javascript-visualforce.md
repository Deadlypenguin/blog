---
post_id: 1185
title: 'Javascript and Visualforce: Tips and Tricks'
date: 2017-01-09T10:31:11+00:00
author: pcon
layout: post
permalink: /2017/01/09/javascript-visualforce/
redirect_from:
- /blog/2017/01/09/javascript-visualforce/
thumbnail: /assets/img/2017/01/09/post_thumbnail.png
dsq_thread_id:
- "5449123420"
categories:
- development
- salesforce
tags:
- javascript
- visualforce
---
In the web 7.0 or whatever version of the web we’re in, Javascript is king. Now, there’s lots of stuff you can do directly with Visualforce (like dynamic picklists) but sometimes for the best user experience you’ll want to use Javascript to make it even better. There are lots of Javascript tutorials out there and there are lots of Visualforce tutorials out there (don’t forget [Trailhead](https://trailhead.salesforce.com/en/project/salesforce_developer_workshop/using_javascript_in_visualforce)) so I’m going to talk about some tricks that people should know when working with Javascript on Visualforce

<!--more-->

# Use Static Resources

It’s super convenient to use a CDN to host your Javascript files but this opens you up to lots of security concerns. If you’re just doing your development, using a CDN is fine, but when it comes time to deploy it to production, move your Javascript into a [static resource](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_resources_create.htm). There are two ways that you can do this.

## Single Javascript Files

The easiest way to manage your Javascript static resources is to upload them as a single file and then import them. This is fast and easy to update new versions of files. The downside of this is you end up with lots of static resources in your org and it can be quite painful to manage. After creating your static resource, you can include it in your Visualforce by using the _[includeScript](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_compref_includeScript.htm)_ tag

```xml
<apex:includeScript value="{!$Resource.js_jquery}" />
```

_This assumes that your static resource is named “js_jquery”_

## A zip of Javascript Files

The first method is great if your page only needs a single resource or you ok with having a common version of Javascript file throughout your all of your pages, but most applications have multiple Javascript files per page. If you want to compartmentalize every application so that you can update Javascript versions without affecting other applications. To do this, you’ll want to create a zip file with your files in it (just remember your folder structure) and upload it as a static resource. Then you can include it in your Visualforce by using the _includeScript_ tag again.

```xml
<apex:includeScript value="{!URLFOR($Resource.MyAppResources, 'js/jquery.min.js')}" />
```

_This assumes that your static resource is named “MyAppResouces” and the jquery.min.js file is in a “js” folder._

# Use Endswith Selector in jQuery

If you’ve ever looked at the source of a Visualforce page you’ll see lots of long complicated ids for fields. For example if I have the following Visualforce

```xml
<apex:inputField id="resolutionDescription" value="{!Case.Resolution_Description__c}" />
```

I can get the following HTML generated

```xml
<textarea id="j_id0:form:caseEdit:j_id36:resolutionDescription" ...></textarea>
```

This can lead to problems if you want to run any jQuery against that id. The best way to work around this is to use jQuery’s [ends with selector](https://api.jquery.com/attribute-ends-with-selector/).

```apexscript
var jq_resDesc = jQuery('textarea[id$="resolutionDescription"]');
```

The selection above will find the resolution description

# Use the $Component variable

While I typically use the jQuery trick above, sometimes you need to pass the id of a field to a method and you can’t use jQuery to get it. In that case you can use the [_$Component_](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_access.htm) variable to inject the richfaces id.

```xml
<apex:outputPanel onclick="jsMethod('{!$Component.thePanel}')" id="thePanel">Text</apex:outputPanel>
```

# Use Remote Actions

There are lots of way to push and pull data to Salesforce with Javascript. But I would recommend using [Remote Actions](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_js_remoting_example.htm) whenever possible. The reasoning behind this is that you have the tight binding to the data model that Apex provides as well as the extra assurance provided by Apex testing. By moving most of your logic back into Apex, you don’t have to worry as much about setting up new processes for testing your Javascript.

# Stand on the Shoulders of Giants

There are lots of smart people out there and many of them way smarter than me. Whenever possible, try to see if someone has made your life easier. For example, check to see if anyone has made something to make your Javascript life easier. If you’re developing an application in Angular look at [ngForce](https://github.com/noeticpenguin/ngForce). One of my favorites is [jsforce](https://jsforce.github.io/) which provides many easy ways to interact with Salesforce data.