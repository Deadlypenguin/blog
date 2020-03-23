---
post_id: 1016
title: Solenopsis with XSLT
date: 2016-07-22T11:40:32+00:00
author: pcon
layout: post
permalink: /2016/07/22/solenopsis-with-xslt/
thumbnail: /assets/img/2016/07/22/post_thumbnail.png
redirect_from:
- /blog/2016/07/22/solenopsis-with-xslt/
dsq_thread_id:
- "5006083894"
categories:
- development
- salesforce
tags:
- ant
- deployment
- solenopsis
---
There's a great feature we use all the time in Solenopsis that isn't as [documented](https://github.com/solenopsis/Solenopsis/wiki/1.1-Useful-Tips-and-Tricks#applying-xslts-across-files) as it should be.  This is the ability to write an XSLT to apply to your objects at time of pull, push or both.

<!--more-->

# Use Case

If you have a workflow that sends an email, you've seen that part of the workflow file is the senderAddress element.  The element determines who the email goes to.  This becomes a problem when you have a sender that differs in a sandbox than it does in production.  Fortunately Solenopsis has supported variable expansion for a while so you can have the following in your workflow XML and in your properties file and the variable will be filled in when you push

```xml
<senderAddress>@{senderAddress}</senderAddress>
```

```
senderAddress = myemail@example.com
```

However whenever you pull down the workflow file the variable expansion will not be there and instead you'll have your _myemail@example.com_ address

# Solenopsis with XSLT

This is where the [Solenopsis XSLTs](https://github.com/solenopsis/Solenopsis/wiki/1.1-Useful-Tips-and-Tricks#applying-xslts-across-files) come into play.  By creating a folder structure that mimics our source directory we can apply XSLTs to our workflow file

```
 |
 |--- src
 |     |
 |     \--- workflows
 |            |
 |            \--- Case.workflow
 |
 \--- xslt
       |
       \--- workflows
              |
              \--- Case_pull.xsl
```

The naming structure for the xsl files is

* Filename.xsl &#8211; This will be applied to both pull and push
* Filename_pull.xsl &#8211; This will only be applied to a pull
* Filename_push.xsl &#8211; This will only be applied to a push

Since we want the push to use the variable expansion we only want to apply our XSLT on pull actions.  So we'll fill out the _Case_pull.xsl_ have the following content

```xml
<?xml version="1.0"?>
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sfdc="http://soap.sforce.com/2006/04/metadata">
    <xsl:output method="xml" version="1.0" indent="yes"/>

    <xsl:template match="node()|@*">
        <xsl:text></xsl:text>

        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="sfdc:alerts/sfdc:senderAddress/text()">@{senderAddress}</xsl:template>
</xsl:transform>
```

And by adding the following to our _solenopsis.properties_ file

```
sf.xslDir = /path/to/xslt/
```

And this will apply our XSLTs