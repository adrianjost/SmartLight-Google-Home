const { db } = require("../initialize");
const pkg = require("../../package.json");
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

const unitCache = {};

const getUnits = async (userId) => {
  // TODO [$5e1789f3c9095f000760790c]: implement cache timeout
  if(unitCache[userId]){
    return unitCache[userId]
  }
  const unitSnapchots = await db.collection("units")
    .where("created_by", "==", userid)
    .where("name", "==", req.body.objectName)
    .get();
    const units = [];
    unitSnapchots.forEach((doc) => {
      units.push(doc.data());
    });
    unitCache[userId] = units;
    return units;
}


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
const getGroupInfo = (unit) => {
  return false
}
const getLampInfo = unit => {
  const getTraits = (lamptype) => {
    // TODO [$5e1789f3c9095f000760790d]: differentiate between RGB and WWCW lamps, currenlty only RGB is implemented
    // TODO [$5e1789f3c9095f000760790e]: implement more traits https://developers.google.com/assistant/smarthome/traits
    return "action.devices.traits.OnOff"
  }
  return {
    "id": unit.id,
    "type": "action.devices.types.LIGHT",
    "traits": getTraits(unit.lamptype),
    "name": {
      "defaultNames": ["ESP8266-01 Lamp"],
      "name": unit.name,
      "nicknames": unit.tags
    },
    "attributes": {
        // TODO [$5e1789f3c9095f000760790f]: implement colorTemperatureRange for WWCW lamps https://developers.google.com/assistant/smarthome/traits/colorsetting
        "colorModel": "rgb",
        "commandOnlyColorSetting": true
      },
    "willReportState": false,
    "deviceInfo": {
      "manufacturer": "DIY",
      "swVersion": pkg.version
    }
  }
}

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

const sync = async (req, res) => {
	const units = await getUnits();

	return {
		agentUserId: "1836.15267389", // TODO: implement agentUserId
		devices: units.map(getDeviceInfo).filter((a) => a), // TODO: remove this filter when groups are implemented
	};
};

module.exports = sync;
