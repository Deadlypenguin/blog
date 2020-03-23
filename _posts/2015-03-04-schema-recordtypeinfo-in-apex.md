---
post_id: 524
title: Storing Schema RecordTypeInfo in Apex
date: 2015-03-04T12:30:41+00:00
author: pcon
layout: post
permalink: /2015/03/04/schema-recordtypeinfo-in-apex/
redirect_from:
- /blog/2015/03/04/schema-recordtypeinfo-in-apex/
dsq_thread_id:
- "3618565870"
categories:
- development
- salesforce
tags:
- apex
---
I was recently helping a friend with some Apex Controller work for a new VisualForce page, and ran across this error being displayed on the page.

```
Not serializable: Map<Id,Schema.RecordTypeInfo>
```

It was weird because it did not appear to be anywhere in the debug logs and it did not email her that an exception occurred anywhere.
<!--more-->

# Using Schema RecordTypeInfo in the Controller

The code she was writing dealt heavily on RecordType and was showing a button based on the record type and would have logic in it to change a RecordType on the button click.  So she started off with this in her controller

```apex
global with sharing class Account_ControllerExtension {
    private static String INACTIVE_RECORDTYPE = 'inactive';

    private Schema.DescribeSObjectResult describe;
    private Map<Id, Schema.RecordTypeInfo> rtMapById;
    private Map<String, Schema.RecordTypeInfo> rtMapByName;

    public Id recordId;
    private Account record;

    public Account_ControllerExtension(ApexPages.StandardController standardController) {
        this.recordId = standardController.getId();
        this.record = (Account) standardController.getRecord();

        this.describe = Schema.SObjectType.Account;
        this.rtMapById = this.describe.getRecordTypeInfosById();
        this.rtMapByName = this.describe.getRecordTypeInfosByName();
    }

    public Boolean getShowInactivateButton() {
        Schema.RecordTypeInfo rt = this.rtMapById.get(this.record.RecordTypeId);
        return rt.getName().toLowercase() != INACTIVE_RECORDTYPE;
    }

    public PageReference inactivate() {
        Schema.RecordTypeInfo rt = rtMapByName.get(INACTIVE_RECORDTYPE);

        Account account = new Account(
            Id = this.recordId,
            RecordTypeId = rt.getRecordTypeId()
        );

        update account;

        return new PageReference('/' + this.recordId);
    }
}
```

This code is a little trimmed down from what she had, but it gets the point across.  Now we spent way more time than I like to admit trying to track down what was causing this.  What it turns out to be is that the [page view state](https://developer.salesforce.com/page/An_Introduction_to_Visualforce_View_State "Visualforce View State") doesn't like to serialize the Schema.RecordTypeInfo class.

To fix this we simply added the transient keyword to the map bits we were dealing with.

```apex
private transient Schema.DescribeSObjectResult describe;
private transient Map<Id, Schema.RecordTypeInfo> rtMapById;
private transient Map<String, Schema.RecordTypeInfo> rtMapByName;
```

This will remove the variables from the page view state and keep them from trying to be serialized.

# The Odd Bit

The oddest thing to me is that we get this error at all.  While trying to debug this error I did the following

```apex
System.debug(
    System.LoggingLevel.ERROR,
    JSON.serialize(this.rtMapById)
)
```

And this generated no errors.  So this begs the question, what is the page view state using to serialize the Schema.RecordTypeInfo, and why does it fail when the built in JSON serializer does not.

![My angry face when figuring this out](/assets/img/2015/03/05/angryface.gif)