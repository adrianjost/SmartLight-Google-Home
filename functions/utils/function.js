const functions = require("firebase-functions");

const fn = functions.region("europe-west1");
module.exports = {
	fn,
	highResourceFunction: fn.runWith({
		timeoutSeconds: 15,
		memory: "4GB",
	}),
};
