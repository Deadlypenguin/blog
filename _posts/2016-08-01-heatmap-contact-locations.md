---
post_id: 1026
title: Heatmap for Contact Locations
date: 2016-08-01T08:00:38+00:00
author: pcon
layout: post
permalink: /2016/08/01/heatmap-contact-locations/
thumbnail: /assets/img/2016/08/01/post_thumbnail.png
redirect_from:
- /blog/2016/08/01/heatmap-contact-locations/
dsq_thread_id:
- "5022790989"
categories:
- development
- salesforce
tags:
- apex
- mapping
---
One of the cool new features in [Summer '16](https://releasenotes.docs.salesforce.com/en-us/summer16/release-notes/rn_general_geocodes_aloha.htm) is the ability to take a built in (or custom) address and automatically get that addresses latitude and longitude with SOQL ([Read More](https://developer.salesforce.com/blogs/developer-relations/2016/07/making-salesforce-data-location-aware.html?language=en)).  So took this as an opportunity to learn some more about it as well as some other mapping technologies.  So for this my goal was to be able to create a heatmap of all the contact's location under an account and place this on the account page.

<!--more-->

# Setup & Configuration

## Data Preparation

<div class="notification is-warning is-light">
Since writing this article, Data.com prospector and Data.com Clean are being <a href="https://help.salesforce.com/articleView?id=000318293&type=1&mode=1">retired on July 31, 2020</a>.  You can still use the geocode fields but you'll have to get the data in some other way first.
</div>

Since Summer '16 is already available in all orgs there's nothing you need to do to make this work with default addresses.  However, to help you see that you have valid data let's turn on [clean rules](https://releasenotes.docs.salesforce.com/en-us/summer16/release-notes/data_dot_com_clean_add_geocode_information_to_all_records.htm) for Contact Mailing Address and then add the "Clean This Record with Data.com" related list

![clean record related list](/assets/img/2016/08/01/clean_record_related_list.png)

Now this will show us if our contact's address is correct.  An important note is that if you have a Developer account, the address is not populated correctly.  For example, the entire address is in the Mailing Street field and does not show as valid.  Once you have populated your data correctly, you'll see that the clean status is marked as "In Sync."

![Example record](/assets/img/2016/08/01/example_record.png)

## Static Resources

To make our heatmap, we'll need to have access to some javascript files.  I've gone ahead and created a single zip that can be uploaded as a static resource (named heatmap) and it will contain all the javascript you need.  If you need more information on creating a static resource, checkout [the documentation](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_resources_create.htm).

[heatmap.resource](https://github.com/pcon/SalesforceApps/tree/master/heatmap/staticresources) on github

## Apex Controller

Let's take a look at our controller for our Visualforce page.

```java
global class AccountHeatmap {
  /** How many miles away is considered "nearby" */
  public static Decimal MILEAGE_THRESHOLD = 20;

  /**
  * Convertes degrees to radians
  *
  * @param degree The degrees
  * @return The radians
  */
  private static Double toRadians(Decimal degree){
    Double res = degree * 3.1415926 / 180;
    return res;
  }

  /**
  * Calculates the distance between to points
  * Taken from: http://salesforce.stackexchange.com/questions/557/calculate-distance-between-two-places-on-accounts-from-a-vf-page
  *
  * @param lat1 The first latitude point
  * @param lon1 The first longitude point
  * @param lat2 The second latitude point
  * @param lon2 The second longitude point
  * @return The distance between the two points
  */
  public static Decimal calculateDistance(Decimal lat1, Decimal lon1, Decimal lat2, Decimal lon2) {
    Double radius = 6371.00;
    Double dLat = toRadians(lat2 - lat1);
    Double dLon = toRadians(lon2 - lon1);
    Double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *   Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    Double c = 2 * Math.asin(Math.sqrt(a));
    return radius * c * .62;
  }

  /** The contact point on the map */
  global class ContactGeo {
    public Decimal lat;
    public Decimal lng;
    public Integer count;

    /**
    * The constructor
    *
    * @param c The contact
    */
    public ContactGeo(Contact c) {
      this.lat = c.MailingLatitude;
      this.lng = c.MailingLongitude;
      this.count = 1;
    }

    /**
    * If the passed in contact is nearby the current point
    *
    * @param c The contact to compare
    * @return If the contact is "nearby"
    */
    public Boolean isNearby(Contact c) {
      return (calculateDistance(this.lat, this.lng, c.MailingLatitude, c.MailingLongitude) <= MILEAGE_THRESHOLD);
    }

    /**
    * Increment the count variable
    */
    public void incrementCount() {
      this.count++;
    }
  }

  /**
  * Constructor
  *
  * @param controller The standard controller
  */
  public AccountHeatmap(ApexPages.StandardController controller) {}

  /**
  * Generates a list of contacts with latitude, longitude and how many are near that point
  *
  * @param accountId The account to look for
  * @return A list of contact points
  */
  @RemoteAction
  global static List<ContactGeo> getContactGeos(String accountId) {
    List<ContactGeo> geos = new List<ContactGeo>();

    for (Contact c : [
      select MailingLatitude,
      MailingLongitude
      from Contact
      where AccountId = :accountId and
        MailingGeocodeAccuracy != null
    ]) {
      Boolean nearby = false;

      for (ContactGeo cg : geos) {
        if (cg.isNearby(c)) {
          cg.incrementCount();
          nearby = true;
          break;
        }
      }

      if (!nearby) {
        geos.add(new ContactGeo(c));
      }
    }

    return geos;
  }
}
```

The first two methods just provide us with the ability to calculate the distance (in miles) between two points.

Then we have the _ContactGeo_ class.  This stores a point on the map for our contact location as well as the number of contacts that are nearby.  The class has a helper method to compare it to another contact to see if they are considered nearby.

Then we have the meat of our logic.  From here we have a javascript remote action that we pass in our account id and get all of the contact's for that account.  These contacts are also not included if the have an empty geocode accuracy.  Then we iterate over every one of the points we already know about and if the contact is nearby to that point (based on the _MILEAGE_THRESHOLD_ variable) then we increment the count of contacts.  Otherwise we add a new point to the heatmap.

## Heatmap Visualforce Page

Now that we have our backing controller, let's actually generate the heatmap.

```xml
<apex:page applyBodyTag="false" applyHtmlTag="false" showHeader="false" standardController="Account" extension="AccountHeatmap">
  <html>
    <head>
      <link rel="stylesheet" href="{!URLFOR($Resource.heatmap, 'leaflet.css')}"/>
      <apex:includeScript value="{!URLFOR($Resource.heatmap, 'leaflet.js')}"/>
      <apex:includeScript value="{!URLFOR($Resource.heatmap, 'heatmap.min.js')}"/>
      <apex:includeScript value="{!URLFOR($Resource.heatmap, 'leaflet-heatmap.js')}"/>
      <style>
        .demo-wrapper {
          height: 390px;
          border: 3px solid black;
        }

        .heatmap {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div class="demo-wrapper">
        <div class="heatmap" id="map-canvas"></div>
      </div>
      <script type="text/javascript">
        Visualforce.remoting.Manager.invokeAction(
          '{!$RemoteAction.AccountHeatmap.getContactGeos}',
          "{!Id}",
          function (result, event) {
            if (event.status) {
              var testData = {
                max: 8,
                data:[]
              };

              for (var i = 0; i < result.length; i++) {
                if (result[i].lat !== undefined) {
                  testData.data.push({
                    lat: result[i].lat,
                    lng: result[i].lng,
                    count: result[i].count
                  });
                }
            }

            var baseLayer = L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
                  attribution: '...',
                  maxZoom: 18
                }
              );

              var cfg = {
                "radius": 2,
                "maxOpacity": .8,
                "scaleRadius": true,
                "useLocalExtrema": true,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'count'
              };

              var heatmapLayer = new HeatmapOverlay(cfg);

              var map = new L.Map('map-canvas', {
                center: new L.LatLng(37.0902, -95.7129),
                zoom: 4,
                layers: [baseLayer, heatmapLayer]
              });

              heatmapLayer.setData(testData);
            }
          },
          {escape: true}
        );
      </script>
    </body>
  </html>
</apex:page>
```

We'll start by loading in all of our javascript requirements and our CSS.  Then we'll make a remote callout to our static method _getContactGeos_ and pass in the account's Id.  This will return back an array of our ContactGeo objects.  Then we can iterate over all of them, and put them into our object called _testData_ that then gets loaded on the map.  For this example, we're going to center the map on the United States.  If you want to learn more about the heatmap options, take a look at the [documentation](https://www.patrick-wied.at/static/heatmapjs/plugin-leaflet-layer.html).

## Using It

Now that we have everything in place, let's use it.  Since this is an extension of the Account object, we should see it listed under Visualforce pages in the page layout editor.  Drag and drop it into your layout and save.  Then when you load the account's page, you should see something like this

![Heatmap](/assets/img/2016/08/01/heatmap.png)

The data that was used to generate this came from a little more than 50 contacts with randomized addresses provided by [randomlists](https://www.randomlists.com/random-addresses).

The code runs pretty fast for this account (less than 5s from page load to completion).  I don't know how well this will scale.  I would suggest that you determine a better way to do the distance comparisons.  Some ideas that I had were to break them into zones (something akin to [MGRS](https://en.wikipedia.org/wiki/Military_grid_reference_system)) and pre-calculate the addresses zone and store it on the record at insert / update.  This would make loading this as fast as just reading all the records and transferring them back.

See full project files on [github](https://github.com/pcon/SalesforceApps/tree/master/heatmap)