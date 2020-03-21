---
post_id: 1166
title: Standard picklist changes Winter '17
date: 2016-11-24T22:17:08+00:00
author: pcon
layout: post
permalink: /2016/11/24/standard-picklist-changes-winter-17/
redirect_from:
- /blog/2016/11/24/standard-picklist-changes-winter-17/
dsq_thread_id:
- "5330400044"
categories:
- development
- salesforce
tags:
- metadata
- solenopsis
---
I wrote a couple of weeks ago I wrote about the [GlobalPicklist changes in Winter '17](http://blog.deadlypenguin.com/blog/2016/11/11/globalpicklist-changes-in-winter-17/).  This past week I learned that there was another change in the [release notes](https://releasenotes.docs.salesforce.com/en-us/winter17/release-notes/rn_forcecom_picklists_new_api.htm) that I overlooked.

After updating the Case object to API 38.0 I didn't notice that the Case.Type field had changed.  In API 37.0 this is what the Case Type field looks like

```xml
<fields>
    <fullName>Type</fullName>
    <inlineHelpText>The case type</inlineHelpText>
    <picklist>
        <picklistValues>
            <fullName>Value 1</fullName>
            <default>false</default>
        </picklistValues>
        <picklistValues>
            <fullName>Value 2</fullName>
            <default>false</default>
        </picklistValues>
        <sorted>false</sorted>
    </picklist>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
</fields>
```

And this is what it looks like in API 38.0

```xml
<fields>
    <fullName>Type</fullName>
    <inlineHelpText>The case type</inlineHelpText>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
</fields>
```

In the turmoil of all the other changes to the object file, I completely missed the change.  And when the deployment failed I was at a loss to figure out why.  The failure wasn't about the picklist in particular, it was about the picklist value in a record type.

<!--more-->

It turns out there is a new folder with metadata called [standardValueSets](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_standardvalueset.htm) the includes lots of metadata.  To add the frustration, this metadata type does not support wildcards, so you have to specify [each one of them](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/standardvalueset_names.htm) individually in the package.xml.

So, by updating our package.xml to include

```xml
<types>
    <members>AccountContactMultiRoles</members>
    <members>AccountContactRole</members>
    <members>AccountOwnership</members>
    <members>AccountRating</members>
    <members>AccountType</members>
    <members>AddressCountryCode</members>
    <members>AddressStateCode</members>
    <members>AssetStatus</members>
    <members>CampaignMemberStatus</members>
    <members>CampaignStatus</members>
    <members>CampaignType</members>
    <members>CaseContactRole</members>
    <members>CaseOrigin</members>
    <members>CasePriority</members>
    <members>CaseReason</members>
    <members>CaseStatus</members>
    <members>CaseType</members>
    <members>ContactRole</members>
    <members>ContractContactRole</members>
    <members>ContractStatus</members>
    <members>EntitlementType</members>
    <members>EventSubject</members>
    <members>EventType</members>
    <members>FiscalYearPeriodName</members>
    <members>FiscalYearPeriodPrefix</members>
    <members>FiscalYearQuarterName</members>
    <members>FiscalYearQuarterPrefix</members>
    <members>IdeaCategory1</members>
    <members>IdeaMultiCategory</members>
    <members>IdeaStatus</members>
    <members>IdeaThemeStatus</members>
    <members>Industry</members>
    <members>InvoiceStatus</members>
    <members>LeadSource</members>
    <members>LeadStatus</members>
    <members>OpportunityCompetitor</members>
    <members>OpportunityStage</members>
    <members>OpportunityType</members>
    <members>OrderStatus1</members>
    <members>OrderType</members>
    <members>PartnerRole</members>
    <members>Product2Family</members>
    <members>QuestionOrigin1</members>
    <members>QuickTextCategory</members>
    <members>QuickTextChannel</members>
    <members>QuoteStatus</members>
    <members>SalesTeamRole</members>
    <members>Salutation</members>
    <members>ServiceContractApprovalStatus</members>
    <members>SocialPostClassification</members>
    <members>SocialPostEngagementLevel</members>
    <members>SocialPostReviewedStatus</members>
    <members>SolutionStatus</members>
    <members>TaskPriority</members>
    <members>TaskStatus</members>
    <members>TaskSubject</members>
    <members>TaskType</members>
    <members>WorkOrderLineItemStatus</members>
    <members>WorkOrderPriority</members>
    <members>WorkOrderStatus</members>
    <name>StandardValueSet</name>
</types>
```

You'll be able to pull down the new standardValueSets/CaseType.standardValueSet

```xml
<?xml version="1.0" encoding="UTF-8"?>
<StandardValueSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <sorted>false</sorted>
    <standardValue>
        <fullName>Value 1</fullName>
        <default>false</default>
    </standardValue>
    <standardValue>
        <fullName>Value 2</fullName>
        <default>false</default>
    </standardValue>
</StandardValueSet>
```

This file will allow you to deploy new case type values.  As usual, [Solenopsis](http://solenopsis.org/Solenopsis/) has been [updated](https://github.com/solenopsis/Solenopsis/commit/164eced65198fde95bd5f473a75c47164781a1a2) to include the ability to get this metadata.