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
		if (unit.state.color === newColor) {
			return unit;
		}
		return await setUnitState(unit, {
			color: newColor,
			type: newColor === "#000000" ? "OFF" : "MANUAL",
		});
	});
	const updatedUnits = await Promise.all(handler);

	// TODO [#13]: implement error handling
	console.info("ℹ ALL DEVICES UPDATED", updatedUnits);
	return updatedUnits.map((unit) => ({
		ids: [unit.id],
		status: "SUCCESS",
		states: getUnitState(unit),
	}));
};

module.exports = handlerColorAbsolute;
