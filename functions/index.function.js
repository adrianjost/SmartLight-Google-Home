const functions = require("firebase-functions");
const app = require("restana")();

app.use(require("./api/middleware/cors"));
// app.use(require("./api/middleware/auth"));

app.get("/time", (req, res) => {
	res.send(`server timestamp: ${Date.now()}`);
});

const intents = {
	"action.devices.SYNC": require("./services/sync"),
}

app.get("/", async (req, res) => {
	const intent = req.body.inputs[0].intent;
	const payload = await intents[intent](req, res);
	res.send({
		"requestId": req.body.requestId,
		payload
	})
});

exports = module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest(app.callback());
