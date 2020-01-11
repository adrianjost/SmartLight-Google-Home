const admin = require("firebase-admin");

try {
	admin.initializeApp({
		credential: admin.credential.applicationDefault(),
		databaseURL: "https://smartlight-4861d.firebaseio.com",
	});
} catch (e) {
	console.error("Error during admin.initializeApp", e);
}

const db = admin.firestore();

module.exports = {
	db,
};
