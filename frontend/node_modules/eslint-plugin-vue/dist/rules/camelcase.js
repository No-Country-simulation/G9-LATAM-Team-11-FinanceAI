'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/camelcase.js
/**
* @author Yosuke Ota
*/
var require_camelcase = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapCoreRule } = require_index.default;
	module.exports = wrapCoreRule("camelcase");
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_camelcase();
  }
});