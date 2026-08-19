'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/eqeqeq.js
/**
* @author Toru Nagashima
*/
var require_eqeqeq = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapCoreRule } = require_index.default;
	module.exports = wrapCoreRule("eqeqeq", { applyDocument: true });
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_eqeqeq();
  }
});