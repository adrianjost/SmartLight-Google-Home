

// OAuth Server
exports["OAuth2-UsersCreate"] = require("./functions/oauth2/user-sync.function.js").CREATE;
exports["OAuth2-UsersDelete"] = require("./functions/oauth2/user-sync.function.js").DELETE;
exports["OAuth2"] = require("./functions/oauth2/server.function.js");

// Home Graph API
exports["GoogleHome"] = require("./functions/index.function.js");
