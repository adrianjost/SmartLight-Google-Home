const { db } = require("../utils/initialize");
/*
req.body:
{
  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
  "inputs": [{
    "intent": 'action.devices.QUERY',
    "payload": {
      "devices": [{
        "id": "123"
      }]
    }
  }]
}

response:
{
  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
  "payload": {
    "devices": {
      "123": {
        "on": true,
        "online": true
      }
    }
  }
*/

const query = async (req) => {
	const unitIds = req.body.payload.devices.map((d) => d.id);
	const unitQuerys = unitIds.map(async (unitId) => {
		const unitSnapshot = await db
			.collection("units")
			.doc(unitId)
			.get();
		if (!unitSnapshot.exists) {
			throw new Error("unit does not exist");
		}
		return unitSnapshot.data();
	});
	const unitStates = await Promise.all(unitQuerys);
	devices = {};
	unitStates.forEach((unit) => {
		// TODO: implement  query responses for other traits
		// const isOn = unit.state.gradient || unit.state.color !== "#000000";
		const spectrumRgb = parseInt((unit.state.color || "#000000").slice(1), 16);
		devices[unit.id] = {
			// "on": isOn,
			online: true,
			spectrumRgb,
		};
	});
	return {
		agentUserId: req.auth.userid,
		devices,
	};
};

module.exports = query;
