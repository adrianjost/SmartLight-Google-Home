const generateNewConsole = (
	oldConsole,
	{ logLevel = "log", modifier = (...a) => a }
) => {
	const logLevels = ["debug", "error", "warn", "info", "log"];
	const logLevelIndex = logLevels.findIndex((l) => l === logLevel) + 1;
	return logLevels.reduce((logger, level, index) => {
		// Do not use [...args] because otherwise strings would be split and displayed with spaced between each charachter
		logger[level] = function () {
			if (logLevelIndex > index) {
				oldConsole.log(...modifier(...arguments));
			}
		};
		return logger;
	}, {});
};

module.exports = (config) => {
	const orgConsole = console;
	const newConsole = generateNewConsole(console, config);
	if (config.replaceConsole) {
		console = newConsole;
	}
	// return a function that can be called to restore the original console
	return config.replaceConsole
		? () => {
				console = orgConsole;
		  }
		: newConsole;
};
