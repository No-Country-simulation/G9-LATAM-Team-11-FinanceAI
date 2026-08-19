const require_runtime = require('../_virtual/_rolldown/runtime.js');

//#region lib/utils/vue2-builtin-components.js
var require_vue2_builtin_components = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	module.exports = [
		"template",
		"slot",
		"component",
		"Component",
		"transition",
		"Transition",
		"transition-group",
		"TransitionGroup",
		"keep-alive",
		"KeepAlive"
	];
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_vue2_builtin_components();
  }
});