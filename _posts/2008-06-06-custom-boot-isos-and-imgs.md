---
post_id: 4
title: Custom boot isos and imgs
date: 2008-06-06T03:18:00+00:00
author: pcon
layout: post
permalink: /2008/06/06/custom-boot-isos-and-imgs/
redirect_from:
- /blog/2008/06/06/custom-boot-isos-and-imgs/
dsq_thread_id:
- "1830182321"
categories:
- linux
tags:
- kickstart
- satellite
---
I've spent the past couple of days banging my head against the desk trying to get this to work out correctly.  And now it finally does.  Just as a note, I've tested that the general steps work.  I have not verified that I haven't skipped a step.  So if anything's missing let me know.

<div class="notification is-info">This has only been tested with RHEL and nothing else, but there is no reason why it won't work.  And if you don't have a satellite you can use this with any old kickstart.  Assuming you have the tree setup correctly. Please test your kickstart tree first.</div>

# Satellite prep

Create your kickstart as you normally would. Then, make sure the kickstart is accessible via the following style URL:

```
http://satellite.example.com/kickstart/ks/view_label/<kickstart_label>
```

Replace `<kickstart_label>` with the name of label set on the satellite.  Remember this URL, you'll need it later

# view_label VS label

In the kickstart URL, you can use either view\_label or label.  `view_label` will not register the box if there is not an activation key set inside the kickstart.  `label` generates a one time use activation key and registers the box to the satellite

## Why use one over the other?

view\_label is good if you are using an activation key, or if you have to install a box a bunch of times, and don't want to have a bunch of extra profiles lingering around.label is good if you don't want to have to set up an activation key, and a machine is only going to be kickstarted once.  If you are going to be using the disk image in a PXE like fashion, view\_label is your best option.

# Rolling the disk image (For usb-key)

Get the first disk of what ever you are trying to install from the kickstart. For this document, I will be using RHEL 5 U2 x86_64

NOTE: The arch and update must match or it will fail.

* Copy the `images/diskboot.img` file to `/root/rhel5u2-64bit.img`
* Mount the `/root/rhel5u2-64bit.img` file on the loopback `/mnt/`
* Edit the `/mnt/syslinux.cfg` file, and add/edit the following:

  ```
  default custom
  prompt 0
  timeout 0
  display boot.msg
  label custom
  kernel vmlinuz

  append initrd=initrd.img ks=http://satellite.example.com/kickstart/ks/view_label/<kickstart_label> ksdevice=link noipv6
  ```

* Edit the `/mnt/boot.msg` to say what you want. I recommend removing the lines below `splash.lss` and replace with something like:

  ```
  Your install of Red Hat Enterprise Linux Update 2 (x86_64) will start shortly.
  ``

* Unmount the `diskboot.img` file
* Then burn to a cd, or copy to a jumpdrive with the following command:

  ```bash
  dd if=/root/rhel5u2-64bit.img of=/dev/sdc
  ``

  _NOTE: Replace `/dev/sdc` with the device name of your jumpdrive_

# Rolling the disk image (For cdrom)

Get the first disk of what ever you are trying to install from the kickstart. For this document, I will be using RHEL 5 U2 x86_64

<div class="notification is-danger is-light">The arch and update must match or it will fail.</div>

* Copy the `images/boot.iso` file to `/root/rhel5u2-64bit-boot.iso`
* Mount the `/root/rhel5u2-64bit-boot.iso` file on the loopback `/mnt/`
* Make a directory in `/tmp/` `/tmp/rhel5u2-64bit/`
* Copy `/mnt/*` to that directory
* Unmount the `rhel5u2-64bit-boot.iso` file
* Remove the `rhel5u2-64bit-boot.iso` file to reduce confusion
* Make the `/tmp/rhel5u2-64bit/isolinux/isolinux.cfg` writable by root
* Edit the `/tmp/rhel5u2-64bit/isolinux/isolinux.cfg` file, and add/edit the following:

  ```
  default custom
  prompt 0
  timeout 0
  display boot.msg
  label custom
  kernel vmlinuz

  append initrd=initrd.img ks=http://satellite.example.com/kickstart/ks/view_label/<kickstart_label> ksdevice=link noipv6
  ```

* Edit the `/tmp/rhel5u2-64bit/isolinux/boot.msg` to say what you want. I recommend removing the lines below `splash.lss` and replace with something like:

  ```
  Your install of Red Hat Enterprise Linux Update 2 (x86_64) will start shortly.
  ```

* Then make a bootable iso by running:

  ```bash
  cd /tmp/
  mkisofs -r -T -J \
    -V "RHEL 5u2 x86_64 kickstart iso" \
    -b isolinux/isolinux.bin -c isolinux/boot.cat \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -v -o "/root/rhel5u2-64bit.iso" /tmp/rhel5u2-64bit/
  ```

* The burn the cd as a cd image

# Boot

The insert the media into the machine and boot off of it.