const require_runtime = require('../_virtual/_rolldown/runtime.js');

//#region lib/utils/vue-builtin-elements.js
var require_vue_builtin_elements = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	module.exports = [
		"template",
		"slot",
		"component"
	];
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_vue_builtin_elements();
  }
});