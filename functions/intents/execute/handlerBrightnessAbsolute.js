const {
	setUnitState,
	getUnitsByIds,
	getUnitState,
} = require("../../utils/units");
const { setLuminance } = require("../../utils/color");
const logger = require("../../utils/logger");

const handlerBrightnessAbsolute = async (devices, params, userID) => {
	const deviceIds = devices.map((d) => d.id);
	const units = await getUnitsByIds(deviceIds, userID);
	const unitUpdates = units.map(async (unit) => {
		const unitID = unit.id;
		if (!unit.exists) {
			return {
				ids: [unitID],
				status: "ERROR",
				errorCode: "deviceNotFound",
			};
		}
		const unitData = unit.data;
		try {
			const currentColor = unitData.state.color || "#000000";
			const newColor = setLuminance(currentColor, params.brightness);
			const newState = {
				color: newColor,
				type: newColor === "#000000" ? "OFF" : "MANUAL",
			};
			await setUnitState(unitData, newState);
			return {
				ids: [unitID],
				status: "SUCCESS",
				states: getUnitState(unitData),
			};
		} catch (error) {
			logger.error(error);
			return {
				ids: [unitID],
				status: "ERROR",
				errorCode: "hardError",
			};
		}
	});
	return await Promise.all(unitUpdates);
};

module.exports = handlerBrightnessAbsolute;
