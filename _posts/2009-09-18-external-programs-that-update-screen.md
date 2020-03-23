---
post_id: 111
title: External programs that update screen
date: 2009-09-18T17:12:36+00:00
author: pcon
layout: post
permalink: /2009/09/18/external-programs-that-update-screen/
redirect_from:
- /blog/2009/09/18/external-programs-that-update-screen/
dsq_thread_id:
- "2036211155"
categories:
- linux
tags:
- screen
---
Screen is a great tool, and it allows you do to alot of neat things.  One of my favorites is binding commands to key strokes.  So all you have to do is hit F5 and it will start something in the background.  Such as a build command.  The problem is, you either get no output, or you get spam all over your screen.  Well I've finally found a way around that.  The answer lies in ANSI Privacy Messages.

In your `.screenrc`, make sure you have a place that will show messages.  If you start up screen and you see "New screen..." then you've got this.  Next add your script to your `.screenrc`

```
bind -k k5 exec /home/pcon/bin/build_script.sh
```

Now everything in your screen is ready to go.  Now, on to build_script.sh

```bash
#!/bin/bash

echo -n -e "\033^Starting Build\033\\"

# Do something here

echo -n -e "\033^Ending Build\033\\"
```

That's it.  Now your screen will display "Starting Build" and "Ending Build" on your display.  If the stuff in between happens too fast, you may only see your last message.  The key thing is that your message has to start with `\033^`  and end with `\033\\` otherwise you'll lose your cursor.  And you have to have the `-e `on the echo so that it will interpret the octal codes correctly.