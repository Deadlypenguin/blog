---
post_id: 36
title: Perpetual Screen Part Deux
date: 2009-02-02T15:26:26+00:00
author: pcon
layout: post
permalink: /2009/02/02/perpetual-screen-part-deux/
redirect_from:
- /blog/2009/02/02/perpetual-screen-part-deux/
dsq_thread_id:
- "2036218433"
categories:
- linux
tags:
- screen
---
So, I've figured out how to add in a "fail-safe" to the perpetual screen, so that if you want to ssh without starting screen you can.  And it's pretty easy.  First add the following to your sshd_config and restart ssh

```bash
AcceptEnv NO_SCREEN
```

Then add the following to the bottom of you .bashrc:   _(Note: I named my screen &#8216;main' you can name yours whatever you want)_

```bash
NO_SCREEN=`echo "."$NO_SCREEN`
# Hack to get around if the variable is not set

if [ $TERM = "screen" ]
# If we are already in a screen do nothing
then
     echo -n ""
elif [ $TERM = "dumb" ]
# If we are using scp do nothing
then
     echo -n ""
elif [ $NO_SCREEN = ".true" ]
# Our fail safe to ssh w/o screen
then
     echo -n ""
else
# Startup screen
     screen -Rd main && exit
fi
```

Then, you can either ssh like normal to start the screen, or do the following to login without screen starting

```bash
export NO_SCREEN="true"

ssh -o "SendEnv NO_SCREEN" user@host
```

Works like a champ