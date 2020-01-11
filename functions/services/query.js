const { db } = require("../utils/firebase");
const { hexToSpectrumRgb } = require("../utils/color");
const fromEntries = require("object.fromentries");

if (!Object.fromEntries) {
	fromEntries.shim();
}

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

getUnitsByIds = async (unitIds) => {
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
	return await Promise.all(unitQuerys);
};

const mapUnitToState = (unit) => {
	// TODO [#6]: implement  query responses for other traits
	// const isOn = unit.state.gradient || unit.state.color !== "#000000";
	const spectrumRgb = hexToSpectrumRgb(unit.state.color || "#000000");
	return [
		unit.id,
		{
			// "on": isOn,
			online: true,
			spectrumRgb,
		},
	];
};

const query = async (req) => {
	console.info("ℹ EXECUTE QUERY", JSON.stringify(req.body));
	const unitIds = req.body.inputs[0].payload.devices.map((d) => d.id);
	console.info("ℹ REQUESTED UNIT_IDs:", JSON.stringify(unitIds));
	const units = await getUnitsByIds(unitIds);
	console.info("ℹ UNITS:", JSON.stringify(units));
	const devices = Object.fromEntries(units.map(mapUnitToState));
	console.info("ℹ DEVICES", devices);
	return {
		agentUserId: req.auth.userid,
		devices,
	};
};

module.exports = query;
