---
post_id: 554
title: 'Trailhead Modules: My Favorites'
date: 2015-03-19T09:32:46+00:00
author: pcon
layout: post
permalink: /2015/03/19/trailhead-modules-favorites/
redirect_from:
- /blog/2015/03/19/trailhead-modules-favorites/
dsq_thread_id:
- "3608849242"
categories:
- development
- salesforce
tags:
- trailhead
---
I've blogged previously about [Trailhead](https://developer.salesforce.com/trailhead "Trailhead") and some of the [new modules](/2015/02/03/salesforce-trailhead-new-modules/ "Salesforce Trailhead: New Modules"), but I thought I'd take the opportunity to write about two of the modules.  Both the Change Management and Apex Testing are near and dear to my heart.

<!--more-->

# What is Trailhead?

At the 2014 Dreamforce, Salesforce announced [Trailhead](https://developer.salesforce.com/trailhead), their new platform for learning all about the Salesforce platform, and I have to say it's pretty great.  Anytime someone asks me how they can get started with Salesforce, "Trailhead" is pretty much the first thing out of my mouth.  Well that and the IRC channel.

# The Apex Testing Module

[![Trailhead: Apex Testing](/assets/img/2015/03/19/apex_testing.png)](https://developer.salesforce.com/trailhead/module/apex_testing)

Apex testing is one of the least sexy things you can talk about, but for some strange reason, I love talking about it.  I've done [blog posts](/2014/07/23/intro-to-apex-auto-converting-leads-in-a-trigger/ "Intro to Apex: Auto converting leads in a trigger"), [talks about testing](http://pcon.github.io/presentations/testing/ "Apex Testing for Humans") and even have an [upcoming series](/testing/ "Testing Salesforce Apex Code") on testing.  So when I saw that Apex Testing had it's own [Trailhead Module](https://developer.salesforce.com/trailhead/module/apex_testing "Trailhead: Apex Testing"), I was so happy.

If you haven't revisited this module since the [last update](/2015/02/03/salesforce-trailhead-new-modules/) there have been some hands-on challenges added, so I would really recommend revisiting it.

## Getting Started with Apex Unit Tests

During [this module](https://developer.salesforce.com/trailhead/apex_testing/apex_testing_intro) you'll learn the benefits of Apex unit tests, how to write unit tests and how to execute those tests.  One of my favorite things about this sub-module is that it talks about how to increase coverage as well as testing strategies.

After the [last update](http://blog.deadlypenguin.com/blog/2015/02/03/salesforce-trailhead-new-modules/) there is now a hands-on challenge to write a test class for a class provided by Salesforce.  The nice thing about this is that it gives someone a chance to see how to write tests for code that they did not write.

## Testing Apex Triggers

[This module](https://developer.salesforce.com/trailhead/apex_testing/apex_testing_triggers) covers one of the most common uses for Apex code, the trigger.  It covers how to write a test for triggers and how to run them.  The challenge for this section is to add a test for a fairly basic before trigger that validates the name of a contact.

The one thing I wish that this sub-module would cover is bulk testing of a trigger.

## Creating Test Data for Apex Tests

Of all the sub-modules, [this module](https://developer.salesforce.com/trailhead/apex_testing/apex_testing_data) is my favorite.  It covers how to create a utility class to generate your test data and how to re-use that utility class in multiple tests.  The challenge for this module has you write your own utility class.

# The Change Management Module

[![Trailhead: Change Management](/assets/img/2015/03/19/change_management.png)](https://developer.salesforce.com/trailhead/module/app_deployment)

If Apex Testing is un-sexy, change management is even worse.  However un-sexy it is, change management is a must for any real Salesforce team doing development.  This module does a good job of covering all the parts without getting to dry and boring.  Each section should take approximately 15 minutes and most have a video to help cover the content.

## Deploying Changes Safely

[This module](https://developer.salesforce.com/trailhead/app_deployment/app_deployment_intro "Deploying Changes Safely") covers how to make changes safely in production, what a safe change is and covers the concepts and terms that are used in later modules.  The challenge for this section is a quiz that covers the topics covered.  This is section is a little lighter than the others, but it introduces all of the concepts and terms.

## Developing and Testing with Sandbox

[This module](https://developer.salesforce.com/trailhead/app_deployment/app_deployment_sandbox "Developing and Testing with Sandbox") covers lots of topics dealing with developing in sandboxes.  It covers how many sandboxes each edition has (how how large each sandbox type is), how to create and manage sandboxes and how to use templates for them. This section's challenge is a quiz that covers the topics.

## Deploying from Sandbox with Change Sets

One of the best ways for small or new development teams to deploy to production is via change sets.  [This module](https://developer.salesforce.com/trailhead/app_deployment/app_deployment_changesets "Deploying from Sandbox with Change Sets") covers how to configure your environment to use them, how to create them and how to deploy them. Again this section's challenge is a quiz.

## Managing Change with a Governance Framework

An often overlooked part of development strategies is governance.  [This module](https://developer.salesforce.com/trailhead/app_deployment/app_deployment_governance "Managing Change with a Governance Framework") covers why your team should have governance, how to create a strategy and how to extend that strategy to designing your code.  As with the other modules, this one wraps things up with a quiz.

# Summary

While [Apex Testing](https://developer.salesforce.com/trailhead/module/apex_testing "Apex Testing") and [Change Management](https://developer.salesforce.com/trailhead/module/app_deployment "Change Management") may not be the most fun things to learn about, they are both very important topic.  I'm very happy that Salesforce has added [Trailhead](https://developer.salesforce.com/trailhead "Trailhead") modules for both of these topics.  To me it show that they also care about having information about all facets of their product, not just the new hotness.