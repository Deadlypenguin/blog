---
post_id: 19
title: Combining pdf with linux via the command-line
date: 2009-01-06T14:56:45+00:00
author: pcon
layout: post
permalink: /2009/01/06/combining-pdf-with-linux-via-the-command-line/
redirect_from:
- /blog/2009/01/06/combining-pdf-with-linux-via-the-command-line/
dsq_thread_id:
- "1874651019"
categories:
- linux
tags:
- pdf
---
I've always found a need for this, and with some digging, I've found a couple of ways to do this.  The simplist is with ImageMagik, but I've found the default values leave the quality a little lacking.  However, I've found <a href="http://www.brighthub.com/computing/linux/articles/14795.aspx" target="_blank">an article</a> that uses GhostScript to do it, and it does a wonderful job.

```bash
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=output.pdf input1.pdf input2.pdf
```

They suggest putting it in an alias, but I've gone a step further and just put it in a bash script in `~/bin/combinepdf`

```bash
#!/bin/bash

if [ $# -le 1 ]
then
     echo "usage: combinepdf output.pdf input1.pdf ... inputN.pdf"
exit -1
fi

OUTPUT=$1

if [ -e $OUTPUT ]
then
     echo "Output file \"$OUTPUT\" exists"
exit -1
fi

fnum=2

INPUT="$2"
ARGV=( $@ )

while [ $fnum -lt $# ]
do
     INPUT=`echo $INPUT" "${ARGV[$fnum]}`
     let "fnum += 1"
done

gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=$OUTPUT $INPUT
```

Then `chmod a+x ~/bin/combinepdf` and then run it.