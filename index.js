// OAuth Server
Object.assign(exports, require("./functions/oauth2.function.js"));

// Home Graph API
exports["GoogleHome"] = require("./functions/GoogleHome.function.js");
// Push to Home Graph API
exports[
	"ReportStateAndRequestSync"
] = require("./functions/reportStateAndRequestSync");
