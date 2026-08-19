'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/space-infix-ops.js
/**
* @author Toru Nagashima
*/
var require_space_infix_ops = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapStylisticOrCoreRule } = require_index.default;
	module.exports = wrapStylisticOrCoreRule("space-infix-ops", {
		skipDynamicArguments: true,
		applyDocument: true
	});
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_space_infix_ops();
  }
});