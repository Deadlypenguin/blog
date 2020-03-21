---
post_id: 106
title: irssi + mumbles == push notification goodness
date: 2009-08-31T15:12:32+00:00
author: pcon
layout: post
permalink: /2009/08/31/irssi-mumbles-push-notification-goodness/
redirect_from:
- /blog/2009/08/31/irssi-mumbles-push-notification-goodness/
dsq_thread_id:
- "1812093470"
categories:
- linux
tags:
- irssi
---
One of the biggest problems with irssi is that if you run it on remote machine, it can be quite hard to get notifications.  For the past couple of years, I've been running a plugin called fnotify that writes notifications to a file, then using another script I read that file and print it out with libnotify.  There are a couple of problems with this:

1. libnotify is ugly
2. takes up diskspace if you don't clear the queue
3. requires you to either have the script, or remember the ridiculously long command

Well, these are things of the past.  Thanks to [mumbles](http://sourceforge.net/projects/mumbles/)!

First install mumbles from yum (or source) then install the [irssi script](http://deadlypenguin.com/code/growlNotify/growlNotify.pl).  Make sure you change the _growl_server_ and _growl_password_ then you are good to go.  The script has a dependency on Net::GrowlNotify in perl.

The script uses irssi config variables so you can use `/SET growl_server` or `/SET growl_password` to set your growl server/password without having to load/unload the script.