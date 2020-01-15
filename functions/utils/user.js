const { db } = require("./firebase");

const registrationCache = {};

/**
 * @param  {string} userid
 * @return {Promise}
 */
const registerUser = async (userid) => {
	console.log("ℹ REGISTER USER", userid);
	registrationCache[userid] = true;
	await db
		.collection("users")
		.doc(userid)
		.update({
			google_home_graph: true,
		});
	console.log("ℹ REGISTERED USER", userid);
};

/**
 * @param  {string} userid
 * @return {Promise}
 */
const disconnectUser = async (userid) => {
	console.log("ℹ DISCONNECT USER", userid);
	registrationCache[userid] = false;
	await db
		.collection("users")
		.doc(userid)
		.update({
			google_home_graph: false,
		});
	console.log("ℹ DISCONNECTED USER", userid);
};

/**
 * @param  {string} userid
 * @return {Promise<boolean>} is the user connected to the Google Home Graph API
 */
const isUserRegistered = async (userid) => {
	const cachedStatus = registrationCache[userid];
	if (cachedStatus) {
		console.log(
			"ℹ USER REGISTRATION STATUS (FROM CACHE)",
			userid,
			cachedStatus
		);
		return cachedStatus;
	}
	console.log("ℹ FETCH USER", userid);
	const userSnapshot = await db
		.collection("users")
		.doc(userid)
		.get();
	if (!userSnapshot.exists) {
		throw new Error("user does not exist");
	}
	const status = userSnapshot.get("google_home_graph");
	registrationCache[userid] = status;
	console.log("ℹ GOT REGISTRATION STATUS", userid, status);
	return status;
};

module.exports = {
	registerUser,
	disconnectUser,
	isUserRegistered,
};
