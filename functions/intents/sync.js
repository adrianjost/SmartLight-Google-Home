const pkg = require("../../package.json");
const { getUnitsByUserID } = require("../utils/units");
const { registerUser } = require("../utils/user");
const logger = require("../utils/logger");

/*
req.body:
{
	"requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
	"inputs": [{
		"intent": "action.devices.SYNC"
	}]
}

response:
{
	"requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
	"payload": {
		"agentUserId": "1836.15267389",
		"devices": [{
			"id": "123",
			"type": "action.devices.types.LIGHT",
			"traits": [
				"action.devices.traits.OnOff",
				"action.devices.traits.ColorSetting"
			],
			"name": {
				"defaultNames": ["Acme Co. bulb A19 On/Off only"],
				"name": "lamp1",
				"nicknames": ["reading lamp"]
			},
			"attributes": {
					"colorModel": "rgb",
					"colorTemperatureRange": {
						"temperatureMinK": 2000,
						"temperatureMaxK": 9000
					},
					"commandOnlyColorSetting": false
				},
			"willReportState": true,
			"deviceInfo": {
				"manufacturer": "Acme Co",
				"model": "hg11",
				"hwVersion": "1.2",
				"swVersion": "5.4"
			}
		}]
	}
}
*/

/*
unit:
{
	"state": {
		"gradient": false,
		"color": "#ff00ff"
	},
	"name": "Bett",
	"id": "someId",
	"tags": ["a Tag"],
	"created_at": {
		"_seconds": 1578148014,
		"_nanoseconds": 796000000
	},
	"updated_at": {
		"_seconds": 1578148482,
		"_nanoseconds": 521000000
	},
	"ip": "192.168.1.233",
	"channelMap": {
		"b": 1,
		"r": 2,
		"g": 3
	},
	"updated_by": "userId",
	"type": "LAMP", // or GROUP
	"icon": "some-icon",
	"lamptype": "RGB", // or WWCW
	"created_by": "userId",
	"hostname": "some-hostname"
}
*/
const getGroupInfo = (/* unit */) => {
	return false;
};

const getLampInfo = (unit) => {
	const getTraits = () => {
		// TODO [#3]: implement more traits https://developers.google.com/assistant/smarthome/traits
		return [
			"action.devices.traits.OnOff",
			"action.devices.traits.Brightness",
			// "action.devices.traits.LightEffects", // Gradients
			"action.devices.traits.ColorSetting",
		];
	};

	const getAttributes = () => {
		const attributes = {};
		if (unit.lamptype === "RGB") {
			attributes.colorModel = "rgb";
		}
		if (unit.tempMin && unit.tempMax) {
			attributes.colorTemperatureRange = {
				temperatureMinK: unit.tempMin,
				temperatureMaxK: unit.tempMax,
			};
		}
		if (Object.keys(attributes).length === 0) {
			throw new Error("unit is missing attributes");
		}
		return attributes;
	};

	return {
		id: unit.id,
		type: "action.devices.types.LIGHT",
		traits: getTraits(),
		name: {
			defaultNames: [unit.id],
			name: unit.name,
			nicknames: [unit.name, ...(unit.tags || [])],
		},
		attributes: getAttributes(),
		willReportState: true,
		deviceInfo: {
			manufacturer: "DIY",
			model: "Modular PCB",
			hwVersion: "3.1",
			swVersion: pkg.version,
		},
	};
};

const getDeviceInfo = (unit) => {
	switch (unit.type) {
		case "GROUP": {
			return getGroupInfo(unit);
		}
		case "LAMP":
		default: {
			return getLampInfo(unit);
		}
	}
};

const sync = async (req) => {
	logger.log("🤖 EXECUTE SYNC", JSON.stringify(req.body));
	await registerUser(req.auth.userID);
	const units = await getUnitsByUserID(req.auth.userID);
	logger.log("🤖 UNITS:", JSON.stringify(units));
	return {
		agentUserId: req.auth.userID,
		devices: units.map(getDeviceInfo),
	};
};

module.exports = sync;
