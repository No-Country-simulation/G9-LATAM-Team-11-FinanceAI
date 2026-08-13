
//#region lib/configs/base.ts
var base_default = {
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module"
	},
	plugins: ["vue"],
	rules: {
		"vue/comment-directive": "error",
		"vue/jsx-uses-vars": "error"
	},
	overrides: [{
		files: "*.vue",
		parser: require.resolve("vue-eslint-parser")
	}]
};

//#endregion
module.exports = base_default;