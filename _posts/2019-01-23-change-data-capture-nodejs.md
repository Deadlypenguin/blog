---
post_id: 1272
title: Change Data Capture with Nodejs
date: 2019-01-23T11:55:39+00:00
author: pcon
layout: post
permalink: /2019/01/23/change-data-capture-nodejs/
redirect_from:
- /blog/2019/01/23/change-data-capture-nodejs/
thumbnail: /assets/img/2019/01/23/post_thumbnail.png
dsq_thread_id:
- "7184587381"
categories:
- development
- nodejs
- salesforce
tags:
- nodejs
- salesforce
---
There's a new feature in Salesforce called [Change Data Capture](https://trailhead.salesforce.com/content/learn/modules/change-data-capture) that allows you to subscribe to a Cometd endpoint and stream changes to most or some of your objects.  I've talked in a [previous post](http://blog.deadlypenguin.com/blog/2016/08/13/getting-data-salesforce/) about how to get data out of Salesforce and this seems like it might be the front-runner for one of the best ways.  I would still plan on ways to get data if it exceeds the three day replay period and you'll also need a way to do your initial data import.

# What data can I get with Change Data Capture?

In a perfect world, everything you'd need would always live in Salesforce and you'd never have to worry about backing up data.  Well, we don't live in a perfect world.  Lot's of times you need to get data out of Salesforce and get it into an external system.  You could do this for data backup, for populating a search index, for sending messages to an external system.  With Change Data Capture, you can do this type of data flow in real-time.

Change Data Capture supports the following standard object (at time of writing):

* Account
* AccountContactRole
* Asset
* Campaign
* Case
* Contact
* Event
* EventRelation
* Lead
* ListEmail
* Opportunity
* OpportunityContactRole
* Order
* OrderItem
* Product2
* Task
* User

In addition to the standard items above, Change Data Capture supports all custom objects.

<!--more-->

# How do I setup Change Data Capture?

This part is really quite simple.  Go to the Setup menu and search for Change Data Capture then move your objects over from the left to the right side and click Save.  I would recommend that you only do this with the objects you really want the data from.  You can choose lots of objects but that's going to generate lots of data.

![Change Data Capture setup screen](/assets/img/2019/01/23/cdcSetup.png)

Now that we've got this set up, lets talk about how we actually use it.  Change Data Capture uses the same endpoints as any of the other streaming API requests /cometd/\[apiversion\] and then you just tell it what channel to use.  The channels vary depending on if you're trying to get all objects `/data/ChangeEvents`, standard objects `/data/<objectName>ChangeEvent` or custom objects `/data/<ObjectName>__ChangeEvent`.

# Show me the code!

The fully complete code that we'll be working from can be found on my [github](https://github.com/pcon/SalesforceApps/blob/master/cdc_example/cdc.js).  I'll be covering the key parts of the code that make it all work but it won't be enough code to make it run 100%.  So if you want to run it, checkout the repo.

## Login to Salesforce

We'll start by logging into Salesforce to get our access token

```javascript
/**
 * Login to Salesfoce
 * @param {object} args The arguments passed in
 * @returns {Promise} A promise for when the login has occurred
 */
var login = function (args) {
    var deferred = Q.defer();
    var config = {};

    if (args.sandbox) {
        config.loginUrl = 'https://test.salesforce.com';
    }

    var conn = new jsforce.Connection(config);
    conn.login(args.username, args.password + args.token, function (error) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve({
                conn: conn,
                args: args
            });
        }
    });

    return deferred.promise;
};
```

## Set up Cometd

After we're logged in, we can get our instance URL as well as our access token.  These will then be passed into the cometd configure method.

```javascript
/**
 * Gets the change data capture url
 * @param {object} conn Connection details
 * @param {object} args Arguments
 * @returns {string} The change data capture url
 */
function getCometdURL(conn) {
    return conn.instanceUrl + '/cometd/44.0';
}

/**
 * Sets up the comet instance
 * @param {object} data The connection and arguments data
 * @returns {Promise} Promise for when cometd is setup
 */
var cometd_setup = function (data) {
    var deferred = Q.defer();
    var url = getCometdURL(data.conn, data.args);

    cometd.configure({
        appendMessageTypeToURL: false,
        requestHeaders: { Authorization: 'Bearer ' + data.conn.accessToken },
        url: url
    });

    deferred.resolve(data);

    return deferred.promise;
};
```

## Making the handshake

The handshake in cometd actually connects us to our endpoint and prepares us to subscribe to the channel

```javascript
/**
 * Do the comet handshake
 * @param {object} data The connection and arguments data
 * @returns {Promise} Promise for when cometd handshake is complete
 */
var cometd_handshake = function (data) {
    var deferred = Q.defer();

    cometd.handshake(function (handshake) {
        if (handshake.successful) {
            deferred.resolve(data);
        } else {
            deferred.reject('Handshake failed');
        }
    });

    return deferred.promise;
};
```

## Subscribe and do something with the data

Now that the handshake is successful, we can actually subscribe to our channel

```javascript
/**
 * Gets the channel name
 * @param {object} args The arguments
 * @returns {string} The channel
 */
function getCometdChannel(args) {
    var channel = '/data/' + args.object + 'ChangeEvents';

    if (lo.isEmpty(args.object)) {
        channel = '/data/ChangeEvents';
    } else if (lo.endsWith(args.object, '__c')) {
        channel = '/data/' + lo.trimEnd(args.object + '__c') + '__ChangeEvent';
    }

    return channel;
}

/**
 * Process the data
 * @param {object} server_data The data from the server
 * @returns {undefined}
 */
var cometd_processdata = function (server_data) {
    // Do something more useful with the data
    logger.info(server_data);
};

/**
 * Subscribe to the comet channel
 * @param {object} data The connection and arguments data
 * @returns {Promise} Promise for when the subscription has happened
 */
var cometd_subscribe = function (data) {
    var deferred = Q.defer();

    cometd.subscribe(getCometdChannel(data.args), cometd_processdata);
    deferred.resolve();

    return deferred.promise;
};
```

# Running the code

As I said before the stuff above isn't whole code.  So download the code (and the package.json) from [the repo](https://github.com/pcon/SalesforceApps/blob/master/cdc_example/cdc.js) and install the dependencies.  You'll also want to globally install [bunyan](https://www.npmjs.com/package/bunyan) to help format the logging output.  Then you can run the code a couple of different ways however, all of them will require `username` and `password` and sometimes `token` if you're org requires it.

## Subscribe to all changes

```bash
node cdc.js monitor --username bob@example.com --password changeme
```

## Subscribe to a standard object

```bash
node cdc.js monitor Case --username bob@example.com --password changeme
```

## Subscribe to a custom object

```bash
node cdc.js monitor MyObject__c --username bob@example.com --password changeme
```

Now, to be honest, this code isn't useful but it is a decent framework for how to get connected.  You just need to add code to the `cometd_processdata` function to have it do work.  The code could also stand to be refactored more so that the params aren't passed around how they are but made into a global store.  But this is just an example and not ready for production.