const {
	setUnitState,
	getUnitsByIds,
	getUnitState,
} = require("../../utils/units");
const { setLuminance } = require("../../utils/color");

const handlerBrightnessAbsolute = async (devices, params, userid) => {
	const deviceIds = devices.map((d) => d.id);
	const units = await getUnitsByIds(deviceIds, userid);
	unitUpdates = units.map(async (unit) => {
		const currentColor = unit.state.color || "#000000";
		const newColor = setLuminance(currentColor, params.brightness);
		const newState = {
			color: newColor,
			type: newColor === "#000000" ? "OFF" : "MANUAL",
		};
		return await setUnitState(unit, newState);
	});
	const updatedUnits = await Promise.all(unitUpdates);
	// TODO [#14]: implement error handling
	console.info("ℹ ALL DEVICES UPDATED", updatedUnits);
	return updatedUnits.map((unit) => ({
		ids: [unit.id],
		status: "SUCCESS",
		states: getUnitState(unit),
	}));
};

module.exports = handlerBrightnessAbsolute;
