'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/array-element-newline.js
/**
* @author alshyra
*/
var require_array_element_newline = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapStylisticOrCoreRule } = require_index.default;
	module.exports = wrapStylisticOrCoreRule("array-element-newline", { skipDynamicArguments: true });
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_array_element_newline();
  }
});