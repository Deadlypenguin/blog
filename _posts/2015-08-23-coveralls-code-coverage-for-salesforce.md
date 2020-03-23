---
post_id: 619
title: 'Coveralls: Code Coverage for Salesforce'
date: 2015-08-23T22:14:30+00:00
author: pcon
layout: post
permalink: /2015/08/23/coveralls-code-coverage-for-salesforce/
thumbnail: /assets/img/2015/08/23/post_thumbnail.png
redirect_from:
- /blog/2015/08/23/coveralls-code-coverage-for-salesforce/
dsq_thread_id:
- "4060696437"
categories:
- development
- nodejs
- salesforce
tags:
- ci
- coveralls
- travisci
---
When we started working on the [Apex Lodash](https://github.com/apex-lodash/lo) project we knew we wanted to publicly post our code coverage percentage. To do this we chose to use [coveralls.io](https://coveralls.io/) since it is free for open source projects.

# Travis CI

[![Travis CI logo](/assets/img/2015/08/23/travis.png)](/2015/04/22/travis-ci-salesforce/)

In a [previous post](/2015/04/22/travis-ci-salesforce/ "Travis CI and Salesforce") I talked about how to setup [Travis CI](https://travis-ci.org/ "Travis Ci") to deploy your Salesforce code automatically.  We will be updating the Travis CI configuration to push the testing results to coveralls.

# Coveralls

[![Coveralls logo](/assets/img/2015/08/23/coveralls.png)](https://coveralls.io/)

There don't seem to be too many options around for code coverage display on the Internet.  Coveralls has lots of options for [various coding languages](https://coveralls.zendesk.com/hc/en-us "Built in support") and a pretty nice interface. Like Travis CI, Coveralls is free for open source projects and they do have paid options that supports private repositories.  It does support several [other CI platforms](https://coveralls.io/supported-continuous-integration "Coveralls CI") if you're not using Travis CI.
<!--more-->

# Setting It Up

## Connecting to Coveralls

Connecting to Coveralls is as easy as logging in with your GitHub credentials and enabling it for your repo.

## Adding the testing scripts

Building on the repo structure from before we add a testing directory under the build / scripts directory.  Under here we'll add the _build/scripts/testing/package.json_ file that will include all of our NodeJS dependencies.

```apexscript
{
    "name": "apex-lodash-scripts",
    "version": "0.0.1",
    "license": "GPL-2.0",
    "repository": {
        "type": "git",
        "url": "https://github.com/apex-lodash/lo.git"
    },
    "description": "scripts used for building apex-lodash and testing apex-lodash",
    "dependencies": {
        "jsforce": "jsforce/jsforce",
        "q": "*",
        "lodash": "*",
        "restler": "*"
    }
}
```

And now the heavy lifting the _build/scripts/testing/getTestResults.js_ will run our tests, and get the aggregate code coverage and store it in coveralls.

```apexscript
/*jslint browser: true, regexp: true */
/*global require, process, console */

var Q = require('q');
var fs = require('fs');
var lo = require('lodash');
var jsforce = require('jsforce');
var restler = require('restler');

/** The salesforce client */
var sfdc_client = new jsforce.Connection({loginUrl : process.env.SFDC_URL});

/** A map of class Ids to class information */
var id_to_class_map = {};

/** A map of test class Ids to class information */
var test_class_map = {};

/**
* Log into the salsforce instance
*/
var sfdcLogin = function () {
	'use strict';

	var deferred = Q.defer();

	console.log('Logging in as ' + process.env.SFDC_USERNAME);

	sfdc_client.login(process.env.SFDC_USERNAME, process.env.SFDC_PASSWORD + process.env.SFDC_TOKEN, function (error, res) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			console.log('Logged in');
			deferred.resolve();
		}
	});

	return deferred.promise;
};

/**
* Builds a map of class id to class data
*/
var buildClassIdToClassDataMap = function () {
	'use strict';

	var class_data = {},
		deferred = Q.defer(),
		path_template = lo.template('src/classes/<%= FullName %>.cls');

	console.log('Fetching class information');

	sfdc_client.tooling.sobject('ApexClass').find({}).execute(function (error, data) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			console.log('Got information about ' + lo.size(data) + ' classes');

			lo.forEach(data, function (row) {
				if (row.Body.indexOf('@isTest') === -1) {
					id_to_class_map[row.Id] = {
						name: path_template(row),
						source: row.Body,
						coverage: []
					};
				} else {
					test_class_map[row.Id] = {
						name: path_template(row),
						source: row.Body
					};
				}
			});

			deferred.resolve();
		}
	});

	return deferred.promise;
};

/**
* Runs all tests with the tooling api
*/
var runAllTests = function () {
	'use strict';

	var class_ids = lo.keys(test_class_map),
		deferred = Q.defer();

	sfdc_client.tooling.runTestsAsynchronous(class_ids, function (error, data) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			deferred.resolve(data);
		}
	});

	return deferred.promise;
};

/**
* Query the test results
*
* @param testRunId The id of the test run
* @param deferred The Q.defer instance
*/
var queryTestResults = function myself(testRunId, deferred) {
	'use strict';

	var isComplete = true;

	console.log('Waiting for tests');

	sfdc_client.query('select Id, Status, ApexClassId from ApexTestQueueItem where ParentJobId = \'' + testRunId + '\'', function (error, data) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			lo.each(data.records, function (row) {
				if (row.Status === 'Queued' || row.Status === 'Processing') {
					isComplete = false;
				}
			});

			if (isComplete) {
				deferred.resolve();
			} else {
				myself(testRunId, deferred);
			}
		}
	});
};

/**
* Waits until all tests are completed
*
* @param testRunId The id of the test run
*/
var waitUntilTestsComplete = function (testRunId) {
	'use strict';

	var deferred = Q.defer();

	queryTestResults(testRunId, deferred);

	return deferred.promise;
};

/**
* Gets the test data and builds an array of the number of times the line was tested
*/
var buildCoverallsCoverage = function () {
	'use strict';

	var max_line, coverage_size, class_id, i,
		deferred = Q.defer();

	console.log('Fetching code coverage information');

	sfdc_client.tooling.sobject('ApexCodeCoverage').find({}).execute(function (error, data) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			console.log('Got information about ' + lo.size(data) + ' tests');

			lo.forEach(data, function (row) {
				class_id = row.ApexClassOrTriggerId;

				if (lo.has(id_to_class_map, class_id)) {
					max_line = lo.max(lo.union(row.Coverage.coveredLines, row.Coverage.uncoveredLines));
					coverage_size = lo.size(id_to_class_map[class_id].coverage);

					if (max_line > coverage_size) {
						for (i = coverage_size; i <= max_line; i += 1) {
							id_to_class_map[class_id].coverage.push(null);
						}
					}

					lo.forEach(row.Coverage.coveredLines, function (line_number) {
						if (id_to_class_map[class_id].coverage[line_number - 1] === null) {
							id_to_class_map[class_id].coverage[line_number - 1] = 1;
						} else {
							id_to_class_map[class_id].coverage[line_number - 1] += 1;
						}
					});

					lo.forEach(row.Coverage.uncoveredLines, function (line_number) {
						if (id_to_class_map[class_id].coverage[line_number - 1] === null) {
							id_to_class_map[class_id].coverage[line_number - 1] = 0;
						}
					});
				}
			});

			deferred.resolve();
		}
	});

	return deferred.promise;
};

/**
* Posts the data to coveralls
*/
var postToCoveralls = function () {
	'use strict';

	var fs_stats, post_options,
		deferred = Q.defer(),
		coveralls_data = {
			repo_token: process.env.COVERALLS_REPO_TOKEN,
			service_name: 'travis-ci',
			service_job_id: process.env.TRAVIS_JOB_ID,
			source_files: lo.values(id_to_class_map)
		};

	console.log('Posting data to coveralls');

	fs.writeFile('/tmp/coveralls_data.json', JSON.stringify(coveralls_data), function (fs_error) {
		if (fs_error) {
			deferred.reject(new Error(fs_error));
		} else {
			fs_stats = fs.statSync('/tmp/coveralls_data.json');

			post_options = {
				multipart: true,
				data: {
					json_file: restler.file('/tmp/coveralls_data.json', null, fs_stats.size, null, 'application/json')
				}
			};

			restler.post('https://coveralls.io/api/v1/jobs', post_options).on("complete", function (data) {
				deferred.resolve();
			});
		}
	});

	return deferred.promise;
};

Q.fcall(sfdcLogin)
	.then(buildClassIdToClassDataMap)
	.then(runAllTests)
	.then(waitUntilTestsComplete)
	.then(buildCoverallsCoverage)
	.then(postToCoveralls)
	.catch(function (error) {
		'use strict';
		console.log(error);
	})
	.done(function () {
		'use strict';
	});
```

##  Adding the build script

To run the tests we need add a script to have Travis run.  We'll add the _build/scripts/run_tests.sh_ script

```bash
#!/bin/bash

# If anything fails in the build exit and don't continue on
set -e

TESTING_ROOT="$TRAVIS_BUILD_DIR/build/scripts/testing"

cd $TESTING_ROOT
npm cache clean
npm install --save
node getTestResults.js
```

_Don't forget to set the executable flag on the script._

## Setting up Travis CI

Next we'll add the coveralls environment variable to the Travis CI build.  By clicking Settings ⇨ Settings ⇨ Environment Variables, we can add our variables in the web Travis CI UI.

On the right hand side of the Coveralls page there is "Repo Token."  You'll copy that and add it to the COVERALLS\_REPO\_TOKEN in Travis  So make sure that you set the “Display value in build logs” so that your token does show up in the logs.

And then we'll add an after\_success script to our _.travis.yml_

```yaml
after_success: ./build/scripts/run_tests.sh
```

## Running it all

Now every time you push and you have a successful Travis build all of the tests in your org will run and the coverage uploaded to coveralls

<img class="alignnone" title="Coveralls main body" src="http://res.cloudinary.com/deadlypenguin/image/upload/v1440427231/coveralls_main_r1ogsj.png" alt="Coveralls main body" />

<img class="alignnone" title="Coveralls side" src="http://res.cloudinary.com/deadlypenguin/image/upload/v1440427257/coveralls_sidebar_r0smqn.png" alt="Coveralls side bar" width="223" height="426" />

# Next Steps

Once you've got Coveralls set up, you can do a couple of things

* **Add a testing status badge to your repo** — Coveralls makes this real easy to do
* **Multiple Environments** — Coveralls supports multiple branches just like Travis does
* **Notifications** — Set up [notifications](https://coveralls.zendesk.com/hc/en-us/articles/201774895-Notifications "Notifications") for when test coverage dips below a certain percentage