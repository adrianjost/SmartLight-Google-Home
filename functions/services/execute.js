const { db } = require("../utils/firebase");
const { spectrumRgbToHex } = require("../utils/color");
const flat = require("array.prototype.flat");

if (!Array.prototype.flat) {
	flat.shim();
}

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
const handlerOnOff = async (devices, params) => {
	console.info(
		"ℹ HandlerOnOff",
		JSON.stringify(devices),
		JSON.stringify(params)
	);

	const deviceIds = devices.map((d) => d.id);
	console.info("ℹ DEVICE IDs", JSON.stringify(deviceIds));
	const newHexColor = params.on ? "#ffffff" : "#000000";
	console.info("ℹ NEW COLOR", newHexColor);
	const handler = deviceIds.map((deviceId) =>
		db
			.collection("units")
			.doc(deviceId)
			.update({
				state: {
					color: newHexColor,
					gradient: false,
				},
			})
	);
	await Promise.all(handler);
	// TODO [$5e1a3b5d8cdafe000722cef6]: implement error handling
	console.info(
		"ℹ ALL DEVICES UPDATED",
		JSON.stringify(devices),
		JSON.stringify(params)
	);
	return {
		ids: deviceIds,
		status: "SUCCESS",
		states: {
			online: true,
			on: params.on,
		},
	};
};

const handlerColorAbsolute = async (devices, params) => {
	console.info(
		"ℹ HandlerColorAbsolute",
		JSON.stringify(devices),
		JSON.stringify(params)
	);

	const deviceIds = devices.map((d) => d.id);
	console.info("ℹ DEVICE IDs", JSON.stringify(deviceIds));
	const color = spectrumRgbToHex(params.color.spectrumRGB);
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
		"ℹ ALL DEVICES UPDATED",
		JSON.stringify(devices),
		JSON.stringify(params)
	);
	return {
		ids: deviceIds,
		status: "SUCCESS",
		states: {
			online: true,
			on: true,
			spectrumRgb: params.color.spectrumRGB,
		},
	};
};

const commandHandler = {
	// TODO [#8]: implement other traits
	"action.devices.commands.OnOff": handlerOnOff,
	"action.devices.commands.ColorAbsolute": handlerColorAbsolute,
};

const executeCommand = async (commandObj) => {
	console.info("ℹ COMMAND OBJECT", JSON.stringify(commandObj));
	const devices = commandObj.devices;
	let out = [];
	for (let index = 0; index < commandObj.execution.length; index++) {
		const execution = commandObj.execution[index];
		console.info("ℹ EXECUTION OBJECT", JSON.stringify(execution));
		const command = execution.command;
		const params = execution.params;
		console.info("ℹ COMMAND PARAMS", command, JSON.stringify(params));
		// eslint-disable-next-line no-await-in-loop
		const res = await commandHandler[command](devices, params);
		if (Array.isArray(res)) {
			out.push(...res);
		} else {
			out.push(res);
		}
	}
	return out;
};

const execute = async (req) => {
	console.info("ℹ EXECUTE EXECUTE", JSON.stringify(req.body));
	const commandRequests = req.body.inputs[0].payload.commands;
	console.info("ℹ REQUESTED COMMANDS:", JSON.stringify(commandRequests));
	const commands = (
		await Promise.all(commandRequests.map(executeCommand))
	).flat(1);
	return {
		agentUserId: req.auth.userid,
		commands,
	};
};

module.exports = execute;
