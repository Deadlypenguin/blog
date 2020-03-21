---
post_id: 775
title: SSL and Outbound Messaging
date: 2016-02-01T08:00:06+00:00
author: pcon
layout: post
permalink: /2016/02/01/ssl-and-outbound-messaging/
redirect_from:
- /blog/2016/02/01/ssl-and-outbound-messaging/
dsq_thread_id:
- "4537930265"
categories:
- development
- nodejs
- salesforce
tags:
- nodejs
- outboundmessaging
---
Recently I started setting up some Outbound Messaging to I needed to set up a blackhole (messaging sink) for messages to go to until we had stood up the real messaging endpoint.  To host this I setup a simple [nodejs service](https://github.com/pcon/salesforce-blackhole) on our company's externally available (but internally hosted) instance of [Openshift](http://openshift.redhat.com).  This service simply sends back the appropriate ACK for any XML that is POSTed to it.

<!--more-->

However when I set this up on our sandbox host as an outbound message on a case workflow (Read more [here](http://blog.deadlypenguin.com/blog/2016/01/19/salesforce-and-fuse-rolling-your-own-esb/)) I got the following error from Salesforce

```text
javax.net.ssl.SSLPeerUnverifiedException: sun.security.validator.ValidatorException: PKIX path building failed
```

After some digging and some help from the absolutely wonderful [Metadaddy](https://twitter.com/metadaddy) (aka Pat Patterson) the issue was determined to be that the host was not properly returning the entire SSL chain back to the client correctly.  To test this further, I pushed the same code to [Heroku](http://heroku.com) and to our public [Openshift](https://www.openshift.com/) hosts.  Then, after running the openssl commands below, you can see the certificate chain traversal.  The rhcloud (Openshift) and herokuapp hosts provide the chain correctly where as the itos (internal Openshift) does not.

```text
# openssl s_client -showcerts -connect salesforceblackhole-pconnell.rhcloud.com:443

depth=2 C = US, O = DigiCert Inc, OU = www.digicert.com, CN = DigiCert High Assurance EV Root CA
verify return:1
depth=1 C = US, O = DigiCert Inc, OU = www.digicert.com, CN = DigiCert SHA2 High Assurance Server CA
verify return:1
depth=0 C = US, ST = North Carolina, L = Raleigh, O = Red Hat Inc., CN = *.rhcloud.com
verify return:1
CONNECTED(00000003)

# openssl s_client -showcerts -connect salesforce-blackhole.herokuapp.com:443

depth=2 C = US, O = DigiCert Inc, OU = www.digicert.com, CN = DigiCert High Assurance EV Root CA
verify return:1
depth=1 C = US, O = DigiCert Inc, OU = www.digicert.com, CN = DigiCert SHA2 High Assurance Server CA
verify return:1
depth=0 C = US, ST = California, L = San Francisco, O = "Heroku, Inc.", CN = *.herokuapp.com
verify return:1
CONNECTED(00000003)

# openssl s_client -showcerts -connect blackhole-pcon.itos.redhat.com:443

depth=0 C = US, ST = North Carolina, L = Raleigh, O = Red Hat Inc., CN = *.itos.redhat.com
verify error:num=20:unable to get local issuer certificate
verify return:1
depth=0 C = US, ST = North Carolina, L = Raleigh, O = Red Hat Inc., CN = *.itos.redhat.com
verify error:num=27:certificate not trusted
verify return:1
depth=0 C = US, ST = North Carolina, L = Raleigh, O = Red Hat Inc., CN = *.itos.redhat.com
verify error:num=21:unable to verify the first certificate
verify return:1
CONNECTED(00000003)
```

While this does not affect SSL negatively (the bits are still properly encrypted), it does mean that the client has to figure out the SSL chain itself.  Some clients (such as Chrome) do this without issue, however Salesforce refuses to do it.  The way Salesforce handles this issue is not incorrect since the server should be handing it back correctly.  Fortunately our team was able to get a fix for this issue quickly and now all three hosts return the expected data.