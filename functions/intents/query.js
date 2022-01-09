const fromEntries = require("object.fromentries");
const { getUnitsByIds, getUnitState } = require("../utils/units");

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

const mapUnitToState = (unit) => {
	return [unit.id, getUnitState(unit)];
};

const query = async (req) => {
	console.log("ℹ EXECUTE QUERY", JSON.stringify(req.body));
	const unitIds = req.body.inputs[0].payload.devices.map((d) => d.id);
	console.log("ℹ REQUESTED UNIT_IDs:", JSON.stringify(unitIds));
	const units = await getUnitsByIds(unitIds, req.auth.userID);
	console.log("ℹ UNITS:", units);
	const devices = Object.fromEntries(units.map(mapUnitToState));
	console.log("ℹ DEVICES", devices);
	return {
		agentUserId: req.auth.userID,
		devices,
	};
};

module.exports = query;
