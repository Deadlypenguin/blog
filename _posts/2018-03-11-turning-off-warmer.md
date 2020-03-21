---
post_id: 1248
title: 'Turning off a warmer: An intro to home automation'
date: 2018-03-11T13:18:42+00:00
author: pcon
layout: post
permalink: /2018/03/11/turning-off-warmer/
redirect_from:
- /blog/2018/03/11/turning-off-warmer/
thumbnail: /assets/img/2018/03/11/post_thumbnail.png
hide_thumbnail: true
dsq_thread_id:
- "6539348393"
categories:
- hardware
- homeautomation
tags:
- automation
- homeassistant
---
![Scooter](/assets/img/2018/03/11/scooter.jpg)

Now this little warmer may look innocent enough, but it's a disaster waiting to happen.  If you leave it alone, it will kill your whole family without remorse.  Ok, that may be a bit hyperbolic, but these things can be kind of dangerous.  According to the [National Fire Protection Association](https://www.nfpa.org/News-and-Research/News-and-media/Press-Room/News-releases/2013/Seven-people-die-each-day-in-reported-US-home-fires) in 2013 seven people died each day in the US due to home fires.  And half of those deaths occurred between the hours of 11 pm and 7 am.  Now, how many were caused by this cute little scooter, probably not many.  But devices like this can cause fires.  This scooter is a wax warmer.  It heats up a tray that melts wax and makes your house smell lovely.  But if you leave it on too long (by lets say forgetting about it and leaving it on for 48 hours) you get a different result.  This has happened more than once in our household, and that's what leads me to my first real world application of home automation.

<!--more-->

# The Hardware

* [Raspberry Pi 3](https://www.amazon.com/gp/product/B01C6Q2GSY/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B01C6Q2GSY&linkCode=as2&tag=deadlypengu0f-20&linkId=77d570f24656e1d783400cc1adaff29e)
* [TP-Link Smart Wi-Fi plug](http://amzn.to/2Fzmj9m)
* Scooter of death

The Raspberry Pi isn't a hard requirement.  If you already have a system up and running in your house, you can use that, but I've found that Home Assistant was much much much easier to install and get running smoothly using the Raspberry Pi installation process.

# The Software

## Home Assistant

For this blog and several upcoming posts, I'll be talking lots about this software.  Quite honestly, it's pretty darn amazing.  It allows for a pretty straight-forward way to link all of your home automation stuff together and do really neat things.  Also, it give you a nice visual front-end to display it all.

Installation of it's pretty easy if you are using the Raspberry Pi 3.  Just follow the steps in their [getting started guide](https://home-assistant.io/getting-started/) and in about 30 minutes everything is up and running to use.  I'd recommend taking a little bit of time after installation to make sure you know how to configure it.  There are several different options from the webUI to Windows shares to just SSHing in to the system.  I chose SSH because I'm more comfortable with this.  Also, it makes it easier to roll everything into a [git repo](https://github.com/pcon/home-assistant-configs) for backups.

## TP-Link Kasa

You will need to install the TP-Link Kasa app on your mobile device of choice.  Just search for it in whatever application repository your phone supports.  This will allow you to setup the Wi-Fi on the device and get it connected to your network.  I would highly suggest that you set a static IP address for your switch as it will make the configuration of Home Assistant much easier and more reliable long term.  Last thing you want is the IP address changing and your house burning down because of a DHCP lease.

After you've configured Wi-Fi on the plug you can remove the app.  We won't need it anymore.  You might want to keep it around for other reason or to just keep the firmware on the device updated.

# The Configuration

Now that we've got our hardware all ready, lets dive into the Home Assistant configuration.  I'm going to assume you're starting from a blank slate in your configs.  If you're not, you will need to modify this a little bit to make sure you don't clobber your existing configs.

After lots of toying around with how the configs are laid out, I've finally landed on a pattern that I like.  If you look in the [git repo](https://github.com/pcon/home-assistant-configs), you'll see that I have a folder for each type of device.  This keeps everything neat and tidy and makes it much easier to add new things than digging through a gigantic YAML file.

### Setup Switch

First well need to download the `tplink.py` component into the `config/components/switch` directory of our config.  This can be pulled from the [components page](https://home-assistant.io/components/switch.tplink/) of the Home Assistant site.  Then we'll create a `config/switches` directory and create the `scooter.yaml` file.

```yaml
- platform: tplink
  host: 192.168.1.30
  name: scooter
```

_You'll obviously need to change the host to be whatever the IP address of your switch is._

Now we'll add the switches directory to our main configuration.yaml file

```yaml
switch: !include_dir_merge_list switches
```

And if we reload our Home Assistant config, we should see the `switch.scooter` entry under our States in the Developer tools

### Setup Automation

Now that we can see and control our switch let's turn it off at 10 pm if it's still on.

First well need to create both the `config/automations` and `config/automations/switches` directories.  Then under `config/automations/switches` we'll create our `turn_off_scooter_at_night.yaml` file

```yaml
alias: "Turn off scooter warmer at night"
trigger:
  - platform: time
    at: '22:00:00'
condition:
    condition: state
    entity_id: switch.scooter
    state: 'on'
action:
  - service: switch.turn_off
    entity_id: switch.scooter
  - service: notify.pushover
    data:
      message: "Turned off scooter"
      title: "Turned off scooter"
```

Then add it to our `configuration.yaml`

```yaml
automation: !include_dir_list automations
```

Now, what this will do is trigger an automation at 10 pm every night and if the switch is on then turn it off and send a notification.  This is using pushover to send it, but there are lots of other things that Home Assistant can send notifications via.

### Advanced Automation

One other thing I wanted to protect ourselves against was if we left the scooter of death turned on and left the house.  So I'm using a feature of Home Assistant called [device tracking](https://home-assistant.io/components/device_tracker/) to know if everyone in the house is home.  I have a Ubiquiti access point and a Ubiquiti controller setup so this was [pretty trivial](https://github.com/pcon/home-assistant-configs/blob/master/device_tracker.yaml).  They do have support for lots of other wireless routers and other options you can use for device tracking so I'll leave that up to you to set up based on your needs.

Once we have device tracking set up, we can use the group.all_devices to know if all the "people" are home and automate against that.  So we'll create the `config/automations/switches/turn_off_scooter_all_gone.yaml` file

```yaml
alias: "Turn off scooter warmer when everyone leaves"
trigger:
  - platform: state
    entity_id: group.all_devices
    to: 'not_home'
    for:
      minutes: 10
condition:
    condition: state
    entity_id: switch.scooter
    state: 'on'
action:
  - service: switch.turn_off
    entity_id: switch.scooter
  - service: notify.pushover
    data:
      message: "Turned off scooter"
      title: "Turned off scooter"
```

This will trigger an automation 10 minutes after everyone is marked as gone and the switch is on.  It will turn it off and send a notification just like the time based one.

# Conclusion

This may seem like a lot of work for something like this and it is.  If you just wanted to do this, you could do it without the device tracking completely inside the TP-Link Kasa app.  Just set a timer to turn off every night at 10 pm and you'd be done.  But with that, you wouldn't get any notification that it went off.  Also, this sets me up to do lots of other things that I'd like to do in the future with the rest of my home automation.