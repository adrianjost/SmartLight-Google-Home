const {
	setUnitState,
	getUnitsByIds,
	getUnitState,
} = require("../../utils/units");
const logger = require("../../utils/logger");

const handlerOnOff = async (devices, params, userID) => {
	const shouldBeOn = params.on;
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
			const isOn = Boolean(
				unitData.state.color !== "#000000" || unitData.state.gradient
			);
			// Do not overwrite units that are already on.
			if (shouldBeOn === isOn) {
				return {
					ids: [unitID],
					status: "ERROR",
					errorCode: isOn ? "alreadyOn" : "alreadyOff",
				};
			}
			const newState = shouldBeOn
				? {
						// don't set an on color - will be overwritten by the hub once executed
						type: "AUTO",
				  }
				: {
						color: "#000000",
						type: "OFF",
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

module.exports = handlerOnOff;
