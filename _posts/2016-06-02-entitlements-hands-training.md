---
post_id: 935
title: Entitlements Hands-on Training
date: 2016-06-02T11:15:57+00:00
author: pcon
layout: post
permalink: /2016/06/02/entitlements-hands-training/
redirect_from:
- /blog/2016/06/02/entitlements-hands-training/
dsq_thread_id:
- "4878152442"
categories:
- development
- salesforce
tags:
- entitlements
- handsontraining
---
At Dreamforce 2015, I wrote a hands-on training for Salesforce University and presented it both as a Dreamforce session, as well as recorded it for use on [their site](http://www.salesforce.com/campaigns/success-services/sfu-hands-on-training-sessions.jsp).  I had a great time writing the content as well as delivering it in their studio.  However, the problem is that the content is locked in place and the content isn't 100% correct.  Since publishing it, I've found some typos in the guide as well as some mistakes in time calculations.  Because of this, I wanted to make the training available in a format that was easier to update as well as easier for people to report issues against.

<!--more-->

# Hands-on Training Site

Because of this, I started a [Github repo](https://github.com/pcon/handsontraining/) to contains a web version of the hands-on training.  This was originally started just before Dreamforce and was done as completely static HTML files.  This meant any update to navigation, style or anything else that crossed multiple files was a nightmare.  However, it was a nightmare that I didn't see a way around because I knew I wanted it hosted on [Github pages](https://pages.github.com/).  So this meant that I lost all of my steam trying to update these pages and work on the site ground to a halt.

A couple of months ago I started working on an Apex Styleguide and wanted to build a Github page from that.  After doing some research, I found that using gulp, you can generate the static HTML from templates and push it to a Github page really easily.  I have lost the original site that I gleaned most of this information from, but here's the gist of how it works.

1. When a commit is made to master, [TravisCI](https://travis-ci.org/pcon/handsontraining) picks up the commit
2. [TravisCI](https://travis-ci.org/pcon/handsontraining) calls the gulp deploy command
3. gulp then compiles all of the templates into static HTML and deploys it to the gh-pages branch via the [gulp-gh-pages](https://www.npmjs.com/package/gulp-gh-pages) module.

To the end user, this doesn't mean much, but to me the content creator, it means that my wrapper HTML that contains my navigation and style is separated from my content.  This means that now I only have to update navigation in one place and gulp will regenerate all of my static HTML for me.  After implementing this, I finally had the steam I needed to finish up the site.  So, almost 8 months of waiting, I present to you my [hands-on training site](http://pcon.github.io/handsontraining/).

If you see any issues, or have ideas for content you'd like to see, feel free to post them [here](https://github.com/pcon/handsontraining/issues).

# What's Next?

My hope is that I will be able to write new content for this site to help folks learn.  My next short-term goal is to convert my [bulk hands on training](https://github.com/pcon/bulkhandson) into real content with steps and solutions.