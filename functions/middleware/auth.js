const { db } = require("../initialize");

const authTokenCache = {};

module.exports = async (req, res, next) => {
	const authToken = req.headers["authorization"].replace(/^Bearer /, "");
	if (!authToken) {
		res.status(400);
		return res.send({ error: `authorization header is missing` });
	}
	let userid;
	if (authTokenCache[authToken]) {
		// TODO: implement cache timeout
		userid = authTokenCache[authToken];
	} else {
		const userSnapshot = await db
			.collection("auth_infos")
			.where("code", "==", authToken)
			.get();
		if (userSnapshot.empty) {
			res.status(400);
			return res.send({ error: `authorization token doesn not exist` });
		}
		userid = userSnapshot.docs[0].get("user_id");
		authTokenCache[authToken] = userid;
	}
	req.auth = {
		userid,
	};
	return next();
};
