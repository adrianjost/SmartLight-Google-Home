const {
	AbstractProtectedResourceEndpoint,
} = require("@adrianjost/oauth2-firebase");

// const { getUnitsByUserID } = require("./utils/units");
// getUnitsByUserID("...")
// 	.then((units) => {
// 		console.log("GOT UNITS", units);
// 	})
// 	.catch((error) => {
// 		console.error("ERROR", error);
// 	});

class UserInfoEndpoint extends AbstractProtectedResourceEndpoint {
	async handleRequest(req, endpointInfo) {
		console.info("ℹ ACCESS GRANTED - HANDLE REQUEST");
		console.debug(
			"ℹ AUTHORIZATION HEADER:",
			req.headers.authorization,
			endpointInfo.userId
		);
		const intents = {
			"action.devices.SYNC": require("./intents/sync"),
			"action.devices.QUERY": require("./intents/query"),
			"action.devices.EXECUTE": require("./intents/execute"),
			"action.devices.DISCONNECT": require("./intents/disconnect"),
		};
		req.auth = { userID: endpointInfo.userId };
		const intent = req.body.inputs[0].intent;
		let payload;
		try {
			console.info("ℹ HANDLE INTENT", intent);
			payload = await intents[intent](req);
		} catch (error) {
			console.error("❌ ERROR", error);
			throw error;
		}
		console.info("ℹ PAYLOAD GENERATED", payload);
		const response = {
			requestId: req.body.requestId,
			payload,
		};
		console.info("ℹ RESPONSE", response);
		return response;
	}

	validateScope(scopes) {
		return scopes.indexOf("units") !== -1;
	}
}

module.exports = new UserInfoEndpoint().endpoint;
