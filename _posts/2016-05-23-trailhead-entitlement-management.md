---
post_id: 926
title: 'Trailhead: Entitlement Management'
date: 2016-05-23T12:30:34+00:00
author: pcon
layout: post
permalink: /2016/05/23/trailhead-entitlement-management/
thumbnail: /assets/img/2016/05/23/post_thumbnail.png
redirect_from:
- /blog/2016/05/23/trailhead-entitlement-management/
dsq_thread_id:
- "4841541482"
categories:
- development
- salesforce
tags:
- entitlements
- trailhead
---
It's a pretty well known fact that I'm a big fan of Entitlement Management.  I've given a Dreamforce talk, been [recorded](https://www.youtube.com/watch?v=FC-kPyRGi2E) by SalesforceU, and even have a [github repo](http://pcon.github.io/handsontraining/entitlements/index.html) for it (it's a work in progress).  So when I heard that the Trailhead team was releasing a new [Entitlement Management module](https://developer.salesforce.com/trailhead/module/entitlements) I was ecstatic.

<!--more-->

# The Module

Last week [the module](https://developer.salesforce.com/trailhead/module/entitlements) was finally released!  Let's take a look at it's parts.

## Getting Started with Entitlements

One of the hardest parts of using Entitlements in Salesforce is just figuring out why you should use entitlements and how they interact with accounts and products.  This unit discusses what entitlement management offers, how to make entitlement templates and how to add an entitlement to an account.  While all three of these steps may seem simple, it is a bunch of work because most of the layouts do not include the correct related lists and you have to add them.  Additionally, entitlement management is not enabled by default, so you have to turn it on to even get started.

## Setting Up Required Support Steps

This unit is where the real meat of the module is.  Again, the steps that are done in this unit of creating milestones, creating entitlement processes and adding milestone actions may sound simple, but they are anything but.  If for no other reason than the shear number of clicks involved setting these things up is a massive undertaking.  The unit does a fantastic job of both showing how to do it as well as what you are doing.

## Using Entitlements in Customer Cases

While this is the smallest of the three units, it is where it all comes together.  Here you'll learn how to take all the groundwork you laid previously and use it to show your remaining SLA time on your cases.

# The Good

I'm really glad that this module got made.  Entitlement management seems to be something that a good chunk of the Salesforce user base either doesn't understand or doesn't know how to use properly.  Coming from a support organization, I understand how SLAs and entitlements can really drive cases forward.  This module acts as a great first step in understanding what you can do with entitlements and milestones.

I do want to make a special shout-out to the fact that a milestones do not auto-close is specifically called out in the last unit.  This is something that can puzzle new people and I'm glad that it's given it's own hi-lighted box.

# Room for Improvement

The biggest gripe I have with this module is that last two units are quiz challenges and not checked challenges.  I understand that doing this would make the overall module time much longer and that it is difficult to check, but I think that it's an important part of the process and I fear that people will feel they understand how entitlements work because they've passed the quiz.  Most of this concern probably stems from the people that don't actually work through the module, but instead skip to the bottom just to do the challenge and get the points.  So, it may be a moot point anyway.

Some minor nits to pick are that the entitlement fields have to be manually added to the layout if you want to set/change the entitlement by hand and it's not mentioned in the last unit.  I also wish that business hours were discussed as well.  The use of business hours for support organizations without a follow the sun model is very important and it would be nice to be talked about more.  Maybe it'll make it into the advanced entitlement process module.