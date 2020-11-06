---
post_id: 329
title: Sending pushover messages via Electric Imp
date: 2014-01-02T15:41:31+00:00
author: pcon
layout: post
permalink: /2014/01/02/sending-pushover-messages-via-electric-imp/
redirect_from:
- /blog/2014/01/02/sending-pushover-messages-via-electric-imp/
dsq_thread_id:
- "2280765724"
categories:
- development
tags:
- electricimp
- hardware
- squirrel
---
I recently got an Electric Imp [april board](https://www.sparkfun.com/products/11400) and [developer card](https://www.sparkfun.com/products/11395).  I'm really digging it and am planning on making a monitoring solution for my garage (including doors and freezer temps).  In addition to reporting the data back via the agent, I wanted to add the ability to send a [pushover](https://pushover.net/) notification to my phone on events.  I wrote a quick method to do this, and thought it might be useful to others.

```
//Agent code
function send_pushover(title, message, priority) {
    local url = "https://api.pushover.net/1/messages.json";
    local token = "XXX_TOKENGOESHERE_XXX";
    local user = "XXX_USERGOESHERE_XXX";
    local headers = { "Content-Type": "application/x-www-form-urlencoded" };
    local data = {
        "token": token,
        "user": user,
        "message": message
        "title": title,
        "priority": priority
    }
    local body = http.urlencode(data);
    local response = http.post(url, headers, body).sendsync();
}

//To use, send_pushover("My title", "My message", 0)
//For more on priority see https://pushover.net/api#priority
```
<!--more-->