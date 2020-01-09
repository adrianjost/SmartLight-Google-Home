const functions = require("firebase-functions");
const { db } = require("../initialize");

async function handleUserCreate(snapshot, context) {
	const userId = context.params.userId
	const userRef = db.collection("clients").doc(userId);
	const client = {
		"user_id": userId,
		"provider_name": "Google, Inc.",
		"client_secret": "foobar123456",
		"redirect_uri": "https://foobar.com/foo/bar/baz",
		"grant_type": {
			"authorization_code": true,
			"password": false,
			"client_credentials": true,
			"refresh_token": true
		},
		"response_type": {
			"code": true,
			"token": true
		},
		"scope": {
			"all": true
		}
	}
	await userRef.set(client, { merge: true });
}

async function handleUserDelete(snapshot, context){
	return db.collection('clients').doc(context.params.userId).delete()
}

module.exports = {
	CREATE: functions
	.runWith({
		timeoutSeconds: 30,
		memory: "128MB",
	})
	.firestore.document("users/{userId}")
	.onCreate(handleUserCreate),
	DELETE: functions
	.runWith({
		timeoutSeconds: 30,
		memory: "128MB",
	})
	.firestore.document("users/{userId}")
	.onCreate(handleUserDelete)
}