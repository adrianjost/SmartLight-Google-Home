const { disconnectUser } = require("../utils/user");

const disconnect = async (req) => {
	console.log("ℹ EXECUTE DISCONNECT");
	await disconnectUser(req.auth.userID);
	return {
		agentUserId: req.auth.userID,
		statusCode: 200,
		status: "OK",
	};
};

module.exports = disconnect;
