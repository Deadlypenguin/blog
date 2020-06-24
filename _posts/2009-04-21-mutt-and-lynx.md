---
post_id: 76
title: Mutt and Lynx
date: 2009-04-21T17:27:48+00:00
author: pcon
layout: post
permalink: /2009/04/21/mutt-and-lynx/
redirect_from:
- /blog/2009/04/21/mutt-and-lynx/
dsq_thread_id:
- "1800183045"
categories:
- linux
tags:
- mutt
---
So, in my time with mutt, I have grown to have a disdain for people that send HTML only email.  And surprisingly, this happens alot!  So, instead of trying to change the world, I've decided to just use mutt and lynx to my advantage and call it a day.  Thanks to one of my co-workers for showing me how to do this.

At the end of your `~/.mailcap` file, add the following

```
text/html; lynx -dump -width=78 -nolist %s | sed ‘s/^   //’; copiousoutput; needsterminal; nametemplate=%s.html
```

Then, in the `~/.muttrc` add

```
auto_view text/x-vcard text/html text/enriched
```

And restart mutt.  This will use lynx to render the email.  You can substitute lynx for any text-based html browser you'd like.

<!--more-->