// @ts-check
const { homegraph, auth } = require("@googleapis/homegraph");
const { getUnitState } = require("./utils/units");
const { isUserRegistered } = require("./utils/user");
const logger = require("./utils/logger");
const { highResourceFunction } = require("./utils/function");

const homegraphAPI = homegraph("v1");

const requestSync = async (userID) => {
	return homegraphAPI.devices
		.requestSync({
			requestBody: {
				agentUserId: userID,
			},
			auth: await auth.getClient({
				scopes: ["https://www.googleapis.com/auth/homegraph"],
			}),
		})
		.then((resp) => {
			logger.log("🤖 Requested Sync", userID, resp);
			return resp;
		})
		.catch(logger.error);
};

const reportState = async (userID, unit) => {
	logger.log("🤖 GENERATE UNIT STATE", unit);
	const unitState = getUnitState(unit);
	const payload = {
		devices: {
			states: {
				[unit.id]: unitState,
			},
		},
	};
	logger.log("🤖 GENERATED PAYLOAD FOR reportState", payload);
	return homegraphAPI.devices
		.reportStateAndNotification({
			requestBody: {
				agentUserId: userID,
				payload,
			},
			auth: await auth.getClient({
				scopes: ["https://www.googleapis.com/auth/homegraph"],
			}),
		})
		.then((resp) => {
			logger.log("🤖 Reported State", userID, resp);
			return resp;
		})
		.catch(logger.error);
};

async function handleUnitChange(change) {
	const unitBefore = change.before.data();
	const unitAfter = change.after.data();

	const handleRequest = await isUserRegistered(
		unitAfter.created_by || unitBefore.created_by
	);
	if (!handleRequest) {
		logger.log(
			"🤖 user is not connected to API => DO NOT PUSH EVENTS",
			unitAfter.created_by
		);
		// user has not enabled this API
		return;
	}

	if (!change.after.exists()) {
		// Unit was deleted
		logger.log("🤖 request sync...", unitBefore.created_by);
		await requestSync(unitBefore.created_by);
		return;
	}

	if (JSON.stringify(unitBefore.state) !== JSON.stringify(unitAfter.state)) {
		// Unit State has changed or unit was added
		logger.log("🤖 report state...", unitAfter.created_by);
		await reportState(unitAfter.created_by, unitAfter);
		return;
	}
	// Unit Meta Data has changed
	logger.log("🤖 request sync...", unitAfter.created_by);
	await requestSync(unitAfter.created_by);
	return;
}

exports = module.exports = highResourceFunction.firestore
	.document("units/{unitId}")
	.onUpdate(handleUnitChange);
