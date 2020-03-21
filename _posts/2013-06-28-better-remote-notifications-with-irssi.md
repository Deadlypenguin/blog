---
post_id: 273
title: Better remote notifications with irssi
date: 2013-06-28T14:34:40+00:00
author: pcon
layout: post
permalink: /2013/06/28/better-remote-notifications-with-irssi/
redirect_from:
- /blog/2013/06/28/better-remote-notifications-with-irssi/
aktt_notify_twitter:
- 'no'
dsq_thread_id:
- "1807942298"
categories:
- development
- linux
tags:
- irc
- irssi
---

<div class="notification is-warning is-light">This has been <a title="Even better remote notifications with Irssi" href="/2013/07/26/even-better-remote-notifications-with-irssi/">deprecated</a> in for the new script and configuration.
</div>

# History

As I [wrote about a long time ago](/2009/08/31/irssi-mumbles-push-notification-goodness/ "irssi + mumbles == push notification goodness") I use to use a custom script with irssi to push to mumbles. Well, mumbles has gone defunct and I couldn't really find a good growl client for linux. Plus with me traveling into the office weekly, it's just not going to work well since growl is more push notification. So this lead me to research a true messaging system to try it.

# Beanstalkd

[Beanstalkd](http://kr.github.io/beanstalkd/) is a simple fast workqueue.  Using this, we can push messages (in JSON formatting) to the queue and have the client pull from the queue whenever they want.  The nice thing about designing it this way is it can be reused to push other desktop notifications from other systems.

You can find the full repo with updated documentation on [github](https://github.com/pcon/irssi/tree/master/beanstalkNotify)

# Setup

* Install _beanstalkd_ on a system that both your irssi client _(producer) _and the system you want notifications on _(consumer)_

### Producer

* Install the _JSON_ perl module as well as the _Queue::Beanstalk_ module
* Download the _[beanstalkNotify.pl](https://raw.github.com/pcon/irssi/master/beanstalkNotify/beanstalkNotify.pl)_ file into your _~/.irssi/scripts/_ directory

### Consumer

* Install _pyyaml_ and _beanstalkc_. These can be installed via python-pip
* Download the _[beanstalk-notify.py](https://raw.github.com/pcon/irssi/master/beanstalkNotify/beanstalk-notify.py)_ file onto your _consumer_ system

# Configuration

### Producer

* Install the script by running _/script load beanstalkNotify _in irssi
* Set your server _/set beanstalk_server beanstalk.example.com_
* Set your port _/set beanstalk_port 12345_

### Consumer

* Modify the _beanstalk-notify.py_ file to point to your beanstalkd server
* Run the consumer script

# Future Features

In the future I plan on adding the ability to add an audible notification for these as well.  Maybe I'll add the ability to pick a specific queue instead of the default, but I doubt it.