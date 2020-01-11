const { AbstractProtectedResourceEndpoint } = require("oauth2-firebase");

class UserinfoEndpoint extends AbstractProtectedResourceEndpoint {
	async handleRequest(req, endpointInfo) {
		console.info("ℹ ACCESS GRANTED - HANDLE REQUEST");
		const intents = {
			"action.devices.SYNC": require("./services/sync"),
			"action.devices.QUERY": require("./services/query"),
		};
		req.auth = { userid: endpointInfo.userId };
		const intent = req.body.inputs[0].intent;
		console.info("ℹ HANDLE INTENT", intent);
		const payload = await intents[intent](req);
		console.info("ℹ RESPONSE", payload);
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
