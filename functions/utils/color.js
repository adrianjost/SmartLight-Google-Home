const hexToSpectrumRgb = (hexColor) => parseInt(hexColor.slice(1), 16);
const SpectrumRgbToHex = (spectrumRgb) => `#${spectrumRgb.toString(16)}`;

module.exports = {
	hexToSpectrumRgb,
	SpectrumRgbToHex,
};
