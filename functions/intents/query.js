const fromEntries = require("object.fromentries");
const { getUnitsByIds, getUnitState } = require("../utils/units");
const logger = require("../utils/logger");

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
	logger.log("🤖 EXECUTE QUERY", JSON.stringify(req.body));
	const unitIds = req.body.inputs[0].payload.devices.map((d) => d.id);
	logger.log("🤖 REQUESTED UNIT_IDs:", JSON.stringify(unitIds));
	const units = await getUnitsByIds(unitIds, req.auth.userID);
	// TODO [#252]: handle units not found - Home API might query devices that got deleted until SYNC has been fully executed
	logger.log("🤖 UNITS:", units);
	const devices = Object.fromEntries(units.map(mapUnitToState));
	logger.log("🤖 DEVICES", devices);
	return {
		agentUserId: req.auth.userID,
		devices,
	};
};

module.exports = query;
