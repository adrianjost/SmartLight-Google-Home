const admin = require("firebase-admin");
const logger = require("./logger");

try {
	admin.initializeApp({
		credential: admin.credential.applicationDefault(),
		databaseURL: "https://aj-smartlight.firebaseio.com",
	});
} catch (e) {
	logger.error("Error during admin.initializeApp", e);
}

const db = admin.firestore();

module.exports = {
	db,
};
