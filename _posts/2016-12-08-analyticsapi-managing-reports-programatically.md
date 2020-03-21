---
post_id: 1175
title: Managing reports and dashboards programatically
date: 2016-12-08T21:45:30+00:00
author: pcon
layout: post
permalink: /2016/12/08/analyticsapi-managing-reports-programatically/
redirect_from:
- /blog/2016/12/08/analyticsapi-managing-reports-programatically/
dsq_thread_id:
- "5366455069"
categories:
- development
- salesforce
tags:
- api
- dashboards
- reports
---
One of the challenges you get when you have a [special snowflake org](https://www.salesforce.com/blog/2016/10/you-should-use-standard-objects.html) is lots of people want to write lots of reports and lots of dashboards for each of their special use cases.  Now, lots of times reports aren't the right way to go with this so you have to educate your users on the right way to do this and their old reports get abandoned.  Or a user will create a one off report and never look at it again.  As it stands right now, we have several thousand reports that haven't been looked at in more than 90 days.

<!--more-->

The obvious solution is just to use SOQL to query for reports and delete them via the REST API.  Well that doesn't work for a couple of reasons.  Firstly, the report fields that you can query that show when something was last run are relative to the running user.  So if the user making the query hasn't viewed any of the reports in your org, you'll get back everything.  And that would be pretty disastrous.  Secondly, you can't delete a report if a dashboard is using it.  And there's not a way (that I could find) to take a list of report ids and generate a list of dashboards that use them.

# The Solution

Thanks to [a great post](http://thewizardnews.com/2014/08/28/report-magic-last-run-of-a-dashboard/) by Brian Kwong we're able to create a report to show reports and dashboards that haven't been viewed within a time threshold.  Originally we were going to do 90 days, but it was brought to our attention that some reports are only run quarterly so we're going to bump that up to be around 160 days.

Using [jsforce](https://jsforce.github.io/document/#analytics-api) and the [AnalyticsAPI](https://developer.salesforce.com/docs/atlas.en-us.api_analytics.meta/api_analytics/) we can then run our report to get the ids of the reports and dashboards.  Then we can call a DELETE on all of the [dashboard](https://developer.salesforce.com/docs/atlas.en-us.api_analytics.meta/api_analytics/analytics_api_dashboard_delete.htm) ids and then on all of the [report](https://developer.salesforce.com/docs/atlas.en-us.api_analytics.meta/api_analytics/sforce_analytics_rest_api_delete_report.htm#example_delete_report) ids.

The reason I like using jsforce is that it does a good job of making it easy to work with reports in a way that is node friendly.  Also, it handles the authentication well and you can then use the instanceUrl variable to make the DELETE calls.  Right now you will have to make the delete calls by hand, but I have a [pull request](https://github.com/jsforce/jsforce/pull/568) in place for reports and will be submitting one for dashboards in the short term.

Right now I don't have a good working example of this, but I'll update this post (or maybe create a new one) once I have something that is easily replicated.