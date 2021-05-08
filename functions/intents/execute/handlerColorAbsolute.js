const {
	getUnitState,
	getUnitsByIds,
	setUnitState,
} = require("../../utils/units");
const { spectrumRgbToHex } = require("../../utils/color");

const handlerColorAbsolute = async (devices, params, userid) => {
	const deviceIds = devices.map((d) => d.id);
	const newColor = spectrumRgbToHex(params.color.spectrumRGB);
	const units = await getUnitsByIds(deviceIds, userid);

	unitUpdates = units.map(async (unit) => {
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
