const { AbstractProtectedResourceEndpoint } = require("oauth2-firebase");

class UserinfoEndpoint extends AbstractProtectedResourceEndpoint {
	async handleRequest(req, endpointInfo) {
		const intents = {
			"action.devices.SYNC": require("./services/sync"),
		};
		req.auth = { userid: endpointInfo.userId };
		const intent = req.body.inputs[0].intent;
		const payload = await intents[intent](req);
		return {
			requestId: req.body.requestId,
			payload,
		};
	}

	validateScope(scopes) {
		return scopes.indexOf("units") !== -1;
	}
}

module.exports = new UserinfoEndpoint().endpoint;
