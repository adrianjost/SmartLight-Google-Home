const {
	AbstractProtectedResourceEndpoint,
} = require("@adrianjost/oauth2-firebase");

// const { getUnitsByUserid } = require("./utils/units");
// getUnitsByUserid("IcAd2hRhBoRs5WTORWTTCSaRSvy2")
// 	.then((units) => {
// 		console.log("GOT UNITS", units);
// 	})
// 	.catch((error) => {
// 		console.error("ERROR", error);
// 	});

class UserinfoEndpoint extends AbstractProtectedResourceEndpoint {
	async handleRequest(req, endpointInfo) {
		console.info("ℹ ACCESS GRANTED - HANDLE REQUEST");
		console.debug(
			"ℹ AUTHORIZATION HEADER:",
			req.headers.authorization,
			endpointInfo.userId
		);
		const intents = {
			"action.devices.SYNC": require("./services/sync"),
			"action.devices.QUERY": require("./services/query"),
			"action.devices.EXECUTE": require("./services/execute"),
			"action.devices.DISCONNECT": require("./services/disconnect"),
		};
		req.auth = { userid: endpointInfo.userId };
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

module.exports = new UserinfoEndpoint().endpoint;
