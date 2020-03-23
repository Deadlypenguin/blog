---
post_id: 1022
title: Opensource Update
date: 2016-07-28T10:16:12+00:00
author: pcon
layout: post
permalink: /2016/07/28/opensource-update/
redirect_from:
- /blog/2016/07/28/opensource-update/
dsq_thread_id:
- "5021437139"
categories:
- development
- salesforce
tags:
- opensource
---
This week is going to be just a social update on a couple of projects that I'm working on.  I've got plans for a big neat post next week.

## Me Code Pretty One Day&#8230;

I was hoping to present this at Dreamforce this year but it doesn't look like that's going to happen.  So instead I'll just talk briefly about it here

**Apex Styleguide** &#8211; [Link](http://pcon.github.io/apex-styleguide/) &#8211; I've been asked several times what our team does for it's code style and I've been working on an online style guide.  It's really a work in progress and will probably pivot a bit once Apex Checkstyle is complete.  Right now all the rules are enforced by regexes and it doesn't scale well and has a lot of false positives.  If you want to create your own styleguide, feel free to fork [the project](https://github.com/pcon/apex-styleguide/).  I'll add build instructions for the site soon to make this easier.

**Apex Checkstyle** &#8211; [Link](https://github.com/solenopsis/checkstyle) &#8211; This has been something that's been in the works for a while.  Initially I tried to just make an extension to Checkstyle but there was just too many problems with that.  So instead I completely forked Checkstyle and modified the grammar to help support Apex.  While the project builds and it works on some very simple Apex code, it's nowhere near ready for the big time.  I'm going to keep working on it and hopefully someday soon it'll be ready.

## Other Projects

**Escalations** &#8211; [Link](https://github.com/RedHatSalesforce/escalations) &#8211; Another project still very much in it's infancy.  The idea behind this is to make an easy way for support centers to track escalations to cases.  The plan is to have this both as a managed package as well as having the source available if you want to install it as unmanaged code.

**SalesforceApps** &#8211; [Link](https://github.com/pcon/SalesforceApps) &#8211; This is just a repo for random code that I've worked on that others may find useful.  Right now I think the most useful bits are under the node_scripts directory.

**Hands On Training** &#8211; [Link](http://pcon.github.io/handsontraining/) &#8211; Training is in my blood and it's something I've always loved doing.  You should checkout my hands on training.  I have plans to migrate some others over to it as well as writing a couple more.  You can follow the [project](https://github.com/pcon/handsontraining) if you want to be notified of updates.