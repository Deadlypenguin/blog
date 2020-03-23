---
post_id: 284
title: Logging into Salesforce with CasperJs
date: 2013-07-09T11:17:33+00:00
author: pcon
layout: post
permalink: /2013/07/09/logging-into-salesforce-with-casperjs/
redirect_from:
- /blog/2013/07/09/logging-into-salesforce-with-casperjs/
aktt_notify_twitter:
- 'yes'
aktt_tweeted:
- "1"
dsq_thread_id:
- "1800173179"
categories:
- development
- salesforce
tags:
- casperjs
---
# Preface

Anyone that has ever had to deal with editing multiple Entitlement Processes in Salesforce will know the pain of having to do this in multiple environments and making sure you don't fat finger this manual process. In the past when I've had to do this, I've either sucked it up and did it manually, or did it with [Selenium](http://docs.seleniumhq.org/). I wasn't a big fan of either of these solutions since I'm a command-line kinda guy.  That's when I was told about [CasperJs](http://casperjs.org/index.html) and I think I'm in love.

# CasperJs

[CasperJs](http://casperjs.org/index.html) is a framework built on top of [PhantomJs](http://phantomjs.org/), and allows you to write JavaScript to web automation.  Like with all Salesforce tasks, logging in is the first thing you need to do.  Let's take a look at the _sfdclogin.casper.js_.

```apexscript
/*jslint browser: true, regexp: true */
/*global casper, require */

var LOGIN_URL, LOGIN_USERNAME, LOGIN_PASSWORD, casp;

casp = require('casper').create({
     viewportSize: {
          width: 1024,
          height: 768
     },
     verbose: true,
     logLevel: 'warning'
});

if (!casp.cli.has('username') && !casp.cli.has('password')) {
     casp.echo('Usage: $ casperjs sfdclogin.casper.js --username=USERNAME --password=PASSWORD [--prod]').exit(-1);
}

if (casp.cli.has('prod')) {
     LOGIN_URL = 'https://login.salesforce.com/';
} else {
     LOGIN_URL = 'https://test.salesforce.com/';
}

LOGIN_USERNAME = casp.cli.get('username');
LOGIN_PASSWORD = casp.cli.get('password');

casp.start(LOGIN_URL, function () {
     'use strict';

     this.log('Logging in', 'debug');
     this.fill('form', {
          'username': LOGIN_USERNAME,
          'pw': LOGIN_PASSWORD
     }, true);

     this.log('Logged in', 'debug');
});

casp.then(function () {
     'use strict';

     this.echo('We\'re logged in.  Now we can do more stuff like take a screenshot!');

     this.waitForSelector('#userNavLabel', function () {
          this.captureSelector('test.png', 'html');
          this.log('saved screenshot of ' + this.getCurrentUrl() + 'to test.png', 'warning');
     }, function () {
          this.die('Timeout reached');
          this.exit();
     }, 12000);
});

casp.run();
```

To run this class we simply do

```bash
casperjs sfdclogin.casper.js --username=USERNAME --password=PASSWORD [--prod]
```

This JavaScript is pretty simple, but it gives us a base to build on top of. We first setup our CasperJs instance with our screen size, the verbosity and the log level. Then we get our parameters from the command-line for username and password, this allows us to not store these inside the js file.  We then fill in the login form and submit it. Now we're ready to do some actual work.  In the above js file, all we are doing is taking a simple screenshot of the page, but we could do any number of things from the CaseperJs [documentation](http://casperjs.org/api.html#intro).