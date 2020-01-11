const { AbstractProtectedResourceEndpoint } = require("oauth2-firebase");

class UserinfoEndpoint extends AbstractProtectedResourceEndpoint {
	handleRequest(req, endpointInfo) {
		const intents = {
			"action.devices.SYNC": require("./services/sync"),
		};
		req.auth = { userid: endpointInfo.userId };
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			try {
				const intent = req.body.inputs[0].intent;
				const payload = await intents[intent](req);
				console.info("ℹ RESPONSE", payload);
				resolve({
					requestId: req.body.requestId,
					payload,
				});
			} catch (error) {
				console.error(error);
				reject(error);
			}
		});
	}

	validateScope(scopes) {
		return scopes.indexOf("units") !== -1;
	}
}

module.exports = new UserinfoEndpoint().endpoint;
/*
module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest((req, res) => {
		console.info("ℹ Request:", req.method, req.originalUrl);
		console.info("ℹ REQ AUTHORIZATION-HEADER:", req.headers.authorization);
		console.info("ℹ REQ BODY:", req.body);
		(req, res);
	});
*/
