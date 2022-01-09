const {
	AbstractProtectedResourceEndpoint,
} = require("@adrianjost/oauth2-firebase");
const logger = require("./utils/logger");

// const { getUnitsByUserID } = require("./utils/units");
// getUnitsByUserID("...")
// 	.then((units) => {
// 		logger.log("GOT UNITS", units);
// 	})
// 	.catch((error) => {
// 		logger.error("ERROR", error);
// 	});

class UserInfoEndpoint extends AbstractProtectedResourceEndpoint {
	async handleRequest(req, endpointInfo) {
		logger.log("ℹ ACCESS GRANTED - HANDLE REQUEST");
		logger.log(
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
			logger.log("ℹ HANDLE INTENT", intent);
			const intentHandler = intents[intent];
			payload = await intentHandler(req);
		} catch (error) {
			logger.error("❌ ERROR", error);
			throw error;
		}
		logger.log("ℹ PAYLOAD GENERATED", payload);
		const response = {
			requestId: req.body.requestId,
			payload,
		};
		logger.log("ℹ RESPONSE", response);
		return response;
	}

	validateScope(scopes) {
		return scopes.indexOf("units") !== -1;
	}
}

module.exports = new UserInfoEndpoint().endpoint;
