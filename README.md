# SmartLight Firebase Functions

[![Build Status](https://travis-ci.com/adrianjost/SmartLight-Google-Home.svg?branch=master)](https://travis-ci.com/adrianjost/SmartLight-Google-Home) [![Greenkeeper badge](https://badges.greenkeeper.io/adrianjost/SmartLight-Google-Home.svg)](https://greenkeeper.io/)

## Setup

1. install Yarn
1. run `yarn install`
1. create config `.runtimeconfig.json` with keys `crypto.auth_token_secret_key_32` and `project.api_key`
1. Start developing (`yarn serve`)

make sure you have a user with the permission `Firebase Admin SDK-Administrator-Service-Agent` created [here](https://console.cloud.google.com/iam-admin/iam) and the functions are executed by this account.

### OAuth2 Server

The OAuth2 Server requires a couple of database entries to be set in firestore:

**Clients:**

```js
// db = admin.firestore...
const userRef = db.collection("clients").doc("<OAuth Client ID>");
const client = {
	user_id: "<OAuth Client ID>",
	provider_name: "Google, Inc.",
	client_secret: "<OAuth Client Secret>",
	redirect_uri: "https://oauth-redirect.googleusercontent.com/r/<PROJECT_ID>",
	grant_type: {
		authorization_code: true,
		password: false,
		client_credentials: true,
		refresh_token: true,
	},
	response_type: {
		code: true,
		token: true,
	},
	scope: {
		units: true,
	},
};
await userRef.set(client, { merge: true });
```

**Scopes:**

```js
// db = admin.firestore...
const userRef = db.collection("clients").doc("<OAuth Client ID>");
const client = {
	name: "some scope name", // will be used as an identifier when requesting access to resources (the sender defines and sends scope access requests)
	description: "explenation for the user for which data access will be granted",
};
await userRef.set(client, { merge: true });
```
