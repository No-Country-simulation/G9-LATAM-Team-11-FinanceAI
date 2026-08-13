const require_plugin = require('./plugin.js');
const require_configs_index = require('./configs/index.js');

//#region lib/index.ts
var lib_default = Object.assign(require_plugin.default, { configs: require_configs_index });

//#endregion
module.exports = lib_default;