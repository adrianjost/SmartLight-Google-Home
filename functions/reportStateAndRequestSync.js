const { smarthome } = require("actions-on-google");
const functions = require("firebase-functions");
const { getUnitState } = require("./utils/units");
const { isUserRegistered } = require("./utils/user");
const logger = require("./utils/logger");

const jwt = JSON.parse(
	Buffer.from(functions.config().crypto.jwt, "base64").toString("ascii")
);
if (!jwt) {
	logger.warn("Service account key is not found");
	logger.warn("Report state and Request sync will be unavailable");
}

const app = smarthome({
	jwt,
	debug: true,
});

const requestSync = async (userID) => {
	return app
		.requestSync(userID)
		.then((resp) => {
			logger.log("ℹ Requested Sync", userID, resp);
			return resp;
		})
		.catch(logger.error);
};

const reportState = async (userID, unit) => {
	logger.log("ℹ GENERATE UNIT STATE", unit);
	const unitState = getUnitState(unit);
	// convert spectrumRGB name according to https://github.com/actions-on-google/smart-home-nodejs/issues/257#issuecomment-461208257
	delete unitState["online"];
	if (unitState.hasOwnProperty("spectrumRgb")) {
		unitState.color = {
			spectrumRGB: unitState["spectrumRgb"],
		};
		delete unitState["spectrumRgb"];
	}
	const payload = {
		devices: {
			states: {
				[unit.id]: unitState,
			},
		},
	};
	logger.log("ℹ GENERATED PAYLOAD", payload);
	return app
		.reportState({
			requestId: Math.random().toString().slice(3),
			agentUserId: userID,
			payload,
		})
		.then((resp) => {
			logger.log("ℹ Reported State", userID, resp);
			return resp;
		})
		.catch(logger.error);
};

async function handleUnitChange(change) {
	const unitBefore = change.before.data();
	const unitAfter = change.after.data();

	const handleRequest = await isUserRegistered(unitAfter.created_by);
	if (!handleRequest) {
		logger.log(
			"ℹ user is not connected to API => DO NOT PUSH EVENTS",
			unitAfter.created_by
		);
		// user has not enabled this API
		return;
	}

	if (JSON.stringify(unitBefore.state) !== JSON.stringify(unitAfter.state)) {
		// Unit State has changed
		logger.log("ℹ report state...", unitAfter.created_by);
		await reportState(unitAfter.created_by, unitAfter);
		return;
	}
	// Unit Meta Data has changed
	logger.log("ℹ request sync...", unitAfter.created_by);
	await requestSync(unitAfter.created_by);
	return;
}

exports = module.exports = functions
	.runWith({
		timeoutSeconds: 15,
		memory: "4GB",
	})
	.firestore.document("units/{unitId}")
	.onUpdate(handleUnitChange);
