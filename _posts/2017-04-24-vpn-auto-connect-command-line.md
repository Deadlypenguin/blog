---
post_id: 1191
title: VPN Setup and Auto Connect from Command-line
date: 2017-04-24T12:02:44+00:00
author: pcon
layout: post
permalink: /2017/04/24/vpn-auto-connect-command-line/
redirect_from:
- /2017/04/24/vpn-auto-connect-command-line/
dsq_thread_id:
- "5423602558"
categories:
- linux
tags:
- linux
---
New servers mean new things to play with and new setups that have to be done.  I set up a new VM that I wanted to always be connected to a VPN and for that VPN to come up whenever the system is started.  The biggest "problem" here is that this VM is running in runlevel 3 so no GUI is available.  So let's jump into setting up an OpenVPN client using network manger's command line interface

<div class="is-warning notification">
  While these instructions are written for Fedora 25, they should work on any system using NetworkManager.  You will have to figure out what packages you need and how to install them if you are not using an RPM (and probably Red Hat based) system.
</div>

<!--more-->

# Download the OpenVPN Config

For my VPN, I'm using [UsenetServer](https://accounts.usenetserver.com/register/signup.php?refer=275917) which has [hosts](http://www.usenetserver.com/vpn/) all over the world.  From the account page, you can download a zip of all the OpenVPN configs.  Pull this zip down onto your system, and extract it into a folder.

```bash
wget https://usenetserver.com/vpn/software/uns_configs.zip
mkdir openvpn
unzip uns_configs.zip -d openvpn
```

# Import the OpenVPN Config

After you've decided which host you want to connect to, you'll need to import that VPN configuration into NetworkManager.

```bash
cd openvpn
nmcli connection import type openvpn file atl-a01.ovpn
```

Now if you list out your connections, you should see `atl-a01` listed

```bash
nmcli connection show
```

<div class="is-warning notification">
  You will need to make sure you have <code>NetworkManager-openvpn</code> installed
</div>

# Adding VPN Credentials

Now that we've imported our OpenVPN settings, we need to add our credentials to the file to make it so we can auto start the VPN connection.  Edit your system-connections file under `/etc/NetworkManager/system-connections/` and make the following changes

```
#Change this from 1 to 0 so that it doesn't try to load the keyring
password-flags=0

#Add this under the [vpn] section
username=johnnyeveryteen@usenetserver

[vpn-secrets]
password=MarilynMonroe-bot
```

<div class="is-warning notification">
  If you are using usenetserver for your VPN your username may be an email address.  If this is the case, then your username would be "johnny@example.com@usenetserver"
</div>

Then reload your config in NetworkManager

```bash
nmcli connection reload atl-a01
```

Now we can manually test it by bringing up the VPN and testing our public IP.

```bash
dig +short myip.opendns.com @resolver1.opendns.com
nmcli connection up atl-a01
dig +short myip.opendns.com @resolver1.opendns.com
```

You should see two different IP address printed before and after bringing up the connection

# Auto Connecting

This is actually the hardest part of the whole thing to do.  We create a script in `/root/bin/keepvpnup` and then run it via cron.

```bash
#!/bin/bash

VPNNAME='atl-a01'
VPNSTATUS=$(nmcli connection show --active $VPNNAME | wc -l)
if [ "$VPNSTATUS" == "0" ]
then
    nmcli connection up $VPNNAME > /dev/null 2>&1
fi
```

Then we put this in crontab by running `crontab -e` and set it to run every minute

```bash
@reboot /root/bin/keepvpnup
* * * * * /root/bin/keepvpnup
```

This isn't ideal but it will mean that our VPN will be down at most 1 minute before being brought back up.  This also allows us to start/stop services when the VPN is down and/or alert someone that it's down.