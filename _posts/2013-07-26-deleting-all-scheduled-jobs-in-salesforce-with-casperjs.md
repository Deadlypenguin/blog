---
post_id: 296
title: Deleting all scheduled jobs in Salesforce with CasperJs
date: 2013-07-26T11:08:00+00:00
author: pcon
layout: post
permalink: /2013/07/26/deleting-all-scheduled-jobs-in-salesforce-with-casperjs/
redirect_from:
- /blog/2013/07/26/deleting-all-scheduled-jobs-in-salesforce-with-casperjs/
dsq_thread_id:
- "1806399089"
categories:
- development
- salesforce
tags:
- casperjs
---
# PREFACE

In a [previous post](/2013/07/09/logging-into-salesforce-with-casperjs/ "Logging into Salesforce with CasperJs"), I talked about how to log in to Salesforce with [CasperJs](http://casperjs.org/index.html).  At the time I did not have a good example of what to do next with it.  Well, this week I had a need that is something that other people can relate to.

# Casper Script

If you've ever done any [Scheduled Apex](/2012/05/26/scheduled-actions-in-salesforce-with-apex/ "Scheduled actions in Salesforce with Apex") work, then you know that if there are scheduled jobs for the class and you do a deployment, the deployment fails.  To help negate this with automated installs I wrote the following CasperJs script does the following:

1. Logs into Salesforce
2. Navigates to the scheduled jobs page
3. Gathers all the delete links for the jobs
4. Deletes them

```apexscript
/*jslint browser: true, regexp: true */
/*global casper, require, jQuery*/

var BASE_URL, LOGIN_URL, LOGIN_USERNAME, LOGIN_PASSWORD, SCHEDULED_JOBS_URI, casp;

casp = require('casper').create({
     clientScripts: [
          'jquery.min.js'
     ],
     viewportSize: {
          width: 1024,
          height: 768
     },
     verbose: true,
     logLevel: 'info'
});

if (!casp.cli.has('username') && !casp.cli.has('password')) {
     casp.echo('Usage: $ casperjs deleteScheduledJobs.casper.js --username=USERNAME --password=PASSWORD [--prod]').exit(-1);
}

if (casp.cli.has('prod')) {
     LOGIN_URL = 'https://login.salesforce.com/';
} else {
     LOGIN_URL = 'https://test.salesforce.com/';
}

LOGIN_USERNAME = casp.cli.get('username');
LOGIN_PASSWORD = casp.cli.get('password');

SCHEDULED_JOBS_URI = '08e?setupid=ScheduledJobs';

casp.start(LOGIN_URL, function () {
     'use strict';

     this.log('Logging in', 'info');
     this.fill('form', {
          'username': LOGIN_USERNAME,
          'pw': LOGIN_PASSWORD
     }, true);

     this.log('Logged in', 'info');

     BASE_URL = casp.getCurrentUrl().split('.salesforce.com')[0] + '.salesforce.com/';

     casp.thenOpen(BASE_URL + SCHEDULED_JOBS_URI, function () {
          var deleteUrls;

          this.log('Fetching jobs to delete', 'info');

          deleteUrls = this.evaluate(function () {
               var urls, url;
               urls = [];

               jQuery('table.list tr.dataRow').each(function (i, item) {
                    url = {};
                    url.href = jQuery('td.actionColumn a.actionLink', item).attr('href').substring(1);
                    url.name = jQuery('th', item).html();
                    urls.push(url);
               });

               return urls;
          });

          this.each(deleteUrls, function (self, url) {
               this.log('Deleting "' + url.name + '"', 'info');
               self.thenOpen(BASE_URL + url.href, function () {
                    this.log('"' + url.name + '" deleted', 'info');
               }, function () {
                    this.log('Timed out deleting "' + url.name + '"', 'error');
               });
          });
     });
});

casp.run();
```

Then we can run it like all other CasperJs scripts

```bash
casperjs deleteScheduleJobs.casper.js --username=USERNAME --password=PASSWORD [--prod]
```