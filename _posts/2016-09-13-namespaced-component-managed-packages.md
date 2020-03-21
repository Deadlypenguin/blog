---
post_id: 1092
title: Namespaced Component in Managed Packages
date: 2016-09-13T08:00:22+00:00
author: pcon
layout: post
permalink: /2016/09/13/namespaced-component-managed-packages/
redirect_from:
- /blog/2016/09/13/namespaced-component-managed-packages/
thumbnail: /assets/img/2016/09/13/post_thumbnail.png
dsq_thread_id:
- "5124407541"
categories:
- development
- salesforce
tags:
- managedpackage
- visualforce
---
As part of my managed package crusade I decided I should delve into the world of Visualforce from a managed package.  While pure Visualforce is going to be in my package that's not nearly as interesting as packaging and using namespaced components as part of the package.  So let's take a look at how we can use a namespaced component.

# Namespaced Component

The component that I created in my packaging org is simple.  The Visualforce page provides an account Id and the component lists out each of the account's cases.  This component isn't going to win any awards for originality, but it will serve it's purpose.

<!--more-->

The controller is simple.  We query all the cases for the account, add the subjects to a list and return that list.  We do have to query the cases outside of the constructor because the _aId_ variable is not set when we are in the constructor.

```java
global class CaseListController {
    global Id aId {
        get;
        set;
    }

    public List<String> subjects {
        get {
            if (subjects == null) {
                this.subjects = new List<String>();

                for (Case c : [
                    select Subject
                    from Case
                    where AccountId = :this.aId
                ]) {
                    this.subjects.add(c.Subject);
                }
            }

            return subjects;
        }
        set;
    }

    global CaseListController() {}
}
```

The namespaced component is even simpler and simply iterates over all the subjects and displays them.

```xml
<apex:component controller="CaseListController" access="global">
    <apex:attribute name="accountId" assignTo="{!aId}" description="account id" type="String" required="true" access="global" />

    <apex:repeat value="{!subjects}" var="subject">
        <p>{!subject}</p>
    </apex:repeat>
</apex:component>
```

Some key things to point out, our component must have the access attribute set to _global_ and the variable we are setting must also have it's access attribute set to _global_.

With a simple test written for the controller, we can add it and the component to the [package](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t41000000NZ9g) and install it in our client org

# Using the Namespaced Component

In our client org we'll create a simple Visualforce page with a standard Account controller and call the component.

```xml
<apex:page standardController="Account">
    <pcon_test1:CaseList accountId="{!Account.Id}" />
</apex:page>
```

And that's it!  Now we can see the subjects of all the cases listed out.

# Caveats

Unlike the [REST endpoint](http://blog.deadlypenguin.com/blog/2016/09/07/namespaced-rest-managed-packages/), we don't have to worry about overwriting the component because the namespace is used in place of the `c`.  If we were to make our own caselist component inside our client org, that would be reference by saying `c:caseList` instead of `namespace:caseList`.