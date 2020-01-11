const { db } = require("../utils/firebase");

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
	const deviceIds = devices.map((d) => d.id);
	const color = SpectrumRgbToHex(params.color.spectrumRGB);
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
	// TODO [$5e19ef58b7e11900076bfa68]: implement error handling
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
	// TODO [$5e19ef58b7e11900076bfa69]: implement other traits
	"action.devices.commands.ColorAbsolute": HandlerColorAbsolute,
};

const executeCommand = async (commandObj) => {
	const {
		devices,
		execution: { command, params },
	} = commandObj;
	return commandHandler[command](devices, params);
};

const execute = async (req) => {
	const commandRequests = req.body.inputs.payload.commands;
	const commands = await Promise.all(commandRequests.map(executeCommand));
	return {
		agentUserId: req.auth.userid,
		commands,
	};
};

module.exports = execute;
