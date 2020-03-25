---
post_id: 1289
title: 'JWT Bearer Authentication: Salesforce and Node'
date: 2019-03-08T16:02:22+00:00
author: pcon
layout: post
permalink: /2019/03/08/jwt-bearer-auth-salesforce-node/
redirect_from:
- /blog/2019/03/08/jwt-bearer-auth-salesforce-node/
thumbnail: /assets/img/2019/03/08/post_thumbnail.png
dsq_thread_id:
- "7280563536"
categories:
- development
- nodejs
- salesforce
tags:
- api
- authentication
- jwt
- oauth
---
If you've done much API generation then you'll that you don't want to have to make your users authenticate multiple times just because your API is going somewhere external.  For example, if you have an API that reaches into Salesforce but your app uses [Google SSO](http://blog.deadlypenguin.com/blog/2019/03/05/single-sign-on-salesforce-google/), you don't want to have to present an oauth screen to your user after they've already authenticated.  To work around this, you can use a [JWT Bearer flow](https://help.salesforce.com/articleView?id=remoteaccess_oauth_jwt_flow.htm&type=5) to login on behalf of a user and get a access token to work with.

<!--more-->

# Generate private key and cert

To validate that you are who you say you are, this process needs you to generate an x509 certificate and key.  Your JWT requests will be signed with this key and validate that you're suppose to be able login as the user.

<div class="notification is-danger">
  This key is very very powerful.  This could allow someone to pretend to be a System Administrator if you are not careful.  Treat this key like a password being held by a baby in a china shop.
</div>

To generate the key and certificate run the following OpenSSL command

```bash
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem
```

# Create a Connected App

To connect to our Salesforce instance, we'll need to create a connected app.  How to start the process differs slightly if you are in Lightning vs Classic

1. Create the connected app
    * _Lightning:_ Navigate to Setup ⇨ Apps ⇨ App Manager and click **New Connected App**
    * _Classic:_ Navigate to Setup ⇨ Create ⇨ Apps and click **New** under the _Connected Apps_ section
2. Pick a _Name_ and fill in the _Contact Email_ field
3. Check _Enable OAuth Settings_
4. Check _Enable for Device Flow_
5. Check _Enable digital signatures_ and choose the cetificate.pem file we created ealier
6. Choose your _OAuth Scopes_ depending on what your application is going to do
7. Click **Save**
8. Click **Continue**

![Connected App Configuration](/assets/img/2019/03/08/connectedAppConfiguration.png)

From the view page of you copy the _Consumer Key_ and _Consumer Secret_ we'll need them for future steps

1. Click **Manage**
2. Click  **Edit Policies**
3. Change _Permitted Users_ to **Admin approved users are pre-authorized**
4. Click **Save**
5. Click **Manage Profiles**
6. Select **System Administrator**
7. Click **Save**

We're choosing just the administrator profile for now.  Once we've done our first login to the connected app, the list of profiles and permission sets can be changed.  You'll want to make sure that this is as restrictive as it can be.  If you're using JWT Bearer for something like external API for community users, restrict it just to that profile.  Remember if your JWT key gets exposed, anyone with that key can impersonate any user with that profile / permission including System Administrators.

# Authenticate Against Your Connected App

Before we can use our JWT flow with any user without prompting, we must authenticate at least once with the normal OAuth.  There are several ways to do this but I've found that using cURL and a little bit of manual work does the job well enough.  In the commands below, we're going to use the _Consumer Key_ and _Consumer Secret_ from the previous steps.

```bash
curl -X GET -D - -o /dev/null "https://login.salesforce.com/services/oauth2/authorize?response_type=code&redirect_uri=https://login.salesforce.com/services/oauth2/success&client_id=<CONSUMER_KEY>"
```

Visit the Location URL in your browser and finish the OAuth flow of authenticating your user.  This will then redirect you to a URL with a parameter of `code`.  Copy that code and use it below.

```bash
curl -X POST "https://login.salesforce.com/services/oauth2/token?grant_type=authorization_code&redirect_uri=https://login.salesforce.com/services/oauth2/success&client_secret=<CONSUMER_SECRET>&client_id=<CONSUMER_KEY>&code=<CODE>"
```

Now you should be able to make JWT requests for other users without having to authorized the application.

# Using JWT to get an access token

In order to get the access token we need to create a JWT request and sign it to validate that we are who we say we are.  This is pretty easy to do in node with the [jsonwebtoken package](https://www.npmjs.com/package/jsonwebtoken).

First we need to load our credentials and our key into memory

```apexscript
var privatekey = fs.readFileSync('certs/key.pem');
var credentials = require('./credentials.js');
```

Then we can generate our JWT parameters.  You may not need to set `exp` manually but I did it just to be sure.

```apexscript
var jwtparams = {
    iss: credentials.salesforce.consumer_key,
    prn: credentials.salesforce.username,
    aud: credentials.salesforce.url,
    exp: parseInt(moment().add(2, 'minutes').format('X'))
};
```

Then we sign our token and generate our POST parameters

```apexscript
var token = jwt.sign(jwtparams, privatekey, { algorithm: 'RS256' });

var params = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: token
};
```

Now we can generate our request to get our access token and do something with it

```apexscript
var token_url = new url.URL('/services/oauth2/token', credentials.salesforce.url).toString();

axios.post(token_url, querystring.stringify(params))
    .then(function (res) {
        var conn = new jsforce.Connection({
            instanceUrl: res.data.instance_url,
            accessToken: res.data.access_token
        });

        conn.query('select CaseNumber, Subject from Case limit 1', function (err, results) {
            console.log(JSON.stringify(results.records[0])); // eslint-disable-line no-console
        });
});
```

You can see the full implementation on my [Github](https://github.com/pcon/SalesforceApps/blob/master/sso_example/jwt.js).

# Conclusions

Once you understand how to setup the connected app and you know that you have to authenticate against the app once using JWT is pretty easy.  In a future post, I'll combine the [Google SSO](http://blog.deadlypenguin.com/blog/2019/03/05/single-sign-on-salesforce-google/) with JWT to show how you can tie them together and get Salesforce data from a Google OAuth'd server.