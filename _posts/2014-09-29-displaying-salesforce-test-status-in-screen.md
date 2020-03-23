---
post_id: 402
title: Displaying Salesforce Test Status in screen using JSforce
date: 2014-09-29T17:04:53+00:00
author: pcon
layout: post
permalink: /2014/09/29/displaying-salesforce-test-status-in-screen/
redirect_from:
- /blog/2014/09/29/displaying-salesforce-test-status-in-screen/
dsq_thread_id:
- "3313922483"
categories:
- development
- linux
- salesforce
- nodejs
tags:
- jsforce
- screen
---
This post will probably only be useful to one other person out there, but it was a fun exercise and thought I'd at least share my output.

One of the biggest challenges I have when running tests is that I will often forget they are running and leave them completed for a while before I go back and remember I ran them.  This mainly happens when I'm running an entire class worth of tests and have 5-10 minutes to kill.  When first learned about [JSforce](https://jsforce.github.io/ "JSforce") and it's cli capability I was in love! So I set out to make it so that the current testing status is displayed inside of my screen session.  At the end of it all this is what I came up with:

![Screen status](/assets/img/2014/09/29/screen_status.png)

<!--more-->

# Getting started

To do this, I'm making a couple of assumptions.  This should work on other systems, but this is what I have:

* Linux based system
* gnuscreen
* node installed
* npm installed

If you don't already have a user's bin directory, we'll need to create one

```bash
mkdir ~/bin/
```

Then we need to use npm to install the jsforce library

```bash
cd ~/bin/
npm install jsforce
```

Download and configure the `bin/test_status.js` file filling in the username and password for your sandbox/org

```apexscript
/*jslint browser: true, regexp: true */
/*global require, console */

function pad(num, size) {
     'use strict';
     var s = num.toString();

     while (s.length < size) {
          s = "0" + s;
     }

     return s;
}

var jsforce = require('jsforce');
var conn = new jsforce.Connection({
     loginUrl: 'https://test.salesforce.com'
});
var data = {};

conn.login('USERNAME', 'PASSWORD').then(function (res) {
  return conn.tooling.sobject('ApexTestQueueItem').find({Status: 'Queued'});
}).then(function (queued_tests) {
    data.queued_tests = queued_tests.length;

    return conn.tooling.sobject('ApexTestQueueItem').find({Status: 'Processing'});
  }, function (err) {
    console.log(err);
}).then(function (processing_tests) {
    data.processing_tests = processing_tests.length;

    return conn.tooling.sobject('ApexTestResult').find({Outcome: 'Fail'});
  }, function (err) {
    console.log(err);
}).then(function (failed_tests) {
    var output = "";

    data.failed_tests = failed_tests.length;

    output = pad(data.queued_tests, 2) + " " + pad(data.processing_tests, 2) + " ";

    if (data.failed_tests !== 0) {
      output += '\005{= R}' + data.failed_tests + '\005{= Y}';
    } else {
      output += "00";
    }

    console.log(output);
  }, function (err) {
    console.log(err);
});
```

Download the _backtick\_test\_status.sh_ to your _bin_ directory

```bash
#!/bin/bash
/usr/bin/node /home/$USER/bin/test_status.js
```

And the last part is to add the backtick command to your .screenrc this backtick command will run the script every 60 seconds.  You can adjust that as you see fit by changing '60 60' to '120 120' for two minutes.

```
backtick 1 60 60 /home/$USER/bin/backtick_test_status.sh
hardstatus "... %1` ..."
```