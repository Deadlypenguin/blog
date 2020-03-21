---
post_id: 829
title: Extending objects for JSON parsing
date: 2016-03-16T22:12:05+00:00
author: pcon
layout: post
permalink: /2016/03/16/extending-objects-json-parsing/
thumbnail: /assets/img/2016/03/16/post_thumbnail.png
redirect_from:
- /blog/2016/03/16/extending-objects-json-parsing/
dsq_thread_id:
- "4669182355"
categories:
- development
- salesforce
tags:
- apex
- json
---

In a previous post, I talked about how to pull [Runkeeper data into Salesforce](http://blog.deadlypenguin.com/blog/2016/03/01/runkeeper-data-in-salesforce/).  The key portion of this revolved around [JSON parsing](http://blog.deadlypenguin.com/blog/2015/11/30/json-deserialization-in-salesforce/) of the data into Apex classes.  In this post I'll talk about how to use Object Oriented structures to extend the classes previously written to support additional data.

<!--more-->

# Recap

In the previous post, we created the Activity class.  This class is an abbreviated version of the data that Runkeeper stores.  The abbreviated data is great for listing several activities at once where you do not need all of the data such as the path.

```java
/** The information about an activity */
public virtual class Activity {
	/** The start time */
	private String start_time;

	/** The distance in meters */
	public Double total_distance {get; private set;}

	/** The duration in seconds */
	public Double duration {get; private set;}

	/** The tracking mode */
	public String tracking_mode {get; private set;}

	/** The total calories burned */
	public Double total_calories {get; private set;}

	/** The source system */
	public String source {get; private set;}

	/** The entry mode */
	public String entry_mode {get; private set;}

	/** If GPS / path data exists for activity */
	public Boolean has_path {get; private set;}

	/** The type of the activity */
	public String primary_type {get; private set;}

	/** The URL for the activity in Runkeeper */
	public String uri {get; private set;}

	/**
	* Converts the distance from meters to miles
	*
	* @return The total_distance in miles
	*/
	public Double getTotal_distance_mi() {
		return (this.total_distance * 0.000621371).setScale(2);
	}

	/**
	* Converts the start time into a DateTime object
	*
	* @return The start_time in a DateTime format
	*/
	public DateTime getStart_time() {
		return convertStringToDate(this.start_time);
	}
}
```

# New Classes

To support a full activity, we need to include a new class that will contain our GPS data

```java
/** A point along a path */
public class PathPoint {
	/** The unix timestamp for the point */
	public Long timestamp {get; private set;}

	/** The altitude of the point */
	public Double altitude {get; private set;}

	/** The longitude of the point */
	public Double longitude {get; private set;}

	/** The latitude of the point */
	public Double latitude {get; private set;}

	/** The type of the point */
	public String primary_type {get; private set;}
}
```

Now once we pull in a single activity, there is additional information we'll want to handle and we don't want to have to have the same fields represented in our utility class twice.  If we were to define our FullActivity class with all the available fields in the resultant JSON data, we would have all of the fields in the Activity class.  Using the Object Oriented design that Apex (and most other languages) offer, we can reduce duplicate code.

```java
/** A full activity */
public class FullActivity extends Activity {
	/** The activity URL */
	public String activity {get; private set;}

	/** The total climb in meters */
	public Double climb {get; private set;}

	/** The entry mode */
	public String entry_mode {get; private set;}

	/** The type of equipment used */
	public String equipment {get; private set;}

	/** If the activity is live */
	public Boolean is_live {get; private set;}

	/** The note on the activity */
	public String notes {get; private set;}

	/** The sharing settings */
	public String share {get; private set;}

	/** The map sharing settings */
	public String share_map {get; private set;}

	/** The path for the activity */
	public List<PathPoint> path {get; private set;}
}
```

For those not familiar with this Object Oriented concept, we are defining our Activity class as virtual to allow it to be extended.  Then having our FullActivity class extend the Activity class.  This allows the FullActivity class to have access to all of the variables and methods of the Activity class, as well as add it's own variables and methods.

# Usage

The usage for this class is the same as it was for the smaller activiy

```java
/**
* Gets a full activity for a given uri
*
* @param access_token The access token for the user
* @param uri The activity URI
* @return The activity
*/
public static FullActivity getActivity(String access_token, String uri) {
	String data = getRunkeeperData(access_token, 'application/vnd.com.runkeeper.FitnessActivity+json', uri);
	return (FullActivity)(JSON.deserialize(data, FullActivity.class));
}
```

Here we can see that we deserialize the resultant data into an instance of the FullActivity class.  Then we can use this just like we would any other class.  We also can refer to any Activity fields such as total\_distance or call the getStart\_time() method.

To see the updated and most recent code, check it out on [GitHub](https://github.com/pcon/SalesforceApps/tree/master/runkeeper).  Also, if you want to see how the sausage is made, watch [this recorded stream](https://www.livecoding.tv/pcon/videos/QDXrj-runkeeper-integration-with-salesforce) to see me work through the content for this post live.