const {
	getUnitState,
	getUnitsByIds,
	setUnitState,
} = require("../../utils/units");
const { spectrumRgbToHex, temperatureToHex } = require("../../utils/color");
const logger = require("../../utils/logger");

const handlerColorAbsolute = async (devices, params, userID) => {
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
		let newColor;
		if (params.color.hasOwnProperty("temperature")) {
			newColor = temperatureToHex(
				unitData.state.color,
				params.color.temperature,
				unitData.tempMin,
				unitData.tempMax
			);
		} else {
			newColor = spectrumRgbToHex(params.color.spectrumRGB);
		}
		try {
			if (unitData.state.color === newColor) {
				return unitData;
			}
			await setUnitState(unitData, {
				color: newColor,
				type: newColor === "#000000" ? "OFF" : "MANUAL",
			});
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

module.exports = handlerColorAbsolute;
