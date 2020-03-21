---
post_id: 59
title: Reverse Alias in mutt
date: 2009-02-23T16:57:40+00:00
author: pcon
layout: post
permalink: /2009/02/23/reverse-alias-in-mutt/
redirect_from:
- /blog/2009/02/23/reverse-alias-in-mutt/
dsq_thread_id:
- "1845998771"
categories:
- linux
tags:
- mutt
---
A need has arisen here recently for me to need to "change" the headers on an email, so I can tell two people at work apart.  Both have their name in the email header the same.  Let's call them "John Doe."  So in order to tell them apart, I've added a reverse alias rule to mutt to handle this.  First enable the use of them by using

```
set reverse_alias
```

Then set up the alias.  This can be added to your alias file, or straight into your _.muttrc_

```
alias fake_john john_doe2@example.com (Fake John Doe)
```

Now all mail that comes in from _john_doe2@example.com_ will show up as from "Fake John Doe" but the headers will remain the same, and no one is the wiser.