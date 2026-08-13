'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/dot-notation.js
/**
* @author Yosuke Ota
*/
var require_dot_notation = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapStylisticOrCoreRule } = require_index.default;
	module.exports = wrapStylisticOrCoreRule("dot-notation", { applyDocument: true });
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_dot_notation();
  }
});