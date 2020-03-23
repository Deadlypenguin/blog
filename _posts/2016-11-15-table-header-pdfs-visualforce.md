---
post_id: 1157
title: Table Header in PDFs with Visualforce
date: 2016-11-15T08:00:10+00:00
author: pcon
layout: post
permalink: /2016/11/15/table-header-pdfs-visualforce/
redirect_from:
- /blog/2016/11/15/table-header-pdfs-visualforce/
thumbnail: /assets/img/2016/11/15/post_thumbnail.png
dsq_thread_id:
- "5306261600"
categories:
- development
- salesforce
tags:
- pdf
- trailhead
---
One of the problems I had with the way that we generated the PDFs in previous Battle Station Invoice [posts](/2016/04/25/field-sets-dynamic-visualforce/) was that the table header wasn't repeated for long lists of supplies or resources that continued on the next page.  There's a simple way to add the table header for PDFs generated in Salesforce using the [flying saucer mark-up](http://salesforce.stackexchange.com/questions/83042/how-to-repeat-html-table-header-thead-for-each-page-rendersas-pdf) but that won't generate the table header correctly for us.  It seems that the `-fs-table-paginate` tag does not play well when combined with a Visualforce component so we'll need to take a bit more of a native CSS approach.

<div class="callout warning">If you are doing this with plain Visualforce and apex:pageBlockTable, the -fs-table-paginate is the way to go.</div>

<!--more-->

# Updating Table Header in Visualforce

The [current version](/2016/05/09/watermarking-pdfs-visualforce/) of the page does not have the table head separated from the table body.  So the first thing we'll need to do is to add that.

```xml
<div class="sectionHeader">{!$ObjectType.Resource__c.labelPlural}</div>
<table id="resources">
    <thead>
        <tr>
            <apex:repeat value="{!$ObjectType.Resource__c.FieldSets.Battle_Station_Invoice}" var="f">
                <th class="tableHeader resource_{!$ObjectType.Resource__c.fields[f].Name}">{!$ObjectType.Resource__c.fields[f].Label}</th>
            </apex:repeat>
        </tr>
    </thead>
    <tbody>
        <apex:repeat value="{!station.Resources__r}" var="resource">
            <tr>
                <apex:repeat value="{!$ObjectType.Resource__c.FieldSets.Battle_Station_Invoice}" var="f">
                    <td class="resource_{!$ObjectType.Resource__c.fields[f].Name}"><apex:outputField value="{!resource[f]}"/></td>
                </apex:repeat>
            </tr>
        </apex:repeat>
    </tbody>
</table>

<div class="sectionHeader">{!$ObjectType.Supply__c.labelPlural}</div>
<table id="supplies">
    <thead>
        <tr>
            <apex:repeat value="{!$ObjectType.Supply__c.FieldSets.Battle_Station_Invoice}" var="f">
                <th class="tableHeader supply_{!$ObjectType.Supply__c.fields[f].Name}">{!$ObjectType.Supply__c.fields[f].Label}</th>
            </apex:repeat>
        </tr>
    </thead>
    <tbody>
        <apex:repeat value="{!station.Supplies__r}" var="supply">
            <tr>
                <apex:repeat value="{!$ObjectType.Supply__c.FieldSets.Battle_Station_Invoice}" var="f">
                    <td class="supply_{!$ObjectType.Supply__c.fields[f].Name}"><apex:outputField value="{!supply[f]}"/></td>
                </apex:repeat>
             </tr>
        </apex:repeat>
    </tbody>
</table>
```

## Make it prettier

Now that we've got our thead and tbody delineation, we can now add our style.  To do this we'll simply modify the `@page` annotation in our CSS to tell it to repeat the header on every new page.

```css
@page {
    <apex:outputPanel layout="none" rendered="{!station.Project_Status__c != 'Complete'}">
        background: url("{!$Resource.BattleStationDraft}") no-repeat center center;
    </apex:outputPanel>

    @bottom-left {
        content: element(footer);
    }

    thead {
        display: table-header-group;
    }
}
```

Now the header will be repeated for every page the table exists on

_The completed Visualforce page with all the upadtes can be seen [here](https://github.com/pcon/SalesforceApps/blob/master/battlestation/BattleStation_tableHeader.vfc)._