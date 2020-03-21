---
post_id: 739
title: Salesforce1 Actions with Visualforce
date: 2016-01-03T23:10:41+00:00
author: pcon
layout: post
permalink: /2016/01/03/salesforce1-actions-with-visualforce/
redirect_from:
- /blog/2016/01/03/salesforce1-actions-with-visualforce/
dsq_thread_id:
- "4459137625"
dsq_needs_sync:
- "1"
categories:
- development
- salesforce
tags:
- apex
- salesforce1
- visualforce
---
Salesforce1 Actions can be very powerful.  Most of the examples I have seen regarding Salesforce1 Actions have been around Global Actions that show up on the home page.  I [recently](https://developer.salesforce.com/forums/ForumsMain?id=906F00000005LGPIA2) had the chance to play around with object specific actions and found that combined with Visualforce pages they can be very powerful.

# Goal

The goal of this post is to create two quick actions for the Lead object.  One that will reject a lead and one that will accept a lead.

![Salesforce1 Goal](/assets/img/2016/01/03/salesforce1_goal.png)

We will be doing this via a Visualforce page that has an onload action.  This will be useful so that we can re-use this both for a standard page layout button as well as for our Salesforce1 Action

<!--more-->

# Apex Controller

The controller itself is pretty simple, we get the lead, we update the lead, we redirect back to the lead.

_AcceptLead.cls_

```java
public class AcceptLead {
    public Lead l;

    /**
    * The constructor
    *
    * @param controller The standard controller
    */
    public AcceptLead(ApexPages.StandardController controller) {
        this.l = (Lead) controller.getRecord();
    }

    /**
    * The page action that will accept the lead
    *
    * @return The page to goto after loading
    */
    public PageReference pageAction() {
        this.l.Status = 'Working - Accepted';

        update this.l;

        return new PageReference('/' + this.l.Id);
    }
}
```

This contains our page action to move the Status of the Lead to _Working &#8211; Accepted_ you could obviously do whatever you want in this method to update your lead, but setting the status is an easy example.

_RejectLead.cls_

```java
public class RejectLead {
    public Lead l;

    /**
    * The constructor
    *
    * @param controller The standard controller
    */
    public RejectLead(ApexPages.StandardController controller) {
        this.l = (Lead) controller.getRecord();
    }

    /**
    * The page action that will reject the lead
    *
    * @return The page to goto after loading
    */
    public PageReference pageAction() {
        this.l.Status = 'Working - Rejected';

        update this.l;

        return new PageReference('/' + this.l.Id);
    }
}
```

This controller does the same as our Accept but sets the status to _Working &#8211; Rejected_ instead.

# Visualforce Page

Now that we have our controllers we'll want to create our Visualforce page that runs the page action method on page load

_AcceptLead.vfp_

```xml
<apex:page standardController="Lead" extensions="AcceptLead" action="{!pageAction}">
</apex:page>
```

_RejectLead.vfp_

```xml
<apex:page standardController="Lead" extensions="RejectLead" action="{!pageAction}">
</apex:page>
```

You will also want to make sure that your Visualforce page is available for Salesforce mobile apps and Lightning pages

![Available for Salesforce mobile apps and Lightning](/assets/img/2016/01/03/salesforce_mobile_availability.png)

# Salesforce1 Actions

Now that we have our Visualforce pages created we need to make our Salesforce1 Actions. Goto Setup ⇨ Customize ⇨ Leads ⇨ Buttons, Links, and Actions ⇨ New Action.  From here we'll enter our Visualforce page information.  Repeat this for both actions.

![Reject Lead Action](/assets/img/2016/01/03/reject_lead_action.png)

Then after saving the Action we'll add it to the _Salesforce1 and Lightning Experience_ section of our page layout

![Page Layout](/assets/img/2016/01/03/page_layout.png)

And then loading up a Lead in our Salesforce1 app, we'll see our new actions!

![Salesforce1 Actions](/assets/img/2016/01/03/salesforce1_goal.png)