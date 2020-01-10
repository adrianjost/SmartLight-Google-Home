// OAuth Server
Object.assign(exports, require("./functions/oauth2.function.js"));

// Home Graph API
exports["GoogleHome"] = require("./functions/index.function.js");
