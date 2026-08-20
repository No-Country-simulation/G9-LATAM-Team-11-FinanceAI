const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_plugin = require('../../plugin.js');
let vue_eslint_parser = require("vue-eslint-parser");
vue_eslint_parser = require_runtime.__toESM(vue_eslint_parser);

//#region lib/configs/flat/base.ts
var base_default = [{
	name: "vue/base/setup",
	plugins: { get vue() {
		return require_plugin.default;
	} },
	languageOptions: { sourceType: "module" }
}, {
	name: "vue/base/setup-for-vue",
	files: ["*.vue", "**/*.vue"],
	plugins: { get vue() {
		return require_plugin.default;
	} },
	languageOptions: {
		parser: vue_eslint_parser.default,
		sourceType: "module"
	},
	rules: {
		"vue/comment-directive": "error",
		"vue/jsx-uses-vars": "error"
	},
	processor: "vue/vue"
}];

//#endregion
module.exports = base_default;