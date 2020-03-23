---
post_id: 1264
title: Away time in Home Assistant and surviving reboots
date: 2018-11-28T16:22:23+00:00
author: pcon
layout: post
permalink: /2018/11/28/away-time-home-assistant/
redirect_from:
- /blog/2018/11/28/away-time-home-assistant/
dsq_thread_id:
- "7076720277"
categories:
- homeautomation
tags:
- homeassistant
---
One of the biggest reasons I wanted to set up [Home Assistant](https://www.home-assistant.io/) was to be able to handle a "vacation mode" for my house to change things like the thermostats and lighting.  The addition of an `input_boolean` for this is really straight forward.  However reminding myself to set vacation mode if we are away for a long period of time is something a bit harder.  To do this, we need to calculate the away time for each user.

# The Problem

The linchpin for knowing if I should send a reminder is around how long a person has been away.  Originally thought I could just use my [Ubiquiti](https://www.home-assistant.io/components/device_tracker.unifi/) access point's `last_seen` time and calculate hours from there.  However this field disappears after about 10 minutes of the user being disconnected from the access point.  So I needed to find a way to persist the last_seen time event after the access point removes the data from the `device_tracker` entry.

<!--more-->

# Getting Last Seen

To start getting our away time, we need a way to persist when the last time we saw the user.  This isn't as simple as I'd like but it works well,

First we need to pull out the last_seen variable from the device tracker into a sensor so we can store it.  Since you can't create an automation on an attribute we need to create a [template sensor](https://www.home-assistant.io/components/sensor.template/) for this value.

{% raw %}
```yaml
- platform: template
  sensors:
    pcon_last_seen:
      friendly_name: "Seen Patrick timestamp"
      value_template: "{{ state_attr('device_tracker.pcon', 'last_seen') }}"
```
{% endraw %}

This will either return the unix timestamp that the user was last seen or a value of None

# Persisting Last Seen

Now that we're able to get our last seen time and trigger automation on it, we need to store it in a way that will survive reboots and will not be emptied when the client disconnects from the access point.  First we need to create an input_number to store the timestamp in.

```yaml
input_number:
  timestamp_pcon:
    name: Timestamp pcon
    min: 1514764800
    max: 4102444800
```

Since there are some required fields, I chose to use the beginning of 2018 as my minimum timestamp and the beginning of 2100 as my ending.  Hopefully this system isn't still running in 82 years.

Now we can write our automation to store the value every time the last seen is updated.

{% raw %}
```yaml
alias: "Set last seen timestamp for pcon"
trigger:
  - platform: state
    entity_id: sensor.pcon_last_seen
condition:
    condition: template
    value_template: '{{ states("sensor.pcon_last_seen") != None }}'
action:
  - service: input_number.set_value
    data_template:
      entity_id: input_number.timestamp_pcon
      value: '{{ states("sensor.pcon_last_seen") }}'
```
{% endraw %}

This will write the value of the sensor to the input\_number field every time it changes if it is not None.  If it's None that means the access point has forgotten about our user and we don't want to change their last\_seen time.  If you want this to survive a reboot, you will need to have [recorder](https://www.home-assistant.io/components/recorder/) configured.

# Calculating Away Time

Now that we have the timestamp for when we've seen the user we can calculate the number of hours since that timestamp

{% raw %}
```yaml
pcon_gone:
  friendly_name: "Time Patrick has been gone"
  unit_of_measurement: 'hours'
  value_template: "{{ ((as_timestamp(utcnow()) - states('input_number.timestamp_pcon') | float) / 3600) | round (2) }}"
```
{% endraw %}

From here we can use this variable in our other automations such, but that's another post.

# Keeping Away Time Refreshed

There's a small note in the docs for [template sensors](https://www.home-assistant.io/components/sensor.template/) that I missed originally that says

<div class="is-primary notification">
  If you do not supply an <code>entity_id</code> in the configuration you will need to run the service <code>homeassistant.update_entity</code> to update the sensor.
</div>

So when the input_number quits updating the template sensor does too.  So to combat this, I've added an automation that runs every five minutes to update the template.  You could change this threshold if you want it more or less frequent.

```yaml
alias: "Update the gone time"
trigger:
  - platform: time
    minutes: '/5'
action:
  - service: homeassistant.update_entity
    data:
      entity_id: sensor.pcon_gone
```

You can find all of my home assistant configs in [my github repo](https://github.com/pcon/home-assistant-configs/).

_NOTE: If you're using logbook in your configuration, you might want to add the input_number and automations to your exclude list as to not fill up your log._