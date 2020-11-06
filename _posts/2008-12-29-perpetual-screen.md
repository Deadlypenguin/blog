---
post_id: 17
title: Perpetual Screen
date: 2008-12-29T12:13:28+00:00
author: pcon
layout: post
permalink: /2008/12/29/perpetual-screen/
redirect_from:
- /blog/2008/12/29/perpetual-screen/
categories:
- linux
tags:
- screen
---
<div class="notification is-warning is-light">This article has been <a href="/2009/02/02/perpetual-screen-part-deux/">updated</a></div>

So, I've been tossing around the idea for the past while to make is so that screen starts up every time I ssh into my box at the house.  Well, I finally broke down and did it, and it wasn't that bad at all.  I've named my screen session _main_ you can call it whatever you want.  Just add the following to the **end** or your `.bashrc` If you don't put it at the end, you the rest of your `.bashrc` won't get evaluated.

<!--more-->

```bash
if [ $TERM == "screen" ]
# If we are already in a screen do nothing
then
  echo -n ""
elif [ $TERM == "dumb" ]
# If we are using scp do nothing
then
  echo -n ""
else
# Startup screen
  screen -Rd main && exit
fi
```

It works so far with everything I've had to do, but we'll see if I run across any other problems.