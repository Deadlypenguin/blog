---
post_id: 127
title: Using meld with git diff
date: 2011-05-03T14:21:35+00:00
author: pcon
excerpt: This is test
layout: post
permalink: /2011/05/03/using-meld-with-git-diff/
redirect_from:
- /blog/2011/05/03/using-meld-with-git-diff/
dsq_thread_id:
- "1800183064"
categories:
- linux
tags:
- git
---
One of the things I've found myself doing more of is merging in code for other people.  Most of this are changes/additions/deletions to XML files.  And one thing that is really annoying to do is doing these by hand.  Well, fortunately there is a great tool for helping with this.  it's called [Meld](http://meld.sourceforge.net/).  To get it to play nicely with git we have to do one small thing.  Create a bash script called "git-meld" and put in your bin directory

```bash
#!/bin/bash
meld $2 $5
```

Then make it executable with `chmod`.  Now add the following to your `~/.gitconfig` file

```
[diff] external = git-meld
```

This will now run meld whenever you do a git diff.  You can easily see diffs and apply diffs with it now.  If you click the arrow in the blue/green box it will move that chunk of code over.  If you diff multiple files, meld will run with each one of the files, so just quit out of meld and it will relaunch with the next file.

![Meld](/assets/img/2011/05/03/meld.png)