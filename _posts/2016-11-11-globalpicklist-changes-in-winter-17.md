---
post_id: 1160
title: GlobalPicklist changes in Winter '17
date: 2016-11-11T10:31:46+00:00
author: pcon
layout: post
permalink: /2016/11/11/globalpicklist-changes-in-winter-17/
redirect_from:
- /blog/2016/11/11/globalpicklist-changes-in-winter-17/
dsq_thread_id:
- "5296225812"
categories:
- development
- salesforce
tags:
- solenopsis
---
Like many companies, we have a deployment process in place to handle changes in seasonal releases in Salesforce so that when a sandbox is ahead of production, we can still deploy to both without having to wait for production to be updated.  Then, after both the release hits production, we go through a manual process of updating the API (primarily the ant-salesforce.jar) and the metadata to the most recent API version.  Typically this just involves updating the jar and updating the API version in the request, pulling down the updated metadata and writing it to SCM.  However, with the Winter '17 release we saw a problem trying to deploy our GlobalPicklist files after updating the API.

<!--more-->

# The Problem

After updating the API and trying to do a deployment we got the cryptic error

```
Error: Not available for deploy for this API version
```

The error goes away if the API version is rolled back to version 37.0

# The Solution

Big shout out here to both [Daniel Ballinger](https://twitter.com/FishOfPrey) and [Christian Carter](https://twitter.com/cdcarter) for helping me find the solution.  It turns out that in API 38.0, Salesforce has changed the names of picklists and how they are represented in the Metadata.  (This folks is why you should always read the [release notes](https://releasenotes.docs.salesforce.com/en-us/winter17/release-notes/rn_forcecom_picklists_new_api.htm))  So in order to support API version 38.0 you will need to update your package.xml to include "GlobalValueSet" instead of "GlobalPicklistValue"  We've also [updated](https://github.com/solenopsis/Solenopsis/commit/7f189c512895087c65c109a2a6e0c9e57a0e0815) [Solenopsis](http://solenopsis.org/Solenopsis/) to handle this new metadata type.