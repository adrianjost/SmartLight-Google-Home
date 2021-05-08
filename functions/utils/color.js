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

const hex2rgb = (hexColor) => {
	// remove leading #
	if (hexColor.length === 7 || hexColor.length === 4) {
		hexColor = hexColor.substr(1);
	}
	// convert 3 digit to 6 digit color
	if (hexColor.length === 3) {
		hexColor =
			hexColor[0] +
			hexColor[0] +
			hexColor[1] +
			hexColor[1] +
			hexColor[2] +
			hexColor[2];
	}
	const bigint = parseInt(hexColor, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return { r: r, g: g, b: b };
};

const hexToTemperature = (hexColor, minK, maxK) => {
	const rgbColor = hex2rgb(hexColor);
	const dTemp = maxK - minK;
	const warm = rgbColor.r;
	const cold = rgbColor.b;
	let hue;
	if (warm === cold) {
		hue = 0.5;
	} else if (warm === 0) {
		hue = 1;
	} else if (cold === 0) {
		hue = 0;
	} else if (warm > cold) {
		hue = cold / (2 * warm);
	} else {
		hue = 1 - warm / (2 * cold);
	}
	return minK + dTemp * hue;
};

function componentToHex(color) {
	var hex = color.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}
const rgb2hex = ({ r, g, b }) => {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};
const temperatureToHex = (currentColor, temp, minK, maxK) => {
	const currentRGB = hex2rgb(currentColor);
	const brightness = Math.max(currentRGB.r, currentRGB.b);
	const dTemp = maxK - minK;
	const hue = (temp - minK) / dTemp;

	const ww = hue < 0.5 ? 1 : 2 - 2 * hue;
	const cw = hue < 0.5 ? hue * 2 : 1;

	return rgb2hex({ r: ww * brightness, g: 0, b: cw * brightness });
};

module.exports = {
	hexToSpectrumRgb,
	spectrumRgbToHex,
	temperatureToHex,
	hexToTemperature,
	getLuminance,
	setLuminance,
};
