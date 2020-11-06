---
post_id: 117
title: Automatic backups with UDEV
date: 2009-09-25T11:04:04+00:00
author: pcon
layout: post
permalink: /2009/09/25/automatic-backups-with-udev/
redirect_from:
- /blog/2009/09/25/automatic-backups-with-udev/
dsq_thread_id:
- "1800183025"
categories:
- linux
tags:
- udev
---
I recently challenged myself to come up with a way to make udev automatically backup when you plug in a USB harddrive. I did all my testing with a USB stick drive, but since they both show up as block devices to the kernel, it shouldn't matter.

# UDEV Rules

To start with, we need to set up static naming for the storage device that you want to make into backup disk.  Start by plugging in the disk.  (Now I'm not using Gnome or KDE so I'm not sure what their automounter will do.  So, you might have to find a way to exclude it from the automounter.  We need to find out the "model" of the drive.  My udev rules are pretty basic, and will work since most people don't have more than one the same model of USB drive laying around that they would use.  You can always modify the udev rules to work for you.

<!--more-->

```bash
udevadm info -a -p /sys/block/sdc | grep model
```

Here we are looking at the block device sdc (which is what the kernel named it since we don't have any udev rules yet).  This could change depending on how many block devices you currently have.  Now we take this information, and feed it into a udev rule.  I created a file `/etc/udev/rules.d/50-backup.rules` The name isn't really important, however, the number 50- is.  That is the order in which it runs.  We want that number to be less than 90 so that hal doesn't run first.  Inside that file, we have the following:

```
KERNEL=="sd?1&#8243;, SUBSYSTEM=="block", ATTRS{model}=="MODEL GOES HERE", SYMLINK+="backup", RUN+="/usr/local/bin/backup.sh"
```

Replace "MODEL GOES HERE" with the output from the udevadm command

# The backup script

Now we udev running our script `/usr/local/bin/backup.sh` we need to make that script

```bash
#!/bin/bash

NOTIFYUSER="pcon"
MAINDIR="/home/pcon/"
BACKUPDIR="/mnt/backup"

su $NOTIFYUSER alt-notify-send backup "Waiting for things to settle" 0
sleep 5

su $NOTIFYUSER alt-notify-send backup "Starting backup" 0
echo "$(date) - Mounting /dev/backup to $BACKUPDIR" > /tmp/backup.log
mount /dev/backup $BACKUPDIR >> /tmp/backup.log 2>&1
echo "$(date) - Staring rsync of $MAINDIR to $BACKUPDIR" >> /tmp/backup.log
rsync -arvuz --inplace --delete $MAINDIR $BACKUPDIR >> /tmp/backup.log 2>&1
echo "$(date) - Mounting /dev/backup to $BACKUPDIR" >> /tmp/backup.log
umount $BACKUPDIR >> /tmp/backup.log 2>&1
su $NOTIFYUSER alt-notify-send backup "Backup completed" 0
```

We have a couple of things to setup here.  First we need to create /mnt/backup as root, and fill out the other variables in the top of the script.  Also, if we want notification in gnome, we need to make a notify-send work around.  Put the following in `/usr/local/bin/alt-notify-send`

```bash
#!/bin/sh
user=`whoami`
pids=`pgrep -u $user gnome-panel`
title=$1
text=$2
timeout=$3

if [ -z "$title" ]; then
    echo You need to give me a title >&2
    exit 1
fi
if [ -z "$text" ]; then
     text=$title
fi
if [ -z "$timeout" ]; then
     timeout=60000
fi

for pid in $pids; do
    # find DBUS session bus for this session
    DBUS_SESSION_BUS_ADDRESS=`grep -z DBUS_SESSION_BUS_ADDRESS \
    /proc/$pid/environ | sed -e 's/DBUS_SESSION_BUS_ADDRESS=//'`
    # use it
    DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS \
    notify-send -u low -t $timeout "$title" "$text"
done
```

Now `chmod +x` the two scripts, and everything should be good to go.