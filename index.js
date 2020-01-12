require("./functions/utils/logger")({
	replaceConsole: true,
	logLevel: "warn",
	modifier: (...a) =>
		a.map((b) =>
			typeof b === "object" && !(b instanceof Error) ? JSON.stringify(b) : b
		),
});

// OAuth Server
Object.assign(exports, require("./functions/oauth2.function.js"));

// Home Graph API
exports["GoogleHome"] = require("./functions/GoogleHome.function.js");
