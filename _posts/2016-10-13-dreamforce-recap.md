---
post_id: 1145
title: Dreamforce recap
date: 2016-10-13T16:56:44+00:00
author: pcon
layout: post
permalink: /2016/10/13/dreamforce-recap/
redirect_from:
- /blog/2016/10/13/dreamforce-recap/
dsq_thread_id:
- "5221152135"
categories:
- development
- salesforce
tags:
- dreamforce
---
So it's been a week since the end of Dreamforce 2016 and I've had some time to soak in what was talked about.  This year my task for Dreamforce was to go and get some pretty specific answers.  So, instead of talking about everything that happened at Dreamforce and what I think about it, I'm going to talk about the three things I was tasked with looking into.

<!--more-->

# Lightning for Service

This is a pretty big thing.  Salesforce has been pushing Lightning hard and it's the way that the platform is headed.  Unfortunately for us (and many customers like us), it's just not ready to be used.  Currently Service Cloud isn't supported in Lightning.  You can stylize the Service Console to look more like Lightning but it's not really Lightning.  The question I wanted to get answered is "when?" and more importantly "when with Live Agent?"  The answer, probably not until Winter '18 for Service in general and probably not until Spring '18 for Live Agent.  Now, these dates are subject to change, but they gave me a good enough timeline.  We'll start prepping for the Lightning move now by making sure that any new Visualforce pages or components we write will either be in Lightning or easy enough to convert over to Lightning.  But as it stands there's no rush for us to get ready.

# Developer Tools

Salesforce DX was one of the biggest talked about things at the [Developer Keynote](https://www.youtube.com/watch?v=RMKFTLtn0-E).  The tech is pretty neat but the question that I've been asked is "what does it mean for big orgs?"  In my opinion, the deployment / retrieval parts probably won't blow you away if you've already got a robust tool chain.  We use [Solenopsis](http://solenopsis.org/Solenopsis) and have configured it heavily to work well with our flow so re-doing our flow to work with the new CLI or customizing it to work with our flow doesn't make sense.  However some of the features that are going to be released around scratch orgs may be of use to big orgs and will be of use to ISVs.  Personally, I'm more excited around the APIs that this provides so that you don't have to use Salesforce's CLI but you can instead use the APIs directly.  Again, the tentative release date I heard for this is Winter '18 so it'll be a little while.

# Chat

Lastly, I was sent to look for a replacement for Live Agent.  Live Agent works pretty well but it has some limitations around being only supported in the Service Console and the fact that the APIs only deal with client interaction not with agent interaction.  This means that you cannot customize the agent experience and cannot make the experience available outside of the console.  Unfortunately I did not really see any vendors at Dreamforce that were offering any Live Agent style agent/customer chat.  For this, it looks like we'll need to go with an Opensource framework and then extend it to have the chat records stored in Salesforce against Salesforce objects.