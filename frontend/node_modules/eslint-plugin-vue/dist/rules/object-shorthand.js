'use strict';

const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/object-shorthand.js
/**
* @author Yosuke Ota
* See LICENSE file in root directory for full license.
*/
var require_object_shorthand = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	const { wrapCoreRule } = require_index.default;
	module.exports = wrapCoreRule("object-shorthand", { skipDynamicArguments: true });
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_object_shorthand();
  }
});