---
post_id: 176
title: Vim and Salesforce development
date: 2012-02-09T13:04:32+00:00
author: pcon
layout: post
permalink: /2012/02/09/vim-and-salesforce-development/
redirect_from:
- /blog/2012/02/09/vim-and-salesforce-development/
dsq_thread_id:
- "1800183111"
categories:
- development
- salesforce
tags:
- vim
---
Since I switched over to using vim as my primary mode of Salesforce development, I've been asked several times how I've configured vim.  Well, it's about time I show the man behind the curtain.  My primary vim config file is quite large now, but I've condensed it down to the parts that I think are most pertinent to Salesforce development.

## Highlighting

Now vim is great for editing but where I think it shines the most is in highlighting.  I've taken the standard java vim file and have modified it for use with the Apex language.  To use it, download the [apex.vim](https://github.com/solenopsis/Solenopsis/blob/master/config/apex.vim) file and place it in your syntax directory for vim.

### Local

To make it work for just your user you can place the file in ~/.vim/syntax/ but you will need to also symlink (or copy) the html.vim file into that directory.

```bash
ln -s /usr/share/vim/vim73/syntax/html.vim ~/.vim/syntax/html.vim
```

### Global

To make it work for all users on the system you can just place the file into your global syntax directory.  For fedora and probably most unix systems it is `/usr/share/vim/vim73/syntax/`

## .vimrc

Now that we've got highlighting installed, lets get vim to use it.  First we need to create our backup and swap directories.  We do this to keep extra files out of our Salesforce directory so that we don't try to deploy them (or commit them to our repo).

```bash
mkdir ~/.bak ~/.swp
```

Now we can add / replace the following options into our .vimrc file

You might need to edit the values for tabstop, shiftwidth and softtabstop for your coding standards but 4 is what we use.