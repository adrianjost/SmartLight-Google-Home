const Color = require("color");

const hexToSpectrumRgb = (hexColor) => parseInt(hexColor.slice(1), 16);
const spectrumRgbToHex = (spectrumRgb) =>
	`#${spectrumRgb.toString(16).padStart(6, "0")}`;

/**
 * @param  {string} hexColor 7 digit color string (including `#`)
 * @return {number} luminance of the color - Number between 0 and 100
 */
const getLuminance = (hexColor) => Color(hexColor).hsv().color[2];

/**
 * @param  {string} hexColor 7 digit color string (including `#`)
 * @param  {number} brightness brightness level between 0 and 100 (inclusive)
 * @return new hex color string
 */
const setLuminance = (hexColor, brightness) => {
	const hsl = Color(hexColor).hsv();
	hsl.color[2] = brightness;
	return hsl.hex();
};

module.exports = {
	hexToSpectrumRgb,
	spectrumRgbToHex,
	getLuminance,
	setLuminance,
};
