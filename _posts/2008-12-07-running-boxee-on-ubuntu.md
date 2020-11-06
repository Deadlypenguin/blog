---
post_id: 10
title: Running Boxee on Ubuntu
date: 2008-12-07T23:36:25+00:00
author: pcon
layout: post
permalink: /2008/12/07/running-boxee-on-ubuntu/
redirect_from:
- /blog/2008/12/07/running-boxee-on-ubuntu/
dsq_thread_id:
- "1838196636"
categories:
- linux
tags:
- boxee
---
First,  I know I'm going to hell for using Ubuntu.  But, I'm too lazy to compile xbmc and boxee on Fedora.  So, now that it's out of the way.  Here's the step-by-step:

1. Install Ubuntu 10.4
2. Add the extra boxee repo based on the instructions on boxee.tv
3. Install `mingetty` and `rcconf`
  ```bash
  apt-get install mingetty rcconf
  ```
4. Disable gdm with `rcconf`
5. Add a boxee user with and add them to the "admin" and "audio" group
  ```bash
  useradd -G admin,audio -d /home/boxee boxee
  ```
6. Add a `.bashrc` to `/home/boxee`
  ```bash
  case "`tty`" in
    /dev/tty1) startx
  esac
  ```
7. Add `.xinitrc` to `/home/boxee`
  ```bash
  #!/bin/bash
  while [ 1 ]
  do
    exec /opt/boxee/Boxee --standalone
  done
  ```
8. Make it executable
  ```bash
  chmod a+x .xinitrc
  ```
9. Edit line in `/etc/event.d/tty1`
  ```
  #exec /sbin/getty 38400 tty1
  exec /sbin/mingetty --autologin boxee tty1
  ```
10. Reboot and pray

<!--more-->