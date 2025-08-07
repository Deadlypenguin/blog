---
post_id: 1305
title: 'Printing a BOM on a thermal printer'
date: 2025-08-07T11:30:00+00:00
author: pcon
layout: post
description: Dynamically creating a bill of materials (BOM) and printing it out on a thermal printer.
permalink: /2025/08/07/thermal-printer-bom/
thumbnail: /assets/img/2025/08/07/post_thumbnail.png
categories:
- bash
- development
tags:
- printing
- productivity
- ADHD
---

A constant problem I have is printing / engraving several unique parts that then I have to keep track of.  Typically I just grab a post-it note, a sheet of paper or in the worst cases a random piece of scrap wood to write down the list of items I need to keep track of.  Typically, this is a list of 3D printed parts or names to engrave on bottles for groups of people.  To help make my workflow easier I bought a cheap thermal printer and wrote some scripts to print to it.  Let's take a look at how it's done.

<!--more-->

## Inspiration

I got the inspiration to do this project after seeing [Coding with Lewis](https://www.youtube.com/@CodingWithLewis)'s video [I Fixed My ADHD with a Receipt Printer](https://www.youtube.com/watch?v=xg45b8UXoZI) and the thought of using a receipt printer in some project just wouldn't leave my head.

## Thermal Printer

The base of this project is the thermal printer.  There are lots of options out there for lots of different budgets but I chose one that was small, self contained and most importantly cheap!  I settled on the [Sunnydog 58mm](https://www.amazon.com/dp/B0CL481GS1) thermal printer as it seemed to meet my criteria and looked like it would support the [escpos library](https://github.com/python-escpos/python-escpos) I wanted to use.

## The Code

### Printer Configuration

After unboxing the printer and hooking it up via the included USB C cable (thank goodness for a modern connection), it shows right up in `lsusb` and after following [the documentation](https://python-escpos.readthedocs.io/en/latest/user/usage.html), I was able to create the `$HOME/.config/python-escpos/config.yml` below.

```yaml
printer:
  type: Usb
  idVendor: 0x6868
  idProduct: 0x0200
  in_ep: 0x82
  out_ep: 0x01
  profile: default
  highDensity: false
  media:
    width:
      mm: 48
      pixels: 384
    dpi: 203
```

_Note: This should work if you got the same printer, but double check the `lsusb` output to verify that you've got the same ids and EP addresses_

Putting this YAML in our user's home directory allows us to use the `python-escpos` commands directly without having to specify everything in flags.

### Generating Data To Print

My current 3D printing project for this was to take a folder of STL files for my kid's halloween costume and print out 32 individual parts.  I didn't want to have to write them all out by hand nor do I want to generate the JSON by hand either.  So the following script lists all of the files in the current directory and spits out JSON content to generate a checkbox.  This does require [jq](https://jqlang.org/download/) to be installed.  You can optionally pass in the title that gets printed at the top of the receipt.  If this isn't passed in, it will grab the directory name for the title

```bash
#!/bin/bash
# pos_genchecklist_dir_stl_json.sh "Title Goes Here"

if ! command -v jq &>/dev/null; then
        echo "Unable to find command 'jq'"
        exit 1
fi

TITLE=$1

if [ -z "${TITLE}" ]; then
        TITLE="${PWD##*/}"
fi

ls -1dv *.stl |
    jq -R '{"content": ., "type": "checkbox"}' |
    jq -s --arg TITLE "$TITLE" '{"title": $TITLE, "items": .}'
```

### Printing The JSON Data

To actually print the data I wrote a script that parses the JSON, combines it into something that can be passed around in a bash array and then calls various `python-escpos` commands.  I'll likely rewrite much of this into [nodeJS scripts](https://github.com/lsongdev/node-escpos) soon.

```bash
#!/bin/bash
# pos_print_json.sh "/path/to/file.json"

if ! command -v jq &>/dev/null; then
        echo "Unable to find command 'jq'"
        exit 1
fi

if ! command -v python-escpos &>/dev/null; then
        echo "Unable to find command 'python-escpos'"
        exit 1
fi

JSON_FILE=$1

if [ ! -f "${JSON_FILE}" ]; then
        echo "Unable to load ${JSON_FILE}"
        exit 1
fi

TITLE=$(jq -r ".title" "${JSON_FILE}")
ITEMS=$(jq -r '.items[] | (.content + ":" + .type)' "${JSON_FILE}")

CHARACTER_WIDTH=32
HEADER_CHAR="="
printf -v repeated_char "%${CHARACTER_WIDTH}s" ""
HEADER="${repeated_char// /${HEADER_CHAR}}"

python-escpos set --align center
python-escpos text --txt "${TITLE}"
python-escpos text --txt "${HEADER}"
python-escpos text --txt ""

python-escpos set --align left
for ITEM in ${ITEMS}; do
        IFS=":" read -r -a ITEM_PARTS <<<"${ITEM}"
        CONTENT="${ITEM_PARTS[0]}"
        TYPE="${ITEM_PARTS[1]}"

        if [[ "${TYPE}" == "checkbox" ]]; then
                CONTENT="[ ] $CONTENT"
        fi

        python-escpos text --txt "${CONTENT}"
done

python-escpos cut
```

### Tying It All Together

Now, let's tie it all together by using a wrapper script to call from the directory to print the receipt.

```bash
#!/bin/bash
# pos_genchecklist_dir_stl.sh "Title Goes Here"

TITLE=$1
JSON_FILE="/tmp/pos_data.json"

pos_genchecklist_dir_stl_json.sh "${TITLE}" >"${JSON_FILE}"
pos_print_json.sh "${JSON_FILE}"
```

## Printing It Out

Now, I simply go into the directory that has all my helmet STLs and run `pos_genchecklist_dir_stl.sh "X-Wing Pilot Helmet"`

![Printed Receipt](/assets/img/2025/08/07/printed_receipt.jpg)

## What's Next

Next I want to clean this up to make it easier to do new things like importing a CSV file and spitting out fields easier.  This would help with creating a list of names for laser engraving.
