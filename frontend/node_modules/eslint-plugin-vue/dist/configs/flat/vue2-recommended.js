const require_configs_flat_vue2_strongly_recommended = require('./vue2-strongly-recommended.js');

//#region lib/configs/flat/vue2-recommended.ts
var vue2_recommended_default = [...require_configs_flat_vue2_strongly_recommended, {
	name: "vue/vue2-recommended/rules",
	rules: {
		"vue/attributes-order": "warn",
		"vue/block-order": "warn",
		"vue/no-lone-template": "warn",
		"vue/no-multiple-slot-args": "warn",
		"vue/no-required-prop-with-default": "warn",
		"vue/no-v-html": "warn",
		"vue/order-in-components": "warn",
		"vue/this-in-template": "warn"
	}
}];

//#endregion
module.exports = vue2_recommended_default;