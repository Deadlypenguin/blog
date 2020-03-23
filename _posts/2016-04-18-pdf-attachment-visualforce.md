---
post_id: 868
title: PDF Attachment with Visualforce
date: 2016-04-18T13:00:44+00:00
author: pcon
layout: post
permalink: /2016/04/18/pdf-attachment-visualforce/
thumbnail: /assets/img/2016/04/18/post_thumbnail.png
redirect_from:
- /blog/2016/04/18/pdf-attachment-visualforce/
dsq_thread_id:
- "4758764626"
categories:
- development
- salesforce
tags:
- pdf
- trailhead
---
After [last weeks post](/2016/04/04/pdf-headers-footers-visualforce/), let's take a look at how we can send a PDF attachment via a Visualforce email template.  Our goal is to be able to automatically send an invoice to our customer whenever their Battle Station is fully operational.  We will be taking the Battle Station Invoice PDF and making it something we can attach to an email and then create a workflow to send that email when the status changes to complete.

<!--more-->

# Visualforce Updates

Before we can do this, we need to make some changes to your PDF.  Currently we are using apex:pageBlock and apex:pageBlockTable.  Unfortunately these cannot be used in Visualforce to generate attachments, so we need to do some modifications to move these over to generic HTML entities.  Additionally, the Visualforce email handler doesn't know how to use the object name as we have provided to generate the attachment.

To make it so we can send emails with the attachment as well as be able to generate the attachment via our Visualforce page directly we need to get creative.  You could always just copy the Visualforce page from the previous post and replace Battle\_Station\__c with relatedTo but then you're maintaining two copies of the same code.  That means double the places to update and double the places to make mistakes.  So, to do this we're going to look to components.  In this example, we're only going to use a single component.  If you think you might use the parts elsewhere, you could always split this into multiple components

```xml
<apex:component layout="none" access="global">
    <apex:attribute name="station" description="The battle station." type="Battle_Station__c" />
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

            .label {
                font-weight: bold;
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
                width: 100%;
                text-align: right;
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
        <h1 class="stationName">
            {!station.Name}
        </h1>

        <table id="status">
            <tr>
                <td class="label">{!$ObjectType.Battle_Station__c.fields.Project_Status__c.Label}</td>
                <td><apex:outputText value="{!station.Project_Status__c}" /></td>
            </tr>
            <tr>
                <td class="label">{!$ObjectType.Battle_Station__c.fields.Weapons_Status__c.Label}</td>
                <td><apex:outputText value="{!station.Weapons_Status__c}" /></td>
            </tr>
        </table>

        <div class="sectionHeader">{!$ObjectType.Resource__c.labelPlural}</div>
        <table id="resources">
            <tr>
                <th class="tableHeader">{!$ObjectType.Resource__c.fields.Name.Label}</th>
                <th class="tableHeader centered">{!$ObjectType.Resource__c.fields.Quantity__c.Label}</th>
                <th class="tableHeader centered">{!$ObjectType.Resource__c.fields.Utilization__c.Label}</th>
            </tr>
            <apex:repeat value="{!station.Resources__r}" var="resource">
                <tr>
                    <td><apex:outputField value="{!resource.Name}"/></td>
                    <td class="centered"><apex:outputField value="{!resource.Quantity__c}"/></td>
                    <td class="centered"><apex:outputField value="{!resource.Utilization__c}"/></td>
                </tr>
            </apex:repeat>
        </table>

        <div class="sectionHeader">{!$ObjectType.Supply__c.labelPlural}</div>
        <table id="resources">
            <tr>
                <th class="tableHeader">{!$ObjectType.Supply__c.fields.Name.Label}</th>
                <th class="tableHeader centered">{!$ObjectType.Supply__c.fields.Quantity__c.Label}</th>
                <th class="tableHeader right">{!$ObjectType.Supply__c.fields.Unit_Cost__c.Label}</th>
                <th class="tableHeader right">{!$ObjectType.Supply__c.fields.Total_Cost__c.Label}</th>
            </tr>
            <apex:repeat value="{!station.Supplies__r}" var="supply">
                <tr>
                    <td><apex:outputField value="{!supply.Name}"/></td>
                    <td class="centered"><apex:outputField value="{!supply.Quantity__c}"/></td>
                    <td class="right"><apex:outputField value="{!supply.Unit_Cost__c}"/></td>
                    <td class="right"><apex:outputField value="{!supply.Total_Cost__c}"/></td>
                </tr>
            </apex:repeat>
        </table>
        <br class="clearboth" />
        <div id="totalCost">
            <span id="totalCostLabel">{!$ObjectType.Battle_Station__c.Fields.Total_Cost__c.Label}:</span>
            <apex:outputField value="{!station.Total_Cost__c}"/>
        </div>
    </div>
	<div class="footer">
        <div class="centered">Generated by {!$User.FirstName} {!$User.LastName}</div>
        <div>
            <div class="subfooter">{!NOW()}</div>
            <div class="subfooter right">Page <span class="pagenumber"/> of <span class="pagecount"/></div>
        </div>
    </div>
</apex:component>
```

_BattleStationPDF.vfc_

Then we'll update our BattleStationInvoice Visualforce page to

```xml
<apex:page standardController="Battle_Station__c" renderAs="pdf" applyBodyTag="false">
    <c:BattleStationPDF station="{!Battle_Station__c}" />
</apex:page>
```

Now, this isn't a pixel for pixel version of the PDF, but it's close enough for our purposes.

# Object Updates

The current Battle Station implementation doesn't have a link from a Battle Station to a Contact.  So we don't know who to send this invoice to.  So we'll create a ew contact field on Battle\_Station\__c "Invoice Contact"

![Invoice Contact Field](/assets/img/2016/04/18/invoice_contact_field.png)

# Email Template

Now we need to create our email that we are going to send out.  By going to Setup → Communication Templates → Email Templates → New Template we can generate a Visuaforce template.  We'll name it "Battle Station Payment Due" and will send it to a Contact and relate it to a Battle\_Station\__c object.

![Visualforce Email Template](/assets/img/2016/04/18/visualforce_email_template.png)

Now let's update the template and set it up to generate the PDF attachment

```xml
<messaging:emailTemplate subject="{!relatedTo.Name} invoice" recipientType="Contact" relatedToType="Battle_Station__c">
    <messaging:plainTextEmailBody >
        Attached is an invoice for the {!relatedTo.Name}. Please send payment in Galactic Credits within 30 standard days.
    </messaging:plainTextEmailBody>
    <messaging:attachment renderAs="pdf" filename="invoice.pdf">
        <c:BattleStationPDF station="{!relatedTo}" />
    </messaging:attachment>
</messaging:emailTemplate>
```

After saving this, you can test it by clicking the "Send Test and Verify Merge Field" button and choosing a contact and a battle station.

# Automatically Sending the Invoice

## Workflow

Now that we have our Visualforce email done, let's set up the automation to send it when the status is changed.  First we'll create an Email Alert to send the email.  While this could be done as part of the workflow setup, I prefer to do this separately to make it easier to reuse.

![Email alert](/assets/img/2016/04/18/email_alert.png)

We'll create a new Workflow Rule for the Battle Station object called "Send Invoice" to fire when the project status is marked "complete."  We'll also add our email alert as an immediate action.  Once this is activated, it will send our PDF attachment.

![Email workflow](/assets/img/2016/04/18/email_workflow.png)

## PDF Attachment results

After updating the status on an existing Battle Station, I get the email below with the beautiful PDF attachment I expected

![Email with PDF Attachment](/assets/img/2016/04/18/email_with_attachment.png)