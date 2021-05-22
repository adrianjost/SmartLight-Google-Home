const {
	setUnitState,
	getUnitsByIds,
	getUnitState,
} = require("../../utils/units");

const handlerOnOff = async (devices, params, userid) => {
	const shouldBeOn = params.on;
	const deviceIds = devices.map((d) => d.id);
	const units = await getUnitsByIds(deviceIds, userid);
	unitUpdates = units.map(async (unit) => {
		try {
			const isOn = Boolean(
				unit.state.color !== "#000000" || unit.state.gradient
				);
				// Do not overwrite units that are already on.
			if (shouldBeOn === isOn) {
				return {
					ids: [unit.id],
					status: "ERROR",
					errorCode: isOn ? "alreadyOn" : "alreadyOff",
				};
			}
			await setUnitState(unit, {
				color: shouldBeOn ? unit.color : "#000000", // don't set an on color - will be overwritten by the hub once executed
				type: shouldBeOn ? "AUTO" : "OFF",
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

module.exports = handlerOnOff;
