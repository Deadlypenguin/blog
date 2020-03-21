---
post_id: 1154
title: Japanese Users and Reports
date: 2016-11-04T07:41:56+00:00
author: pcon
layout: post
permalink: /2016/11/04/japanese-users-reports/
redirect_from:
- /blog/2016/11/04/japanese-users-reports/
dsq_thread_id:
- "5277944265"
categories:
- development
- salesforce
tags:
- admin
- reporting
---
There are lots of times where working with Salesforce would be so much easier if it weren't for the users.  But, they're the reason I still have a job, so you've got to put up with them.  One of the problems with users is they tend to like to live all over the world and they all have their own ways of working and cultural eccentricities.  One of the ones that has caused us grief in the past (both in Apex and in reports) is the fact that Japanese users in Salesforce default to "Lastname Firstname" when using the Name field on Users.   Now, this in and of itself is not really a problem because lots of reports are written for a single user or for a relatively small group of users (such as others in the same geographical location).  Where this becomes a problem is when locales get mixed with reports and all hell breaks loose.

<!--more-->

# The Problem

I've seen this issue before in some Apex testing but it was just a minor nuisance and was quickly dismissed as "a quirk of Salesforce."  It wasn't until last week when a co-worker of mine ([Amber](https://about.me/amber.boaz)) ran into an issue with reporting.

In our scenario we are writing a report to see every case that Jane Everywoman is the owner of.  Jane's locale is set to "Japanese (Japan)" and our locale is set to "English (United States)."  If we write a report to show all of Jane's cases, we'd get something like this:

![Report View](/assets/img/2016/11/04/reportView.png)

As we can see, Jane has two cases that she is the owner for.  Now, being good managers we want to share this report with Jane so see can see the same metrics we see.  However, when Jane loads this report she sees zero cases.

![Jane's View](/assets/img/2016/11/04/janeView.png)

# The Explanation

So, why is this happening?  It all comes down to locales.  In the Japanese locales, names are presented in a different order than they are in English locals.  So when Jane loads the report, her name is presented to her as "Everywoman Jane" and thus the report does not find any users. (The name difference probably exists for other locales, but I know it exists for Japanese)

# The Solution

The solution to this isn't particularly elegant but it's easy and it works.  You just have put the name in both formats.  So update the filter criteria to include both "Jane Everywoman" and "Everywoman Jane" and your report will work for both locales.

![Correct Report](/assets/img/2016/11/04/correctReport.png)