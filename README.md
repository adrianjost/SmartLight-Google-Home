# SmartLight Google Home

![CI](https://github.com/adrianjost/SmartLight-Google-Home/workflows/CI/badge.svg) [![Dependency Status](https://david-dm.org/adrianjost/SmartLight-Google-Home.svg)](https://david-dm.org/adrianjost/SmartLight-Google-Home) [![Dependency Status](https://david-dm.org/adrianjost/SmartLight-Google-Home/dev-status.svg)](https://david-dm.org/adrianjost/SmartLight-Google-Home?type=dev)

## Setup

1. install npm
1. run `npm install`
1. set credentials: `set GOOGLE_APPLICATION_CREDENTIALS=../path/to.json` ([more infos](https://firebase.google.com/docs/admin/setup#initialize-sdk))
1. create config `.runtimeconfig.json` with keys `crypto.auth_token_secret_key_32` and `project.api_key`
1. Set firebase env variables
   1. firebase functions:config:set crypto.jwt=<GOOGLE_APPLICATION_CREDENTIALS.JSON> (content of file located at GOOGLE_APPLICATION_CREDENTIALS JSON stringified and base64 encoded)
      - you can use `console.log(Buffer.from(JSON.stringify(<JSON OBJECT>)).toString('base64'));` to create it
   1. firebase functions:config:set crypto.auth_token_secret_key_32=<YOUR_GENERATED_RANDOM_32_CHAR_STRING>
   1. firebase functions:config:set project.api_key=<YOUR_WEB_API_KEY>
1. Start developing (`npm run serve`)

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
