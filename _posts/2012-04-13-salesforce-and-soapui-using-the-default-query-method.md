---
post_id: 194
title: 'Salesforce and soapUI &#8211; Using the default query method'
date: 2012-04-13T09:40:14+00:00
author: pcon
layout: post
permalink: /2012/04/13/salesforce-and-soapui-using-the-default-query-method/
redirect_from:
- /blog/2012/04/13/salesforce-and-soapui-using-the-default-query-method/
dsq_thread_id:
- "1800175963"
categories:
- development
- salesforce
tags:
- apex
- soap
- soapui
- webservice
---
In a [previous post](/2012/02/03/salesforce-and-soapui/ "Salesforce and soapUI – Testing WebServices directly") I discussed how to test Salesforce webservices with [soapUI](http://www.soapui.org/).  In this post I will show how to use the "default" methods inside the enterprise WSDL.

## Logging In

First we need to login to Salesforce and get our session Id.  Under the SoapBinding list, expand _login_ and choose _Show Request Editor_.  After opening the request editor we need to remove the extra headers we don’t need, and fill in our username and password.

![Logging In](/assets/img/2012/04/13/login_request.png)

Then press the “play” button to send the request

![Login request play button](/assets/img/2012/04/13/login_request_play.png)

Now in the resulting XML we can pull out our session Id

![Session Id](/assets/img/2012/04/13/session_id.png)

And we can pull out our server Url

![Server Url](/assets/img/2012/04/13/server_url.png)

## Adding the new endpoint

If we create a new query request and remove the unneeded headers and insert our session Id and run the request you get the following error:

> UNKNOWN_EXCEPTION: Destination URL not reset. The URL returned from login must be set in the SforceService

To fix this issue we need to add a new end point to our SOAP request.  Using the server Url obtained during login we can add it to our request

![New end point](/assets/img/2012/04/13/new_endpoint.png)

And now we can rerun our new request with the correct endpoint

![New end point](/assets/img/2012/04/13/full_request.png)

## Conclusion

Unlike custom webservices which include the Salesforce endpoint as part of the WSDL the standard Salesforce enterprise WSDL only has the test or login url included.  Because of this, we need to use the returned server url to set our end point.