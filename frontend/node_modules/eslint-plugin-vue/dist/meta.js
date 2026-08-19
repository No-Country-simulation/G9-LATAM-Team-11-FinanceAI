const require_package = require('./package.js');

//#region lib/meta.ts
var meta_default = {
	name: require_package.name,
	version: require_package.version
};

//#endregion
exports.default = meta_default;