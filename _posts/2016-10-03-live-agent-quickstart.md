---
post_id: 1142
title: Live Agent Quickstart
date: 2016-10-03T08:00:15+00:00
author: pcon
layout: post
permalink: /2016/10/03/live-agent-quickstart/
redirect_from:
- /blog/2016/10/03/live-agent-quickstart/
dsq_thread_id:
- "5192641556"
categories:
- development
- salesforce
tags:
- liveagent
- quickstart
---
With the recent updates to the licensing model at Salesforce, lots of companies now get Live Agent licenses included.  Because of this I'm working on a hands-on training for how to setup Live Agent and use it in Service Console.  As you could guess, this isn't an quick thing to do so I'm splitting it up into parts.

# Quickstart

## Why?

One of the hardest parts of Live Agent to test out for non-developers is the actual web front end part.  If write the HTML locally and then you can test it but others can't.  To make it so others can test it, you either have to set up a web server or figure out how to deploy it to a cloud provider such as [Heroku](https://heroku.com/) or [Openshift](https://www.openshift.com/).  And that can be pretty daunting for someone that's just trying to setup a proof of concept or is just working on the configuration side and will pass it off to someone else from their web team.

<!--more-->

## What does the quickstart provide?

The [Live Agent quickstart](https://github.com/pcon/liveagent-quickstart) I wrote provides a super fast way to deploy a Live Agent button to Heroku.  Once you have set up Live Agent, you can copy and paste parts of the configuration into the first screen of the Heroku app setup and then click deploy.  After a couple of minutes you have a website that anyone can goto and interact with your chat button!

# What's Next

Similar to the [entitlement process](http://pcon.github.io/handsontraining/entitlements/) hands on training, I'll be publishing it to [github](http://pcon.github.io/handsontraining/entitlements/) for everyone to use (and fork if desired).  It's going to take some time since it's a lot of brand new content but I'm hoping to have it done before the end of the year.  So, follow [here](http://blog.deadlypenguin.com/blog/feed/) and at the [github repo](http://pcon.github.io/handsontraining/entitlements/) to keep informed of it's progress.