---
post_id: 1097
title: 'Child Package: Extending a Manage Package'
date: 2016-10-18T08:00:27+00:00
author: pcon
layout: post
permalink: /2016/10/18/child-package-extending-manage-package/
redirect_from:
- /blog/2016/10/18/child-package-extending-manage-package/
thumbnail: /assets/img/2016/10/18/post_thumbnail.png
dsq_thread_id:
- "5232621794"
categories:
- development
- salesforce
tags:
- managedpackage
---
In an effort to try to reduce the amount of code in our base repository we've been looking at writing managed packages that we install in our production org and then delegate the development and maintenance of these packages off to other teams.  Being a Open Source company we also want to try to offer what work we've done to other people.  However, not everything we want this package to do is useful outside of our business.  To solve this, we're releasing the [base package](https://github.com/RedHatSalesforce/escalations/releases) and then creating a private child package to hold most of our business logic and custom fields.

<!--more-->

# Base Package

The first package the we are going to try this with is our [Escalations](https://github.com/RedHatSalesforce/escalations) package.  This package will replace our existing escalations process.  We'll use this to store data from customer escalations and internal escalations.

## Objects

* **Escalations **&#8211; This holds all the information about our escalation
* **Escalation Cases** &#8211; The pairing between an escalation an a case
* **Escalation Team** &#8211; This is a pairing between an escalation and a contact/user/email
* **Escalation Comment** &#8211; These are comments on an escalation

Our base package also includes some triggers around escalation cases to set the primary case.  Since we want this to be as generic as possible there is little business logic in the base package.

# Child Package

Most of the heavy lifting will be done in our child package and where our companies business logic will be stored.

## Child Package Org

To start we'll spin up a new developer org and install our base package.  From here we'll add our organization specific fields to the objects.  Then we'll add record types, page layouts and create any other configurations we need.

## Creating the Child Package

Next create the child package with the new configurations.  This is done like any other manage package.  In this instance we're going to name our namespace rh_escalImpl since this is the implementation of our escalation package.  The package will contain all of our new parts.  You'll notice that the package does not have any of the Escalations objects.  This is because they are owned by the base package not our child package.

## Using the Child Package

Now that we've got our base package done and our implementation package we're ready to install it.  First install the base package and then install the child package.  If you forget and try to install the child package first, you'll get an obscure and indecipherable aura error message.  Once it's installed we can use it like any other managed package.

# Why Use a Managed Package?

The question comes up as to why you'd use a managed package instead of distributing it as an unmanaged package.  Our goal is to reduce the amount of "stuff" committed to our mainline repository as well as be able to delegate work to other smaller teams.  If we did this via an unmanaged package, we would have the code from the package in our repository and we'd be back to the same place we were originally.

# Can You do Everything in the Child Package?

For some features you most definitely could.  But with our escalations work, no.  For us we need to have some REST endpoints written that rely on fields in objects that don't exist outside our primary org.  Also, we have a custom implementation of outbound emails that we'll have to write triggers for.  However, this will reduce the stuff in our primary org down to two triggers and one REST class.