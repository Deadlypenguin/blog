---
post_id: 1086
title: Namespaced REST in Managed Packages
date: 2016-09-07T08:00:40+00:00
author: pcon
layout: post
permalink: /2016/09/07/namespaced-rest-managed-packages/
redirect_from:
- /blog/2016/09/07/namespaced-rest-managed-packages/
thumbnail: /assets/img/2016/09/07/post_thumbnail.png
dsq_thread_id:
- "5124404355"
categories:
- development
- salesforce
tags:
- apex
- managedpackage
- rest
---
Recently I've been working more with managed packages and I knew that I'd be writing REST interfaces inside that package.  However I had no clue how namespaced REST interfaces would be presented or how you accessed them.  I was afraid that there could be conflicts.  For example if the package exposed _/lastcase_ and the customer's org had _/lastcase_ how would they play together.  I'm very happy to announce that the folks at Salesfore are on the ball and the platform handles it wonderfully.

<!--more-->

# Namespaced REST Class

In my packaging org, I created the following super simple class.  This endpoint simply returns the most recent Case in the org.

```java
@RestResource(urlMapping = '/lastcase')
global class REST_VisiblilityTest {
  @HttpGet
  global static Case getCase() {
    Case result = [
      select CaseNumber,
        Subject,
        Description
      from Case
      order by CreatedDate desc
      limit 1
    ];

    return result;
  }
}
```

With a simple test written and added to the [package](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t41000000NYXn) we can install this in our client org.

# Using Namespaced REST Endpoint

Once the package is installed in our client org we can use it like you would any other REST endpoint.  The only thing you have to do append the URL with the namespace  of the package.  For example, the package above is under the namespace of pcon_test1.  So to get the most recent case we'll curl the following url

<pre class="prettyprint bash">curl "$SFDC_URL/services/apexrest/pcon_test1/lastcase"</pre>

# Caveats

This works great but there are some caveats.  You can overwrite the namespaced REST endpoint pretty easily.  Take the example class below:

```java
@RestResource(urlMapping = '/pcon_test1/lastcase')
global class REST_TestEndpoint {
  @HttpGet
  global static String getString() {
    return 'Failure';
  }
}
```

If we put this in our client org and call the curl above we'll get back our string of "Failure" instead of the case we expect.  Typically this won't be a problem because the namespace name should be clear enough but you can do it.