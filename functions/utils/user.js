const { db } = require("./firebase");
const logger = require("./logger");

const registrationCache = {};

/**
 * @param  {string} userID
 * @return {Promise}
 */
const registerUser = async (userID) => {
	logger.log("🤖 REGISTER USER", userID);
	registrationCache[userID] = true;
	await db.collection("users").doc(userID).update({
		google_home_graph: true,
	});
	logger.log("🤖 REGISTERED USER", userID);
};

/**
 * @param  {string} userID
 * @return {Promise}
 */
const disconnectUser = async (userID) => {
	logger.log("🤖 DISCONNECT USER", userID);
	registrationCache[userID] = false;
	await db.collection("users").doc(userID).update({
		google_home_graph: false,
	});
	logger.log("🤖 DISCONNECTED USER", userID);
};

/**
 * @param  {string} userID
 * @return {Promise<boolean>} is the user connected to the Google Home Graph API
 */
const isUserRegistered = async (userID) => {
	const cachedStatus = registrationCache[userID];
	if (cachedStatus) {
		logger.log(
			"🤖 USER REGISTRATION STATUS (FROM CACHE)",
			userID,
			cachedStatus
		);
		return cachedStatus;
	}
	logger.log("🤖 FETCH USER", userID);
	const userSnapshot = await db.collection("users").doc(userID).get();
	if (!userSnapshot.exists) {
		throw new Error("user does not exist");
	}
	const status = userSnapshot.get("google_home_graph");
	registrationCache[userID] = status;
	logger.log("🤖 GOT REGISTRATION STATUS", userID, status);
	return status;
};

module.exports = {
	registerUser,
	disconnectUser,
	isUserRegistered,
};
