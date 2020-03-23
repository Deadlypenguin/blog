---
post_id: 238
title: Auto watch a directory and rebuild the repository when an rpm is added/updated
date: 2012-12-19T15:57:20+00:00
author: pcon
layout: post
permalink: /2012/12/19/auto-watch-a-directory-and-rebuild-the-repo/
redirect_from:
- /blog/2012/12/19/auto-watch-a-directory-and-rebuild-the-repo/
dsq_thread_id:
- "1808434760"
categories:
- development
- linux
tags:
- python
- rpm
- solenopsis
---
Today I started setting up the [repository](http://rpm.solenopsis.org) for people to use to install the [Solenopsis](http://solenopsis.org/Solenopsis/) rpm.  The problem is I want to be able to build the rpm (via [Jenkins](http://jenkins-ci.org)) and push it to a remote server and automatically have the repo rebuild when it sees an rpm updated or added to the directory.

To do this, I wrote a small python script that can be run and backgrounded.  It sends a [pushover](http://pushover.net) notification and runs createrepo against the target directory.

```python
import re
import httplib, urllib
from subprocess import call

ROOT_DIR = '/path/to/dir'

wm = pyinotify.WatchManager();
mask = pyinotify.IN_CLOSE_WRITE

def pushover(message):
        conn = httplib.HTTPSConnection("api.pushover.net:443")
        conn.request("POST", "/1/messages.json",
        urllib.urlencode({
                "token": "TOKEN",
                "user": "USER",
                "message": message,
        }), { "Content-type": "application/x-www-form-urlencoded" })
        conn.getresponse()

def gen_repo():
        pushover('rebuilding repo')
        call(["createrepo", ROOT_DIR])


class EventHandler(pyinotify.ProcessEvent):
        def process_IN_CLOSE_WRITE(self, event):
                if event.pathname.endswith('.rpm'):
                        gen_repo()

handler = EventHandler();
notifier = pyinotify.Notifier(wm, handler)
wdd = wm.add_watch(ROOT_DIR, mask, rec=True)

notifier.loop()
```