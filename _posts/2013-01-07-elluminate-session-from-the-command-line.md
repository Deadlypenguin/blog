---
post_id: 245
title: Download and launch an Elluminate session from the command line
date: 2013-01-07T18:24:14+00:00
author: pcon
layout: post
permalink: /2013/01/07/elluminate-session-from-the-command-line/
redirect_from:
- /blog/2013/01/07/elluminate-session-from-the-command-line/
aktt_notify_twitter:
- 'no'
dsq_thread_id:
- "1803174618"
categories:
- development
- linux
tags:
- bash
- elluminate
---
We use Elluminate Live! for some of our meetings, and it has always bothered me that I have to launch the browser to use Elluminate especially for reoccurring meetings. So one afternoon I set out to fix this problem. I wrote the following script and have been using it for about a month now without any issues. You can set the parameters at the head of the script if you have a reoccurring meeting you want to use, or set the parameters at run time (or in an alias for multiple reoccurring meetings) if you need too.

<!--more-->

The only prerequisite for this script is to have javaws installed an in your PATH.

```bash
#!/bin/bash

nick="NICKGOESHERE"
participant_password="PASSWORD"
leader_password="PASSWORD"
sid="SID"
output="/tmp/meeting.jnlp"
launch_on_download="true"

#############################################################################
####                   DO NOT EDIT PAST THIS POINT                       ####
#############################################################################

usage() {
  echo "usage: $0 [-n nick] [-p password] [-s sid] [-f file] [-l] [-j]"
	echo -e "\t-n The username"
	echo -e "\t-p The elluminate 'password'"
	echo -e "\t-s The elluminate 'sid'"
	echo -e "\t-l Use the leader password or the provided password is the leader password"
	echo -e "\t-f The output file [default ./meeting.jnlp]"
	echo -e "\t-j Launch the meeting file"
}

password=""
leader="false"

while getopts "hn:p:s:f:l" opt
do
	case $opt in
		n)
			echo "setting nick $OPTARG"
			nick=$OPTARG
			;;
		p)
			echo "setting password $OPTARG"
			password=$OPTARG
			;;
		l)
			echo "using leader password"
			leader="true"
			;;
		s)
			echo "setting sid $OPTARG"
			sid=$OPTARG
			;;
		f)
			echo "setting output $OPTARG"
			output=$OPTARG
			;;
		j)
			launch_on_download="true"
			;;
		h)
			usage
			exit
			;;
		?)
			usage
			exit
			;;
	esac
done

if [ ".$password" == "." ]
then
	if [ ".$leader" == ".true" ]
	then
		password=$leader_password
	else
		password=$participant_password
	fi
fi

if [ ".$output" == "." ]
then
	output_file="meeting.jnlp"
else
	output_file=$output
fi

post_data=""
url=""
curl_type=""
referer=""

if [ ".$leader" == ".true" ]
then
	#Leader needs to be a GET not a POST.  Plus some different headers
	url="https://sas.elluminate.com/site/external/launch/meeting.jnlp?sid=$sid&miuid=$password"
	curl_type="GET"
	referer="https://sas.elluminate.com/site/external/jwsdetect/meeting.jnlp?sid=$sid&miuid=$password"

	curl -s --insecure \
		-H 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
		-H 'Accept-Charset:ISO-8859-1,utf-8;q=0.7,*;q=0.3' \
		-H 'Accept-Encoding:gzip,deflate,sdch' \
		-H 'Accept-Language:en-US,en;q=0.8' \
		-H 'Connection:keep-alive' \
		-H 'DNT:1' \
		-H 'Host:sas.elluminate.com' \
		-H "Referer:$referer" \
		-H 'User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4' \
		-X $curl_type \
		$url > $output_file
else
	post_data="username=$nick&sid=$sid&password=$password&submit.x=0&submit.y=0"
	url="https://sas.elluminate.com/site/external/launch/meeting.jnlp"
	curl_type="POST"
	referer="https://sas.elluminate.com/site/external/launch/meeting.jnlp?sid=$sid&password=$password"

	curl -s --insecure \
		-H 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
		-H 'Accept-Charset:ISO-8859-1,utf-8;q=0.7,*;q=0.3' \
		-H 'Accept-Encoding:gzip,deflate,sdch' \
		-H 'Accept-Language:en-US,en;q=0.8' \
		-H 'Cache-Control:max-age=0' \
		-H 'Connection:keep-alive' \
		-H 'Content-Type:application/x-www-form-urlencoded' \
		-H 'DNT:1' \
		-H 'Host:sas.elluminate.com' \
		-H 'Origin:https://sas.elluminate.com' \
		-H "Referer:$referer" \
		-H 'User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4' \
		-d "$post_data" \
		-X $curl_type \
		$url > $output_file
fi


if [ ".$launch_on_download" == ".true" ]
then
	javaws $output_file
fi
```