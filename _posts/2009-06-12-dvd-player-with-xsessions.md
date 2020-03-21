---
post_id: 87
title: DVD player with xsessions
date: 2009-06-12T14:55:15+00:00
author: pcon
layout: post
permalink: /2009/06/12/dvd-player-with-xsessions/
redirect_from:
- /blog/2009/06/12/dvd-player-with-xsessions/
dsq_thread_id:
- "1873391241"
categories:
- linux
tags:
- dvd
---
I've come across the need to simply the dvd playing process.  I'm having to set up a laptop to play a dvd and use a remote presenter control.  Now in the past I've just been in charge of this setup, and haven't had to worry about explaining how to start it up for others.  This time, I need to make it as user friendly as possible.  So, I've decided to do this with a couple of bash scripts and a couple of xsessions.

# Goals

* Generic user with a generic password to hand to the person in charge
* Ability to play dvd stored locally.  (Called presentation_dvd)
* Ability to play any dvd inserted.
* Require no user input except to choose _presentation_dvd_ or _dvd_

# Preperation

To get ready, we need to do a couple of things
* Create a presenter user
* Install `xine` and `xine-lib-extras-freeworld`
* Copy our presentation_dvd to an iso
  ```bash
  dd if=/dev/dvd of=/home/presenter/presentation_dvd.iso
  ```

# Xesssions

Xsessions are what defines your window manager.  It's what tells X11 what to run when you say Session->Gnome or Session->fluxbox.  These files are stored in _/usr/share/xsessions_.

```
[Desktop Entry]
Encoding=UTF-8
Name=Presentation_DVD
Comment=Start the presentation DVD
Exec=/usr/local/bin/presentation_dvd
Terminal=False

[Window Manager]
SessionManaged=true
```

This is our file in `/usr/share/xesssions/presentation_dvd.desktop` We then create one in `/usr/share/xesssions/dvd.desktop` and replace presentation_dvd with dvd.

# The Scripts

Our `/usr/local/bin/presentation_dvd` looks like this:

```bash
#!bin/bash
amixer set Master playback 100%
xine -f -g --no-splash dvd:/home/presenter/presentation_dvd.iso
```

This will turn the volume up to 100% and then start xine on the iso.  To exit, just right click and say exit.  This will take you back to the login screen.

Now to handle any dvd with the `/usr/local/bin/dvd`

```bash
#!/bin/bash
amixer set Master playback 100%
xine -f -g --no-splash dvd://
```

And the final touch, make them both executable

```bash
chmod a+x /usr/local/bin/dvd /usr/local/bin/presentation_dvd
```

# Usage

From the login menu, choose your presenter user, and then choose the appropriate session at the bottom.  Then type in the password.  Like magic, everything should work.

# Potential problems

If you don't see your session in the list, you might have a typo in your xsession file

If one of the xine scripts don't work, try logging into gnome and running the script from the command-line to see why.