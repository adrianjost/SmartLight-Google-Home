const { db } = require("./firebase");
const {
	hexToSpectrumRgb,
	getLuminance,
	hexToTemperature,
} = require("../utils/color");
/**
 * @param  {string} userid
 * @returns {[Object]} All unit objects the user has
 */
const getUnitsByUserid = async (userid) => {
	console.log("ℹ FETCH UNITS BY USERID", userid);
	const unitSnapchots = await db
		.collection("units")
		.where("created_by", "==", userid)
		.where("type", "==", "LAMP") // TODO: remove filter when groups are implemented
		.get();
	console.log("ℹ GOT SNAPSHOTS", unitSnapchots);
	const units = [];
	unitSnapchots.forEach((doc) => {
		units.push(doc.data());
	});
	console.log("ℹ CONVERTED SNAPSHOTS TO DATA", units);
	return units;
};

/**
 * Throws an error if one unitid couldn't be fetched
 * @param  {[string]} unitIds ids of the units to fetch
 * @param  {string} userid of requester
 * @returns {[Object]} All unit objects requested
 */
const getUnitsByIds = async (unitIds, userid) => {
	return Promise.all(unitIds.map((unitid) => getUnitById(unitid, userid)));
};

const getUnitById = async (unitid, userid) => {
	if (!userid) {
		throw new Error("param userid is missing");
	}
	const unitSnapchots = await db.collection("units").doc(unitid).get();
	if (!unitSnapchots.exists) {
		throw new Error("unit does not exists");
	}
	const unit = unitSnapchots.data();
	/*
	if (unit.created_by !== userid) {
		console.error("access denied", unit.created_by, userid)
		throw new Error("access denied");
	}*/
	return unit;
};

/**
 * Will convert the state of the unit into a format the Home API supports.
 * @param  {Object} unit The Unit like it is stored in the DB
 * @return A State Object that the Home API understands
 */
const getUnitState = (unit) => {
	// TODO [#6]: implement query responses for other traits
	const { state } = unit;
	const color = String(state.color || "#000000");
	console.log(`ℹ getUnitState: ${unit.id} ${state.color} ${color}`);
	const isOn = Boolean(
		state.type !== "OFF" || state.gradient || state.color !== "#000000"
	);
	const spectrumRgb = hexToSpectrumRgb(color);
	const brightness = Math.round(getLuminance(color));
	const temperatureK = hexToTemperature(
		color,
		unit.tempMin || 2700,
		unit.tempMax || 6000
	);

	return {
		on: isOn,
		online: true,
		brightness,
		temperatureK,
		spectrumRgb,
	};
};

/**
 * Will Update the State of the Unit in the DB with the given State.
 * @param  {Object} unit The Unit like it is stored in the DB
 * @param  {Object} newState Object like it is stored in the DB
 * @return The Updated Unit
 */
const setUnitState = async (unit, newState) => {
	await db.collection("units").doc(unit.id).update({
		state: newState,
	});
	unit.state = newState;
	return unit;
};

module.exports = {
	getUnitsByUserid,
	getUnitsByIds,
	getUnitById,
	getUnitState,
	setUnitState,
};
