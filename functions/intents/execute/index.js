const logger = require("../../utils/logger");
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

const commandHandler = {
	// TODO [#8]: implement other traits
	"action.devices.commands.OnOff": require("./handlerOnOff"),
	"action.devices.commands.ColorAbsolute": require("./handlerColorAbsolute"),
	"action.devices.commands.BrightnessAbsolute": require("./handlerBrightnessAbsolute"),
};

const executeCommand = async (commandObj, userID) => {
	logger.log("🤖 COMMAND OBJECT", commandObj);
	const devices = commandObj.devices;
	let out = [];
	for (let index = 0; index < commandObj.execution.length; index++) {
		const execution = commandObj.execution[index];
		logger.log("🤖 EXECUTION OBJECT", execution);
		const command = execution.command;
		const params = execution.params;
		logger.log("🤖 COMMAND PARAMS", command, devices, params);
		// eslint-disable-next-line no-await-in-loop
		const res = await commandHandler[command](devices, params, userID);
		logger.log("🤖 COMMAND HANDLED", res);
		if (Array.isArray(res)) {
			out.push(...res);
		} else {
			out.push(res);
		}
	}
	return out;
};

const execute = async (req) => {
	logger.log("🤖 EXECUTE EXECUTE", req.body);
	const commandRequests = req.body.inputs[0].payload.commands;
	logger.log("🤖 REQUESTED COMMANDS:", commandRequests);
	const commands = (
		await Promise.all(
			commandRequests.map((command) => executeCommand(command, req.auth.userID))
		)
	).flat(1);
	return {
		agentUserId: req.auth.userID,
		commands,
	};
};

module.exports = execute;
