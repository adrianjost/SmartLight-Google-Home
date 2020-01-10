const functions = require("firebase-functions");
const app = require("restana")();

app.use(require("./middleware/cors"));
app.use(require("./middleware/auth"));

app.get("/time", (req, res) => {
	res.send(`server timestamp: ${Date.now()}`);
});

const intents = {
	"action.devices.SYNC": require("./services/sync"),
};

app.post("/", async (req, res) => {
	const intent = req.body.inputs[0].intent;
	console.log("EXECUTE:", req.body)
	try{
		const payload = await intents[intent](req, res);
		res.send({
			requestId: req.body.requestId,
			payload,
		});
	}catch(error){
		console.error(error)
		res.send({
			error
		}, 500)
	}
});

/*
// Script to setup database for Google OAuth
const { db } = require("./initialize");
app.get("/setup-oauth-google", async (req,res) => {
	const usersSnapshots = await db.collection("users").get();
	const users = []
	usersSnapshots.forEach(user => users.push(user.data()));
		// https://developers.google.com/assistant/identity/oauth2?oauth=code#handle_authorization_requests
		const userRef = db.collection("clients").doc("<OAuth Client ID>");
		const client = {
			"user_id": "<OAuth Client ID>",
			"provider_name": "Google, Inc.",
			"client_secret": "<OAuth Client Secret>",
			"redirect_uri": "https://oauth-redirect.googleusercontent.com/r/<PROJECT_ID>",
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
				"units": true
			}
		}
		await userRef.set(client, { merge: true })
	res.send("synced")
})
*/

module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest(app.callback());
