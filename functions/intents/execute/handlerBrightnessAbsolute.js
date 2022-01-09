const {
	setUnitState,
	getUnitsByIds,
	getUnitState,
} = require("../../utils/units");
const { setLuminance } = require("../../utils/color");

const handlerBrightnessAbsolute = async (devices, params, userID) => {
	const deviceIds = devices.map((d) => d.id);
	const units = await getUnitsByIds(deviceIds, userID);
	const unitUpdates = units.map(async (unit) => {
		try {
			const currentColor = unit.state.color || "#000000";
			const newColor = setLuminance(currentColor, params.brightness);
			const newState = {
				color: newColor,
				type: newColor === "#000000" ? "OFF" : "MANUAL",
			};
			await setUnitState(unit, newState);
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

module.exports = handlerBrightnessAbsolute;
