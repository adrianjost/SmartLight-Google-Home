const { db } = require("./firebase");
const {
	hexToSpectrumRgb,
	getLuminance,
	hexToTemperature,
} = require("../utils/color");
const logger = require("./logger");

/**
 * @param  {string} userID
 * @returns {[Object]} All unit objects the user has
 */
const getUnitsByUserID = async (userID) => {
	logger.log("ℹ FETCH UNITS BY USER-ID", userID);
	const unitSnapshots = await db
		.collection("units")
		.where("created_by", "==", userID)
		.where("type", "==", "LAMP") // TODO: remove filter when groups are implemented
		.get();
	logger.log("ℹ GOT SNAPSHOTS", unitSnapshots);
	const units = [];
	unitSnapshots.forEach((doc) => {
		units.push(doc.data());
	});
	logger.log("ℹ CONVERTED SNAPSHOTS TO DATA", units);
	return units;
};

/**
 * Throws an error if one unitID couldn't be fetched
 * @param  {[string]} unitIds ids of the units to fetch
 * @param  {string} userID of requester
 * @returns {[Object]} All unit objects requested
 */
const getUnitsByIds = async (unitIds, userID) => {
	return Promise.all(unitIds.map((unitID) => getUnitById(unitID, userID)));
};

const getUnitById = async (unitID, userID) => {
	if (!userID) {
		throw new Error("param userID is missing");
	}
	const unitSnapshots = await db.collection("units").doc(unitID).get();
	if (!unitSnapshots.exists) {
		throw new Error("unit does not exists");
	}
	const unit = unitSnapshots.data();
	/*
	if (unit.created_by !== userID) {
		logger.error("access denied", unit.created_by, userID)
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
	logger.log(`ℹ getUnitState: ${unit.id} ${state.color} ${color}`);
	const isOn = Boolean(
		(state.type !== undefined && state.type !== "OFF") ||
			state.gradient !== undefined ||
			(state.color !== undefined && state.color !== "#000000")
	);

	const outputState = {
		on: isOn,
		online: true,
		brightness: Math.round(getLuminance(color)),
	};
	switch (unit.lamptype) {
		case "RGB":
			outputState.color = { spectrumRgb: hexToSpectrumRgb(color) };
			break;
		case "WWCW":
			outputState.color = {
				temperatureK: hexToTemperature(
					color,
					unit.tempMin || 2700,
					unit.tempMax || 6000
				),
			};
			break;
		default:
			throw new Error(`unknown lamptype ${unit.lamptype}`);
	}

	return outputState;
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
	getUnitsByUserID,
	getUnitsByIds,
	getUnitState,
	setUnitState,
};
