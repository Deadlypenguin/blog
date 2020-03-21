---
post_id: 124
title: Syncing saved games between Windows / Mac / Linux with Dropbox
date: 2010-05-20T13:46:58+00:00
author: pcon
layout: post
permalink: /2010/05/20/syncing-saved-games-between-windows-mac-linux-with-dropbox/
redirect_from:
- /blog/2010/05/20/syncing-saved-games-between-windows-mac-linux-with-dropbox/
dsq_thread_id:
- "1804830786"
categories:
- gaming
tags:
- dropbox
---
So with steam coming out on the Mac and with the Humble Indie Bundle working on all three, there is a problem with keeping all of your saves in sync. Not any more. This is all thanks to dropbox.

# What is dropbox?
Dropbox is a cross-platform application / website that keeps files in sync and gives you 2Gb of storage space for free.  If you're not a dropbox user already, you can sign up <a href="https://www.dropbox.com/referrals/NTIxMjU2Njk" target="_blank">here</a>.

# Initial setup

The initial setup is the tricky part.  Fortunately you only need to install something (other than dropbox) on one system and only if you're running Windows XP.

# Windows XP

You'll need to install [junction](http://www.microsoft.com/technet/sysinternals/FileAndDisk/junction.mspx) to make the symlinks in Windows XP.  In Vista and later you can use `mklink`

# Linux / OSX

You'll use the `ln` command

After you have installed your game you will need to move your save game directory into your dropbox and then link to it.  For this example, I'll be using Civ 4.  In the examples below, I'm assuming you've already moved your files into Dropbox/games/

# Windows

```
junction "C:\Documents and Settings\User\My Documents\My Games\Sid Meier's Civilization IV\replay" C:\Documents and Settings\User\My Documents\My Dropbox\games\civ4"
```

# Linux / OSX

```bash
ln -s "~/Documents/Sid Meier\'s Civilization IV/replay" "~/My Dropbox/games/civ4"
```