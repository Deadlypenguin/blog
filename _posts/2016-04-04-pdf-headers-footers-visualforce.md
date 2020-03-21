---
post_id: 831
title: PDF Headers and Footers with Visualforce
date: 2016-04-04T08:00:58+00:00
author: pcon
layout: post
permalink: /2016/04/04/pdf-headers-footers-visualforce/
thumbnail: /assets/img/2016/04/04/post_thumbnail.png
redirect_from:
- /blog/2016/04/04/pdf-headers-footers-visualforce/
dsq_thread_id:
- "4702454154"
dsq_needs_sync:
- "1"
categories:
- development
- salesforce
tags:
- apex
- pdf
- trailhead
---
Over the past couple of months, I've seen several posts on the Developer forums asking how to set PDF headers and footers with Visualforce.  I decided to sit down and try my hand at it.  If you have done the [Battle Station app](https://developer.salesforce.com/trailhead/project/workshop-battle-station) on [Trailhead](https://developer.salesforce.com/trailhead/), you can try this out on your own sandbox!  We will be generating a PDF invoice for the Battle Station app that includes a first page header image and a dynamically generated footer.

<!--more-->

# Prerequisites

* Complete Battle Station App
* Add new Roll-Up summary called _Total\_Cost\__c_ to the Battle\_Station\\_\_c object that SUMs the Total Cost fields on the Supply\_\_c object
* Add [this image](/assets/img/2016/04/04/BattleStationHeader.png) as a static resource called BattleStationHeader

# PDF Design

## Basic PDF Rendering

Let's start off with the most basic of PDFs we can generate, just to show that we can display all the data we want to show on our invoice.  The Visualforce below simply renders out the Battle Station information as well as it's Resources and Supplies.

```xml
<apex:page standardController="Battle_Station__c" renderAs="pdf">
    <h1>{!Battle_Station__c.Name}</h1>
    <apex:pageBlock >
        <apex:pageBlockSection columns="1">
            <apex:outputText value="{!Battle_Station__c.Project_Status__c}" />
            <apex:outputText value="{!Battle_Station__c.Weapons_Status__c}" />
        </apex:pageBlockSection>
        <h2>{!$ObjectType.Resource__c.labelPlural}</h2>
        <apex:pageBlockSection columns="1">
            <apex:pageBlockTable value="{!Battle_Station__c.Resources__r}" var="resource">
                <apex:column value="{!resource.Name}" />
                <apex:column value="{!resource.Quantity__c}" />
                <apex:column value="{!resource.Utilization__c}" />
            </apex:pageBlockTable>
        </apex:pageBlockSection>
        <h2>{!$ObjectType.Supply__c.labelPlural}</h2>
        <apex:pageBlockSection columns="1">
            <apex:pageBlockTable value="{!Battle_Station__c.Supplies__r}" var="supply">
                <apex:column value="{!supply.Name}" />
                <apex:column value="{!supply.Quantity__c}" />
                <apex:column value="{!supply.Unit_Cost__c}" />
                <apex:column value="{!supply.Total_Cost__c}" />
            </apex:pageBlockTable>
        </apex:pageBlockSection>
    </apex:pageBlock>
</apex:page>
```

![Unstyled PDF](/assets/img/2016/04/04/unstyled_pdf.png)

The [resulting PDF](/assets/img/2016/04/04/unstyled_pdf.pdf) is surely functional.  We can see all of the data.  However it's not much to look at.  And if I was a customer of this company, I would think that they do not know what they are doing if they were to hand me an invoice like this.

## Stylize the basic PDF

By adding some basic CSS and updating some of the classes on the Visualforce elements, we can generate a much better looking PDF.

```xml
<apex:page standardController="Battle_Station__c" renderAs="pdf" applyBodyTag="false">
    <head>
        <style type="text/css" media="print">
            .stationName {
                text-align: center;
            	font-weight: bold;
            	font-size: 20pt;
            	margin-bottom: 30px;
            }

            table {
            	width: 100%;
            }

            .centered {
            	text-align: center;
            }

            .right {
            	text-align: right;
            }

            .tableHeader {
            	border-width: 0px 0px 1px 0px;
            	border-color: #000;
            	border-style: solid;
            }

            .sectionHeader {
            	width: 100%;
            	background-color: #eee;
            	font-size: 16pt;
            	padding: 5px;
            	margin: 20px 0px;
            	font-weight: bold;
            }
        </style>
    </head>
    <h1 class="stationName">{!Battle_Station__c.Name}</h1>
    <apex:pageBlock >
        <apex:pageBlockSection columns="1">
            <apex:outputText value="{!Battle_Station__c.Project_Status__c}" />
            <apex:outputText value="{!Battle_Station__c.Weapons_Status__c}" />
        </apex:pageBlockSection>
        <div class="sectionHeader">{!$ObjectType.Resource__c.labelPlural}</div>
        <apex:pageBlockSection columns="1">
            <apex:pageBlockTable value="{!Battle_Station__c.Resources__r}" var="resource" headerClass="tableHeader">
                <apex:column value="{!resource.Name}" />
                <apex:column value="{!resource.Quantity__c}" headerClass="centered" styleClass="centered" />
                <apex:column value="{!resource.Utilization__c}" headerClass="centered" styleClass="centered" />
            </apex:pageBlockTable>
        </apex:pageBlockSection>
        <div class="sectionHeader">{!$ObjectType.Supply__c.labelPlural}</div>
        <apex:pageBlockSection columns="1">
            <apex:pageBlockTable value="{!Battle_Station__c.Supplies__r}" var="supply" headerClass="tableHeader">
                <apex:column value="{!supply.Name}" />
                <apex:column value="{!supply.Quantity__c}" headerClass="centered" styleClass="centered" />
                <apex:column value="{!supply.Unit_Cost__c}" headerClass="right" styleClass="right" />
                <apex:column value="{!supply.Total_Cost__c}" headerClass="right" styleClass="right" />
            </apex:pageBlockTable>
        </apex:pageBlockSection>
    </apex:pageBlock>
</apex:page>
```

![Slightly Styled PDF](/assets/img/2016/04/04/slightly_styled.png)

This [rendered PDF](/assets/img/2016/04/04/slightly_styled.pdf) is presentable.  It doesn't have a tons of personality, but it gets the point across and shows all the data in a clearly formatted way.  But we can do better.

## Adding PDF Headers and Footers

By using CSS selectors, we can add a print header and footer that will show up in their respective parts of the PDF.  The key parts of this are the header div (empty here because we're using a Static Resource as our background image), and the footer div.  The content div and the other CSS is just to improve some spacing.

```xml
<apex:page standardController="Battle_Station__c" renderAs="pdf" applyBodyTag="false">
    <head>
        <style type="text/css" media="print">
            @page {
                @top-center {
                    content: element(header);
                }

                @bottom-left {
                    content: element(footer);
                }
            }

            * {
            	margin: 0px;
            	padding: 0px;
            }

            div.header {
            	background: url("{!$Resource.BattleStationHeader}") no-repeat center center;
            	margin-top: 30px;
            	height: 130px;
            	width: 715px;
            	text-align: center;
            	position: running(header);
            }

            div.content {
            	padding-top: 130px;
            }

            div.footer {
            	display: block;
            	padding: 5px;
                position: running(footer);
            }

            div.subfooter {
            	display: inline-block;
            }

            div.right {
            	float: right;
            }

            .pagenumber:before {
                content: counter(page);
            }

            .pagecount:before {
            	content: counter(pages);
            }

            .stationName {
                text-align: center;
            	font-weight: bold;
            	font-size: 20pt;
            	margin-bottom: 30px;
            }

            table {
            	width: 100%;
            }

            .centered {
            	text-align: center;
            }

            .right {
            	text-align: right;
            }

            .tableHeader {
            	border-width: 0px 0px 1px 0px;
            	border-color: #000;
            	border-style: solid;
            }

            .sectionHeader {
            	width: 100%;
            	background-color: #eee;
            	font-size: 16pt;
            	padding: 5px;
            	margin: 20px 0px;
            	font-weight: bold;
            }

            #totalCost {
            	margin-top: 15px;
            }

            #totalCostLabel {
            	font-weight: bold;
            	margin-right: 10px;
            }
        </style>
    </head>
    <div class="header"></div>
    <div class="content">
        <h1 class="stationName">{!Battle_Station__c.Name}</h1>
        <apex:pageBlock >
            <apex:pageBlockSection columns="1">
                <apex:outputText value="{!Battle_Station__c.Project_Status__c}" />
                <apex:outputText value="{!Battle_Station__c.Weapons_Status__c}" />
            </apex:pageBlockSection>
            <div class="sectionHeader">{!$ObjectType.Resource__c.labelPlural}</div>
            <apex:pageBlockSection columns="1">
                <apex:pageBlockTable value="{!Battle_Station__c.Resources__r}" var="resource" headerClass="tableHeader">
                    <apex:column value="{!resource.Name}" />
                    <apex:column value="{!resource.Quantity__c}" headerClass="centered" styleClass="centered" />
                    <apex:column value="{!resource.Utilization__c}" headerClass="centered" styleClass="centered" />
                </apex:pageBlockTable>
            </apex:pageBlockSection>
            <div class="sectionHeader">{!$ObjectType.Supply__c.labelPlural}</div>
            <apex:pageBlockSection columns="1">
                <apex:pageBlockTable value="{!Battle_Station__c.Supplies__r}" var="supply" headerClass="tableHeader">
                    <apex:column value="{!supply.Name}" />
                    <apex:column value="{!supply.Quantity__c}" headerClass="centered" styleClass="centered" />
                    <apex:column value="{!supply.Unit_Cost__c}" headerClass="right" styleClass="right" />
                    <apex:column value="{!supply.Total_Cost__c}" headerClass="right" styleClass="right" />
                </apex:pageBlockTable>
            </apex:pageBlockSection>
            <div id="totalCost" class="right"><span id="totalCostLabel">{!$ObjectType.Battle_Station__c.Fields.Total_Cost__c.Label}:</span>          <apex:outputField value="{!Battle_Station__c.Total_Cost__c}"/></div>
        </apex:pageBlock>
    </div>
    <div class="footer">
        <div class="centered">Generated by {!$User.FirstName} {!$User.LastName}</div>
        <div>
            <div class="subfooter">{!NOW()}</div>
            <div class="subfooter right">Page <span class="pagenumber"/> of <span class="pagecount"/></div>
        </div>
    </div>
</apex:page>
```

<img class="alignnone" src="" alt="Version 3 - PDF Headers and Footers" width="402" height="520" />
![PDF with header](/assets/img/2016/04/04/headered_pdf.png)

Now, this [PDF](/assets/img/2016/04/04/headered_pdf.pdf) looks great.  Just adding the header makes this pop so much.  The footer also gives us room to put additional information such as when it was generated and how many pages there are.

## Whoops! Multiple pages

Our PDF above looks great, let's call it done.  Well, before we ship it off, we better try adding enough data to see what happens when it spans multiple pages.

![Multiple pages, page 1](/assets/img/2016/04/04/multipage_1.png)

so far so good

![Multiple pages, page 2](/assets/img/2016/04/04/multipage_2.png)

Oh man, our beautiful [PDF](/assets/img/2016/04/04/multipage.pdf) looks terrible now.

## Fixing the Multiple Page Issue

Fortunately, this fix is purely a CSS fix and it's pretty straight-forward.  The current CSS tells the PDF renderer to put the header on all pages.  We want this to only be on the first page.  So we need to update our CSS only apply the header on the first page, but still put the footer on all pages

```css
@page :first {
    @top-center {
        content: element(header);
    }
}

@page {
    @bottom-left {
        content: element(footer);
    }
}
```

<img class="alignnone" src="" alt="Version 5 Page 1" width="402" height="520" />
![Multiple pages fixed, page 1](/assets/img/2016/04/04/multipage_fixed_1.png)

now, the first page still looks the same

<img class="alignnone" src="" alt="Version 5 Page 2" width="402" height="520" />
![Multiple pages fixed, page 2](/assets/img/2016/04/04/multipage_fixed_2.png)

and now our [final PDF](/assets/img/2016/04/04/multipage_fixed.pdf) looks great!

## Final Code

Now if we put it all together, our Visualforce page contains the following

```xml
<apex:page standardController="Battle_Station__c" renderAs="pdf" applyBodyTag="false">
    <head>
        <style type="text/css" media="print">
            @page :first {
                @top-center {
                    content: element(header);
                }
            }

            @page {
                @bottom-left {
                    content: element(footer);
                }
            }

            * {
            	margin: 0px;
            	padding: 0px;
            }

            div.header {
            	background: url("{!$Resource.BattleStationHeader}") no-repeat center center;
            	margin-top: 30px;
            	height: 130px;
            	width: 715px;
            	text-align: center;
            	position: running(header);
            }

            div.content {
            	padding-top: 130px;
            }

            div.footer {
            	display: block;
            	padding: 5px;
                position: running(footer);
            }

            div.subfooter {
            	display: inline-block;
            }

            div.right {
            	float: right;
            }

            .pagenumber:before {
                content: counter(page);
            }

            .pagecount:before {
            	content: counter(pages);
            }

            .stationName {
                text-align: center;
            	font-weight: bold;
            	font-size: 20pt;
            	margin-bottom: 30px;
            }

            table {
            	width: 100%;
            }

            .centered {
            	text-align: center;
            }

            .right {
            	text-align: right;
            }

            .tableHeader {
            	border-width: 0px 0px 1px 0px;
            	border-color: #000;
            	border-style: solid;
            }

            .sectionHeader {
            	width: 100%;
            	background-color: #eee;
            	font-size: 16pt;
            	padding: 5px;
            	margin: 20px 0px;
            	font-weight: bold;
            }

            #totalCost {
            	margin-top: 15px;
            }

            #totalCostLabel {
            	font-weight: bold;
            	margin-right: 10px;
            }
        </style>
    </head>
    <div class="header"></div>
    <div class="content">
        <h1 class="stationName">{!Battle_Station__c.Name}</h1>
        <apex:pageBlock >
            <apex:pageBlockSection columns="1">
                <apex:outputText value="{!Battle_Station__c.Project_Status__c}" />
                <apex:outputText value="{!Battle_Station__c.Weapons_Status__c}" />
            </apex:pageBlockSection>
            <div class="sectionHeader">{!$ObjectType.Resource__c.labelPlural}</div>
            <apex:pageBlockSection columns="1">
                <apex:pageBlockTable value="{!Battle_Station__c.Resources__r}" var="resource" headerClass="tableHeader">
                    <apex:column value="{!resource.Name}" />
                    <apex:column value="{!resource.Quantity__c}" headerClass="centered" styleClass="centered" />
                    <apex:column value="{!resource.Utilization__c}" headerClass="centered" styleClass="centered" />
                </apex:pageBlockTable>
            </apex:pageBlockSection>
            <div class="sectionHeader">{!$ObjectType.Supply__c.labelPlural}</div>
            <apex:pageBlockSection columns="1">
                <apex:pageBlockTable value="{!Battle_Station__c.Supplies__r}" var="supply" headerClass="tableHeader">
                    <apex:column value="{!supply.Name}" />
                    <apex:column value="{!supply.Quantity__c}" headerClass="centered" styleClass="centered" />
                    <apex:column value="{!supply.Unit_Cost__c}" headerClass="right" styleClass="right" />
                    <apex:column value="{!supply.Total_Cost__c}" headerClass="right" styleClass="right" />
                </apex:pageBlockTable>
            </apex:pageBlockSection>
            <div id="totalCost" class="right"><span id="totalCostLabel">{!$ObjectType.Battle_Station__c.Fields.Total_Cost__c.Label}:</span> <apex:outputField value="{!Battle_Station__c.Total_Cost__c}"/></div>
        </apex:pageBlock>
    </div>
    <div class="footer">
        <div class="centered">Generated by {!$User.FirstName} {!$User.LastName}</div>
        <div>
            <div class="subfooter">{!NOW()}</div>
            <div class="subfooter right">Page <span class="pagenumber"/> of <span class="pagecount"/></div>
        </div>
    </div>
</apex:page>
```

# Take Aways

Generating PDFs in Salesforce with Visualforce isn't that difficult.  With a little bit of CSS and some patience, you can do it.  Just remember:

* Build your PDF in stages.  Don't try to get it all right the first shot, it's much easier to gradually build it then try to troubleshoot all the CSS at once.
* Test it with large data sets. Take the time to add more data than you normally would to make sure that things don't break terribly.
* Test with multiple browsers and view settings.  The PDF renderer is very susceptible to making your painstakingly design PDF look off when the user's browser preference are off.  Test it out using multiple browsers with different settings.  Zoom in on the page before generating the PDF and check the font size.  You can combat this by specifying all of your fonts and font sizes in your CSS.  It'll take more time, but you'll end up with a better product.