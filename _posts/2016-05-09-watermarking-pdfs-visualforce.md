---
post_id: 898
title: Watermarking PDFs in Visualforce
date: 2016-05-09T08:00:56+00:00
author: pcon
layout: post
permalink: /2016/05/09/watermarking-pdfs-visualforce/
thumbnail: /assets/img/2016/05/09/post_thumbnail.png
redirect_from:
- /blog/2016/05/09/watermarking-pdfs-visualforce/
dsq_thread_id:
- "4748131577"
categories:
- development
- salesforce
tags:
- pdf
- trailhead
- visualforce
---
Keeping on the PDF and Trailhead theme, lets take a look at adding watermarks to our PDFs.  There was recently a developer boards post about watermarking a PDF and it dovetailed nicely into the previous posts.

<!--more-->

# Styling PDFs

Fortunately the Visualforce PDF renderer makes it really easy to do our watermarking.  Because we are using CSS to stylize the rest of the PDF we just need to update our styles.

## Watermark Static Resource

The first thing we need to do is add [our watermark image](/assets/img/2016/05/09/watermark.png) as a static resource.  We have to use a static resource (instead of something like a dynamically generated image URL) because PDFs don't render unless the image is hosted on the platform.

![Watermark static resource](/assets/img/2016/05/09/static_resource.png)

## Watermarking with CSS

We want to add this draft watermark if the Station\_Status\__c is anything other than "Complete"  To do this, we will need to add a background to the page and only have it in the CSS when the status isn't that value.  To do this, our update @Page CSS looks like

```xml
@page {
    <apex:outputPanel layout="none" rendered="{!station.Project_Status__c != 'Complete'}">
        background: url("{!$Resource.BattleStationDraft}") no-repeat center center;
    </apex:outputPanel>

    @bottom-left {
        content: element(footer);
    }
}
```

The "secret" here is to use the outputPanel with a layout of none.  That means that the content inside of it will be be outputted without any additional HTML markup.

<img class="alignnone" src="" alt="" width="1275" height="1650" />
![Watermarked PDF](/assets/img/2016/05/09/watermarked_pdf.png)

See entire [PDF](/assets/img/2016/05/09/watermarked_pdf.pdf).