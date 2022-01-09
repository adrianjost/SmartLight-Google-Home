const { disconnectUser } = require("../utils/user");

const disconnect = async (req) => {
	console.info("ℹ EXECUTE DISCONNECT");
	await disconnectUser(req.auth.userid);
	return {
		agentUserId: req.auth.userid,
		statusCode: 200,
		status: "OK",
	};
};

module.exports = disconnect;
