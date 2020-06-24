---
post_id: 61
title: Boxee and AppleTV
date: 2009-03-10T23:52:45+00:00
author: pcon
layout: post
permalink: /2009/03/10/boxee-and-appletv/
thumbnail: /assets/img/2009/03/10/post_thumbnail.png
redirect_from:
- /blog/2009/03/10/boxee-and-appletv/
dsq_thread_id:
- "1800418303"
categories:
- linux
tags:
- appletv
- boxee
---
1. Prior to starting up the AppleTV or even unboxing it, get your patchstick ready by following [these instructions](http://code.google.com/p/atvusb-creator/)
2. Unbox and setup the AppleTV to your LAN.
3. Then, navigate to the setup->general->updates and make sure you **STOP** the update if you can.  The update won't technically break anything, but there are some problems with the newest firmware.  If you can stop it it's better
4. Insert your patchstick, and reboot the AppleTV
   ![Linux loader](/assets/img/2009/03/10/loader.jpg)
5. Once it's done open up your favorite terminal, and get ready to ssh to make sure that AppleTV can run any updates.  The password is `**frontrow`
  ```bash
  ssh frontrow@appletv
  sudo bash -c &#8216;echo "127.0.0.1 mesu.apple.com" >> /etc/hosts'
  ```
6. From the menu select 'XBMC/Boxee' &rarr; Updates and select the non-alpha boxee
7. Wait and wait some more
8. Download the darwinx86 iso from [here](http://www.opensource.apple.com/darwinsource/images/) you can get a free login for this by following the links
9. Mount it up on the loop back and scp the `/usr/bin/vim` and `/sbin/mount_nfs` to the AppleTV
10. You will need to make sure you nfs export has the option _insecure_ or the AppleTV won't be able to mount it
11. Reboot one last time.  You can do this with `sudo /sbin/reboot now`
12. Choose boxee from the menu and launch it.  There are a couple of known bugs with the latest firmware and boxee version.

* Boxee starts with a black screen.  The only real 'fix' for that is to restart it a bunch until it starts up right.
* Boxee freezes on the menu.  Remove the `/Users/frontrow/Library/Application Support/BOXEE/UserData/` folder.

![Boxee running](/assets/img/2009/03/10/boxee.jpg)
<!--more-->