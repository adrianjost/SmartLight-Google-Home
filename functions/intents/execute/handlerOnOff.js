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
		// Do not overwrite units that are already on.
		const isOn = Boolean(unit.state.color !== "#000000" || unit.state.gradient);
		if (shouldBeOn === isOn) {
			return unit;
		}
		return await setUnitState(unit, {
			color: shouldBeOn ? "#ffffff" : "#000000",
			type: newColor === "#000000" ? "OFF" : "AUTO",
		});
	});
	const updatedUnits = await Promise.all(unitUpdates);

	// TODO [#13]: implement error handling
	console.info("ℹ ALL DEVICES UPDATED", updatedUnits);
	return updatedUnits.map((unit) => ({
		ids: [unit.id],
		status: "SUCCESS",
		states: getUnitState(unit),
	}));
};

module.exports = handlerOnOff;
