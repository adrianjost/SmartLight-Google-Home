// OAuth Server - https://github.com/organicinternet/oauth2-firebase

// Before Deploy Set:
// firebase functions:config:set crypto.auth_token_secret_key_32=<YOUR_GENERATED_RANDOM_32_CHAR_STRING>
// firebase functions:config:set project.api_key=<YOUR_WEB_API_KEY>

const functions = require("firebase-functions");
const {
  authorize,
	Configuration,
	googleAccountAuthentication,
	token,
} = require("oauth2-firebase");

Configuration.init({
  crypto_auth_token_secret_key_32: functions.config().crypto
  .auth_token_secret_key_32,
	project_api_key: functions.config().project.api_key,
});

module.exports = {
	"OAuth2UsersCreate": require("./user-sync.function.js").CREATE,
	"OAuth2UsersDelete": require("./user-sync.function.js").DELETE,
	"OAuth2/token": token(),
	"OAuth2/authorize": authorize(),
	"OAuth2/authentication": googleAccountAuthentication(),
}