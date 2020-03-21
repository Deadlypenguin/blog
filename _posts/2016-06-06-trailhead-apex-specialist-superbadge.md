---
post_id: 945
title: 'Trailhead: Apex Specialist Superbadge'
date: 2016-06-06T10:49:58+00:00
author: pcon
layout: post
permalink: /2016/06/06/trailhead-apex-specialist-superbadge/
redirect_from:
- /blog/2016/06/06/trailhead-apex-specialist-superbadge/
dsq_thread_id:
- "4888238573"
categories:
- development
- salesforce
tags:
- apex
- trailhead
---
Salesforce has released a new section under Trailhead called [Superbadges](https://developer.salesforce.com/trailhead/super_badges), and they're pretty awesome.

# Superbadges?

[Superbadges](https://developer.salesforce.com/trailhead/superbadges-overview).

So if you're familiar with [Trailhead Projects](https://developer.salesforce.com/trailhead/projects), Superbadges are very similar to these but instead of guiding you through the process, you are given a set of requirements and you are required to implement it.  All of the badges have requirements that you must meet before you can even start them.  This is nice because it encourages you to learn the content before diving in.  This way, the challenge of the badge is just building on your existing skills instead of teaching you new ones. For the first release, there are four Superbadges that you can earn:

<!--more-->

## Apex Specialist

![Apex Specialist](/assets/img/2016/06/06/apex_specialist.png)

I'm going to go into depth a little bit more about the Apex Specialist badge a little later on, but this one focuses heavily on apex customization via triggers, scheduled apex and apex callouts.

## Lightning Experience Specialist

![Lightning Experience Specialist](/assets/img/2016/06/06/lightning_experience_specialist.png)

The lightning experience badge covers the Lightning Experience UI, process builder and app builder to build a sales process.

## Reports & Dashboards Specialist

![Reports and Dashboards Specialist](/assets/img/2016/06/06/report_dashboard_specialist.png)

The reports & dashboard badge covers importing survey and opportunity data and building reports and dashboards in both classic and lightning.

## Security Specialist

![Security Specialist](/assets/img/2016/06/06/security_specialist.png)

The security specialist badge covers security of data via profiles, record-level security and setting up user reporting as well as user authentication security.

# Apex Specialist

A couple of weeks ago, I was given a chance to preview this badge and give some feedback and I have to say I was blown away by this.  I love the fact that you are given a use case and then you have to figure out how to complete it.  A cool feature also is that if you get a challenge correct on the first try, then you get the "first ascent" modifier.  Get all of them on the first shot and you get it on the overall badge.  So, take your time and do it right the first time.

The prerequisite badges for this are Apex Triggers, Apex Testing, Asynchronous Apex and Apex Integration Services.  This means that you will have to complete all of these badges before you can start on the Superbadge.

## Pre-work

This section simply tells you what you need to do to get started.  Please, please, please read this and please, please, please create a new developer edition.  This badge requires some heavy customization and if you do not, then you could have other work conflict.  You can use a different developer org for your challenges than your "Trailhead account" and if you need help, watch this video for more information

[![Using Multiple Developer Orgs with Trailhead](http://img.youtube.com/vi/1rKrBR5qbTg/0.jpg)](https://youtu.be/1rKrBR5qbTg)

## Automate Maintenance Requests

This is where the meat of the work is.  During this you'll setup your objects, write your triggers and make sure they are bulkified.  While tests are not required at this point, I would highly recommend that you go ahead and write them so that you can get that first ascent modifier.  The code itself isn't too difficult to write but it's a good example of how to make your triggers bulk ready.  If you did not, then it would be very easy to hit governor limits because of the requirement to pull data from other objects.

## Synchronize Inventory Management

During this section, you will write code that pulls data from a REST endpoint and updates / creates data for a nightly job.  This type of integration is pretty common and it's a nice way to show how it could be used in the real world instead of having the external system push into Salesforce.  I would recommend reading over [this article](http://blog.deadlypenguin.com/blog/2015/11/30/json-deserialization-in-salesforce/) if you want a leg up on parsing the JSON data that comes back from the REST endpoint.

## Create Unit Tests

As stated before, I'm a nutball when it comes to unit testing so I was very happy to see that it was a required part of this badge.  You will have to write code that gives you a 100% coverage which is nice because it requires you to think about your code and make sure you can get into every nook an cranny.

# Conclusion

I've written a bunch of articles about Trailhead and I'm a big fan of it as a learning platform.  I love the Superbadges as a way to force you to solve the problem instead of just parroting what you just learned.  I look forward to the new Superbadges that come out and hope to dive into the ones that I'm not as comfortable with soon.