const require_runtime = require('../_virtual/_rolldown/runtime.js');

//#region lib/utils/void-elements.json
var require_void_elements = /* @__PURE__ */ require_runtime.__commonJSMin(((exports, module) => {
	module.exports = [
		"area",
		"base",
		"br",
		"col",
		"embed",
		"hr",
		"img",
		"input",
		"keygen",
		"link",
		"menuitem",
		"meta",
		"param",
		"source",
		"track",
		"wbr"
	];
}));

//#endregion
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function () {
    return require_void_elements();
  }
});