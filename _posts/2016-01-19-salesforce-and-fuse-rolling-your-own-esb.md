---
post_id: 769
title: 'Salesforce and Fuse: Rolling your own ESB'
date: 2016-01-19T15:24:51+00:00
author: pcon
layout: post
permalink: /2016/01/19/salesforce-and-fuse-rolling-your-own-esb/
thumbnail: /assets/img/2016/01/19/post_thumbnail.png
redirect_from:
- /blog/2016/01/19/salesforce-and-fuse-rolling-your-own-esb/
dsq_thread_id:
- "4505505456"
categories:
- development
- salesforce
tags:
- fuse
- messaging
---
There are lots of reasons why you would want to send data from Salesforce to a third party system.  A simple example that comes to mind is to index your Salesforce data for external searching.  Now, there are lots of 3rd party companies that you can do integration with, but most of these are externally hosted and do not give you the granular control that you may want or they may not give you access to your backend systems in a way you want.

<!--more-->

# Salesforce and Fuse

This is where JBoss Fuse comes into play.  [JBoss Fuse](http://www.jboss.org/products/fuse/overview/) is an open source, lightweight and modular integration platform with a new-style Enterprise Service Bus (ESB) that supports integration beyond the data center.  If you have Java experience you can take incoming messages from Salesforce and push them into Fuse.  The integration of Salesforce and Fuse will allow you then take your Salesforce data and push it or modify it however you see fit.

# Getting Started

Since this type of integration is highly subjective I will not go into much detail about how to write the actual integration part but I will show you how to get started taking Salesforce messages and accepting them in Fuse.

## Prerequisites

You will need to have installed and configured the following:

* [JBoss Fuse](http://www.jboss.org/products/devstudio/download/)
* Maven
* git

You will also need a publicly routable IP address or hostname.  It is important that this address be accessible from the Internet at large so that messages can be delivered.  Using your local address (192.168.1.15 for example) will **NOT** work.

## Salesforce configuration

Inside of Salesforce you need to determine what object you want to send messages from.  You'll then create an outbound message under Setup ⇨ Workflow & Approvals ⇨ Outbound Messages

![Outbound Message setup step 1](/assets/img/2016/01/19/outbound_message_setup_step1.png)

After selecting your object you'll set the name, the endpoint and select the fields you want to send with the outbound message

![Outbound Message setup step 2](/assets/img/2016/01/19/outbound_message_setup_step2.png)

Then we'll want to download the WSDL to use in our Fuse instance.  This file will be used later so don't misplace it! (or you'll just be back here again trying to remember where you downloaded it from)

![WSDL download](/assets/img/2016/01/19/wsdl_download.png)

Now that we have a new outbound message, we need to send our message when something happens.  For this example we want to send a message anytime an update occurs to the case.  So we'll create a workflow that fires on all updates.

![Case workflow](/assets/img/2016/01/19/case_workflow.png)

Now we'll add the existing action of our outbound message

![Existing action](/assets/img/2016/01/19/exsisting_workflow.png)

Now we'll send an outbound message for every update that happens on a case (just don't forget to activate it).

![Completed workflow](/assets/img/2016/01/19/completed_workflow.png)

## Fuse configuration

Now that we have a outbound message being generated from our Salesforce instance, let's set up a place for those messages to go.  You'll want to clone the [salesforce-fuse](https://github.com/pcon/salesforce-fuse) git repository.  This will give you the base framework you need to accept your message and process them.  After cloning the repository, take your WSDL from before and replace the [OutboundMessage.xml](https://github.com/pcon/salesforce-fuse/blob/master/src/main/resources/OutboundMessage.wsdl) in the repository.

Now we'll build it.  Simply run `mvn clean install` to build our repo.

Then import it into Fuse with the following commands

```
features:install cxf
osgi:install -s mvn:com.example.salesforce/soap/${project.version}
```

Now the /cxf/Salesforce endpoint should be available.  If you update or create a case in your org and watch the `osgi:log` command you'll see the Case Number and Subject being logged out.

# Next Steps

After you've got it set up, you'll want to customize it to do what your company needs.  This could be pushing the message to a [Camel](http://camel.apache.org/) queue, calling another web service, writing it to a database, etc.  You'll want to start your code execution path in the [NotificationBindingImpl.java](https://github.com/pcon/salesforce-fuse/blob/master/src/main/java/com/sforce/soap/_2005/_09/outbound/NotificationBindingImpl.java) class.  If you want to reject a message, you'll want to change the return from true to false

# Considerations

This is a true messaging platform.  Because of this there is retrying natively built into the platform.  You can check the status of your messages to see if any are failing by looking under Monitor ⇨ Outbound Messages.  Also, if you only have a single messaging endpoint setup (or you don't want to have your developer messages going to a production host), you may want to look at the [salesforce-blackhole](https://github.com/pcon/salesforce-blackhole) app.  This will accept any message and will simply return back OK regardless of it's content.