const { db } = require("../utils/firebase");
const { spectrumRgbToHex } = require("../utils/color");
/*
req.body:
{
    "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
    "inputs": [{
      "intent": "action.devices.EXECUTE",
      "payload": {
        "commands": [{
          "devices": [{
            "id": "123",
            "customData": {}
          }, {
            "id": "456",
            "customData": {}
          }],
          "execution": [{
            "command": "action.devices.commands.OnOff",
            "params": {
              "on": true
            }
          }]
        }]
      }
    }]
}

response:
{
  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
  "payload": {
    "commands": [
      {
        "ids": [
          "123"
        ],
        "status": "SUCCESS",
        "states": {
          "on": true,
          "online": true
        }
      },
      {
        "ids": [
          "456"
        ],
        "status": "ERROR",
        "errorCode": "deviceTurnedOff"
      }
    ]
  }
}
*/

const HandlerColorAbsolute = async (devices, params) => {
	console.info(
		"ℹ HandlerColorAbsolute",
		JSON.stringify(devices),
		JSON.stringify(params)
	);

	const deviceIds = devices.map((d) => d.id);
	console.info("ℹ DEVICE IDs", JSON.stringify(deviceIds));
	const color = SpectrumRgbToHex(params.color.spectrumRGB);
	console.info("ℹ NEW COLOR", color);
	const handler = deviceIds.map((deviceId) =>
		db
			.collection("units")
			.doc(deviceId)
			.update({
				state: {
					color,
					gradient: false,
				},
			})
	);
	await Promise.all(handler);
	// TODO [#7]: implement error handling
	console.info(
		"ℹ ALL DEVICED UPDATED",
		JSON.stringify(devices),
		JSON.stringify(params)
	);
	return {
		ids: deviceIds,
		status: "SUCCESS",
		states: {
			spectrumRgb: params.color.spectrumRGB,
			online: true,
		},
	};
};

const commandHandler = {
	// TODO [#8]: implement other traits
	"action.devices.commands.ColorAbsolute": HandlerColorAbsolute,
};

const executeCommand = async (commandObj) => {
	console.info("ℹ COMMAND OBJECT", JSON.stringify(commandObj));
	const devices = commandObj.devices;
	// TODO: handle all execution steps in order
	const execution = commandObj.execution[0];
	console.info("ℹ EXECUTION OBJECT", JSON.stringify(execution));
	const command = execution.command;
	const params = execution.params;
	console.info("ℹ COMMAND PARAMS", command, JSON.stringify(params));

	return commandHandler[command](devices, params);
};

const execute = async (req) => {
	console.info("ℹ EXECUTE EXECUTE", JSON.stringify(req.body));
	const commandRequests = req.body.inputs[0].payload.commands;
	console.info("ℹ REQUESTED COMMANDS:", JSON.stringify(commandRequests));
	const commands = await Promise.all(commandRequests.map(executeCommand));
	return {
		agentUserId: req.auth.userid,
		commands,
	};
};

module.exports = execute;
