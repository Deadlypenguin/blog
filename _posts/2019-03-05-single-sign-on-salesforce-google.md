---
post_id: 1283
title: Single Sign-On in Salesforce with Google
description: Using Google as a Single Sign-On (SSO) provider can be a bit tricky. Learn how to easily set it up so you can use your Google credentials with Salesforce.
date: 2019-03-05T18:02:55+00:00
author: pcon
layout: post
permalink: /2019/03/05/single-sign-on-salesforce-google/
redirect_from:
- /blog/2019/03/05/single-sign-on-salesforce-google/
thumbnail: /assets/img/2019/03/05/post_thumbnail.png
dsq_thread_id:
- "7274029993"
categories:
- development
- salesforce
tags:
- google
- salesforce
- sso
---
I started down this path to flesh out a proof of concept for a related task.  However, the Single Sign-On provider that we use is difficult to get access to and not worth the time to try to get permission to use it.  So instead, I thought I'd just use my personal Google domain as the identity provider so I can get it done faster.  So I've decided to document my journey and hopefully help someone else set this up.

<!--more-->

# Prerequisites

Before you can start, you must have [My Domain](https://trailhead.salesforce.com/en/content/learn/modules/identity_login/identity_login_my_domain) configured and setup.

1. Navigate to Setup ⇨ Domain Management ⇨ My Domain
2. Choose your domain name
3. Click **Check Availability**
4. Click **Register Domain**
5. After you've tested your domain, you **_MUST_** deploy your domain to users by clicking **Deploy to Users**
6. From this page, remember / copy the _Your domain name is_ **<DOMAIN>** since we'll be using that in lots of steps moving forward

# Setup the Single Sign-On Configuration

I've found the easiest way to do this requires a bit of jumping back and forth between the Google admin console and Salesforce setup.  So I recommend keeping each open in their own tab and switching back and forth between them

#### Google Admin Console

1. Open the [SAML Apps](https://admin.google.com/deadlypenguin.com/AdminHome#AppsList:serviceType=SAML_APPS) page
2. Click + to add a new App
3. Filter Apps for "Salesforce"
4. Choose the correct service for production or sandbox
5. Under Option 2 click **Download** next to _IDP metadata_
6. Click **Next**

#### Salesforce Setup

1. Navigate to Setup ⇨ Security Controls ⇨ Single Sign-On Settings
2. Click **Edit**
3. Check **SAML Enabled**
4. Click **Save**
5. Click **New from Metadata File**
6. Choose the GoogleIDPMetadata XML file downloaded from above
7. Click **Create**
8. Choose _Assertion contains the Federation ID from the User object_
9. Optionally change the _Name_ and _API Name_ field.  This will be displayed on the login page
0. Click **Save**

#### Google Admin Console

1. Starting on Step 3 of 4
2. Click **Next**
3. Replace _{domain specific}_ in all fields with your **<DOMAIN>** from the my domain settings
4. Copy the _Login URL_ from your _SAML Single Sign-On Settings_ page from the step above into the _ACS_ field.  This will contain your org Id at the end of the URL
5. IMPORTANT Make sure your _Entity ID _field matches **_EXACTLY_** the _Entity ID_ field in your SAML configuration in Salesforce.  By default the Google one will have a trailing slash while Salesforce will not.
6. Click **Next**
7. Navigate back to your SAML Apps listing page
8. Click the three dots to the left of your Salesforce Application
9. Click **ON for everyone**
10. Click **TURN ON FOR EVERYONE** _(NOTE: This may take up to 24hrs to propagate)_

# Enable the Authentication Service

1. Navigate to Setup ⇨ Domain Management ⇨ My Domain
2. Click **Edit** in the _Authentication Configuration_ Section
3. Check the box next to your SAML Service created above
4. Click **Save**

# Configure Your Users

1. Navigate to Setup ⇨ Manage Users ⇨ Users
2. Click **Edit** next to a user
3. Modify the _Federation ID_ to be the Google email address of that user
4. Click **Save**

# Testing

1. Navigate to your My Domain URL
2. Under the Username and Password box there should now be an option to _Or log in using_ with the name of your SAML Service.  Click the name
    ![Single Sign-On Screen](/assets/img/2019/03/05/singleSignOnScreen.png)
3. Login with your Google credentials