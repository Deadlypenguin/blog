---
post_id: 303
title: Even better remote notifications with Irssi
date: 2013-07-26T14:24:54+00:00
author: pcon
layout: post
permalink: /2013/07/26/even-better-remote-notifications-with-irssi/
redirect_from:
- /blog/2013/07/26/even-better-remote-notifications-with-irssi/
dsq_thread_id:
- "1801967363"
categories:
- development
- linux
tags:
- irssi
- irc
---
[Last month](/2013/06/28/better-remote-notifications-with-irssi/ "Better remote notifications with irssi") I wrote a Irssi plugin that pushed messages from Irssi to Beanstalkd.  I was pretty happy with it, but I wanted more.  So, I've improved it.  The new version pushes in a slightly more normalized json payload to one of two beanstalk tubes.  The tubes are configured for _here_ and _away_. Then the python script that consumes them either displays it via a notification pop up, if sent to the _here_ tube, or to pushover if sent to the _away_ tube.

# Setup

1. Install beanstalkd on a system that both the irssi client <em>(producer)</em> and the system the notifications will be displayed on <em>(consumer)</em> can access via the network
2. Install and configure the [beanstalkNotify.pl](https://github.com/pcon/irssi/blob/master/beanstalkNotify/beanstalkNotify.pl) script in irssi
    1. Set _beanstalk_server_ to the address of your beanstalkd server
    2. Set _beanstalk_port_ to the port of your beanstalkd server
    3. Set _beanstalk\_here\_tube_ to the tube name you want _(optional)_
    4. ****Set _beanstalk\_away\_tube_ to the tube name you want _(optional)_
3. If you want to use pushover for your away notifications, do the following.  Otherwise, set your _beanstalk\_away\_tube_ in step 2D to the same as your _beanstalk\_here\_tube_
    1. Purchase [pushover](https://pushover.net) on your preferred platform [[android](https://play.google.com/store/apps/details?id=net.superblock.pushover) / [ios](https://itunes.apple.com/us/app/pushover-notifications/id506088175?ls=1&mt=8)]
    2. Create a [new](https://pushover.net/apps/build) application
    3. Copy your application key and user token from your account settings
4. Download and configure [beanstalk-notify.py](https://github.com/pcon/irssi/blob/master/beanstalkNotify/beanstalk-notify.py) on your consumer system
    1. Run the script _python beantalk-notify.py start_ to generate the directories and basic configuration
    2. Modify the _~/.beanstalk-notify/beanstalk-notify.conf_
        1. beanstalk
            1. server: The address / hostname to your beanstalk server
            2. port: The port for your beanstalk server
            3. clear\_on\_start: If the tubes should be emptied on start. This keeps from flooding you with notifications if the daemon has not been run in a while
            4. away_tube: The name of the tube for pushover messages
            5. away_ignore: A comma separated list of server names (from irssi) to ignore when sending notifications
            6. here_tube: The name of the tube for noticiation messages
            7. here_ignore: A comma separated list of server names (from irssi) to ignore when sending notifications
        2. pushover
            1. app_token: Your application token
            2. user_key: Your user key
            3. notification
                1. use_native: Use the python notification library
                2. type: The type to use. Determines icon
            4. daemon
                1. log_level: The message level for the daemon loggin
    3. Run the script with the updated config _python beanstalk-notify.py start_
    4. Profit!