const { smarthome } = require("actions-on-google");
const functions = require("firebase-functions");
const { getUnitState } = require("./utils/units");
const { isUserRegistered } = require("./utils/user");

const jwt = JSON.parse(
	Buffer.from(functions.config().crypto.jwt, "base64").toString("ascii")
);
if (!jwt) {
	console.warn("Service account key is not found");
	console.warn("Report state and Request sync will be unavailable");
}

const app = smarthome({
	jwt,
	debug: true,
});

const requestSync = async (userid) => {
	return app
		.requestSync(userid)
		.then((resp) => {
			console.log("ℹ Requested Sync", userid, resp);
			return resp;
		})
		.catch(console.error);
};

const reportState = async (userid, unit) => {
	console.log("ℹ GENERATE UNIT STATE", unit);
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
	console.log("ℹ GENERATED PAYLOAD", payload);
	return app
		.reportState({
			requestId: Math.random().toString().slice(3),
			agentUserId: userid,
			payload,
		})
		.then((resp) => {
			console.log("ℹ Reported State", userid, resp);
			return resp;
		})
		.catch(console.error);
};

async function handleUnitChange(change) {
	const unitBefore = change.before.data();
	const unitAfter = change.after.data();

	const handleRequest = await isUserRegistered(unitAfter.created_by);
	if (!handleRequest) {
		console.log(
			"ℹ user is not connected to API => DO NOT PUSH EVENTS",
			unitAfter.created_by
		);
		// user has not enabled this API
		return;
	}

	if (JSON.stringify(unitBefore.state) !== JSON.stringify(unitAfter.state)) {
		// Unit State has changed
		console.log("ℹ report state...", unitAfter.created_by);
		await reportState(unitAfter.created_by, unitAfter);
		return;
	}
	// Unit Meta Data has changed
	console.log("ℹ request sync...", unitAfter.created_by);
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
