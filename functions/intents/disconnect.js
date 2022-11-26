const { disconnectUser } = require("../utils/user");
const logger = require("../utils/logger");

const disconnect = async (req) => {
	logger.log("🤖 EXECUTE DISCONNECT");
	await disconnectUser(req.auth.userID);
	return {
		agentUserId: req.auth.userID,
		statusCode: 200,
		status: "OK",
	};
};

module.exports = disconnect;
