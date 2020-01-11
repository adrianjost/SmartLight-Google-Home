const { db } = require("./utils/firebase");
// Script to setup database for Google OAuth
const seed = async (req, res) => {
	const usersSnapshots = await db.collection("users").get();
	const users = [];
	usersSnapshots.forEach((user) => users.push(user.data()));
	// https://developers.google.com/assistant/identity/oauth2?oauth=code#handle_authorization_requests
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
	res.send("synced");
};

module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest(seed);
