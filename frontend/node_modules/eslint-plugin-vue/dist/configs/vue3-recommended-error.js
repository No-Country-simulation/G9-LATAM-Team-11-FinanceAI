
//#region lib/configs/vue3-recommended-error.ts
var vue3_recommended_error_default = {
	extends: require.resolve("./vue3-strongly-recommended-error"),
	rules: {
		"vue/attributes-order": "error",
		"vue/block-order": "error",
		"vue/no-lone-template": "error",
		"vue/no-multiple-slot-args": "error",
		"vue/no-required-prop-with-default": "error",
		"vue/no-v-html": "error",
		"vue/order-in-components": "error",
		"vue/this-in-template": "error"
	}
};

//#endregion
module.exports = vue3_recommended_error_default;