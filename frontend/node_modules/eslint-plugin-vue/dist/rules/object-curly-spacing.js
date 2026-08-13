'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/object-curly-spacing.js
/**
* @author Toru Nagashima
*/
var require_object_curly_spacing = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapStylisticOrCoreRule } = require_index.default;
	module.exports = wrapStylisticOrCoreRule("object-curly-spacing", { skipDynamicArguments: true });
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_object_curly_spacing();
  }
});