// OAuth Server - https://github.com/organicinternet/oauth2-firebase

const functions = require("firebase-functions");
const app = require("restana")();
const {
	authorize,
	Configuration,
	googleAccountAuthentication,
	token,
} = require("oauth2-firebase");

// Before Deploy Set:
// firebase functions:config:set crypto.auth_token_secret_key_32=<YOUR_GENERATED_RANDOM_32_CHAR_STRING>
// firebase functions:config:set project.api_key=<YOUR_WEB_API_KEY>

Configuration.init({
	crypto_auth_token_secret_key_32: functions.config().crypto
		.auth_token_secret_key_32,
	project_api_key: functions.config().project.api_key,
});


app.use(require("../middleware/cors"));

app.get("/token", token());
app.get("/authorize", authorize());
app.get("/authentication", googleAccountAuthentication());

module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest(app.callback());
