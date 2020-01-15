const { smarthome } = require("actions-on-google");
const functions = require("firebase-functions");
const { getUnitState } = require("./utils/units");

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

const requestSync = async (userId) => {
	return app
		.requestSync(userId)
		.then((resp) => {
			console.log("Requested Sync", resp);
			return resp;
		})
		.catch(console.error);
};

const reportState = async (unit) => {
	const unitState = getUnitState(unit);
	return app
		.reportState({
			requestId: Math.random().toString(),
			agentUserId: unit.created_by,
			payload: {
				devices: {
					states: {
						[unit.id]: unitState,
					},
				},
			},
		})
		.then((resp) => {
			console.log("Reported State", resp);
			return resp;
		})
		.catch(console.error);
};

async function handleUnitChange(change) {
	const unitBefore = change.before.data();
	const unitAfter = change.after.data();
	if (JSON.stringify(unitBefore.state) !== JSON.stringify(unitAfter.state)) {
		// Unit State has changed
		await reportState(unitAfter);
		return;
	}
	// Unit Meta Data has changed
	await requestSync(unitAfter.created_by);
	return;
}

exports = module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "128MB",
	})
	.firestore.document("units/{unitId}")
	.onUpdate(handleUnitChange);
