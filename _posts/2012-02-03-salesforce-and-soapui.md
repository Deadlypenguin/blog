---
post_id: 152
title: 'Salesforce and soapUI &mdash; Testing WebServices directly'
date: 2012-02-03T15:17:21+00:00
author: pcon
layout: post
permalink: /2012/02/03/salesforce-and-soapui/
redirect_from:
- /blog/2012/02/03/salesforce-and-soapui/
dsq_thread_id:
- "1800175857"
categories:
- development
- salesforce
tags:
- apex
- soap
- soapui
- webservice
---
In a [previous post](/2012/01/06/creating-web-services-in-salesforce/) I talked about writing webservices for Salesforce. In this post I'll discuss how to test your webservice with [soapUI](http://www.soapui.org/) without having to write any additional code.

## Getting soapUI

You will need to install the Open Source version of soapUI from their ][sourceforge](http://sourceforge.net/projects/soapui/files/soapui/).  Go ahead, I'll wait...

## Getting the WSDLs

Now that you have soapUI installed we need to download our WSDLs.  You'll need the _Enterprise WSDL_ which can be found at Setup-Develop-API.  And you'll need the WSDL for your webservice which can be found at Setup-Develop-Apex Classes, then find your class and click the WSDL link next to it.  I suggest downloading them into a WSDL folder just for organization.

## Setting up soapUI

Now that we've got all of our parts we need to create a new soapUI project.  If you are testing multiple webservices I suggest you only create one soapUI project and import the additional webservices into it.  This will make updating the enterprise WSDL easier, and will make your life less stressful.

Right-click on _Projects_ and select _New soapUI Project_ and fill out the form with your information.  Your intial WSDL should be the enterprise WSDL.  You will at the very least want to have _Create Requests_ checked.  You can choose the other later if you want to.

![New soapUI Project](/assets/img/2012/02/03/new_project.png)

After creating the new project you will see a section called SoapBinding with several methods below it.  These are standard Salesforce methods that are provided by the Salesforce Enterprise WSDL. Let's ignore these for right now, and import our webservice.  To add a new WSDL right-click on the project name, _Salesforce_ in our case, and select _Add WSDL_.

![Add WSDL button](/assets/img/2012/02/03/add_wsdl.png)

Then we want to choose our webservices WSDL

![Add WSDL screen](/assets/img/2012/02/03/add_wsdl_screen.png)

## Using soapUI

Now that we are all setup, let's test our webservice.  First we need to login to Salesforce and get our session Id.  Under the SoapBinding list, expand _login_ and choose _Show Request Editor_.  After opening the request editor we need to remove the extra headers we don't need, and fill in our username and password.

![Login request](/assets/img/2012/02/03/login_request.png)

Then press the "play" button to send the request

![Play button on login request](/assets/img/2012/02/03/login_request_play.png)

Now in the resulting XML we can pull out our session Id

![Session Id](/assets/img/2012/02/03/session_id.png)

Copy the session Id and we will use it to make a request to our webservice.  In the example below I am calling the search method on my CaseAPI.  Again, we can remove almost all of the header out of the request.  The only section we need to leave is the _SessionHeader_ and _SessionId_.

![Request with session Id](/assets/img/2012/02/03/request.png)

Then fill in the request to your webservice.  This will all depend on how yours is designed.  In the webservice call below, we pass in two context objects.  One takes in an _ssoName_ and the other takes in a _searchString_.  Then as before click the "play" button and you'll get your response back.

## Conclusion

SoapUI is a great tool to help test webservices out.  You can use it to build up tests, but that's another post.  I use it all of the time to verify that Salesforce is returning the correct data from my webservice instead of trying to write against the webservice and trying to determine if my client is messing up.