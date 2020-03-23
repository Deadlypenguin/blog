---
post_id: 209
title: Swapping two files with a quick bash function
date: 2012-07-03T10:14:36+00:00
author: pcon
layout: post
permalink: /2012/07/03/swapping-two-files-with-bash/
redirect_from:
- /blog/2012/07/03/swapping-two-files-with-bash/
dsq_thread_id:
- "1810513028"
categories:
- linux
tags:
- bash
---
One thing I find myself doing a lot is swapping two files in bash. I thought about making this into a bash script then I realized 1) that's over kill and 2) not as portable as I want. So, if you add this to your _.bashrc_ then re-source it, you'll be able to run the command _swap_ to switch two files

```bash
function swap() {
  TMP_NAME="TMP_$RANDOM"
  mv "$1" "/tmp/$TMP_NAME" && mv "$2" "$1" && mv "/tmp/$TMP_NAME" "$2"
}
```