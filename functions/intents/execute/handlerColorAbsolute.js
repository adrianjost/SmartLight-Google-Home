const {
	getUnitState,
	getUnitsByIds,
	setUnitState,
} = require("../../utils/units");
const { spectrumRgbToHex, temperatureToHex } = require("../../utils/color");

const handlerColorAbsolute = async (devices, params, userid) => {
	const deviceIds = devices.map((d) => d.id);
	const units = await getUnitsByIds(deviceIds, userid);

	unitUpdates = units.map(async (unit) => {
		let newColor;
		if (unit.type === "WWCW") {
			newColor = temperatureToHex(
				unit.state.color,
				params.color.temperature,
				unit.min,
				unit.max
			);
		} else {
			newColor = spectrumRgbToHex(params.color.spectrumRGB);
		}
		try {
			if (unit.state.color === newColor) {
				return unit;
			}
			await setUnitState(unit, {
				color: newColor,
				type: newColor === "#000000" ? "OFF" : "MANUAL",
			});
			return {
				ids: [unit.id],
				status: "SUCCESS",
				states: getUnitState(unit),
			};
		} catch (error) {
			console.error(error);
			return {
				ids: [unit.id],
				status: "ERROR",
				errorCode: "hardError",
			};
		}
	});
	return await Promise.all(unitUpdates);
};

module.exports = handlerColorAbsolute;
