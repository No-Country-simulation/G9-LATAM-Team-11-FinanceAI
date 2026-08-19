const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/prop-name-casing.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const allowedCaseOptions = ["camelCase", "snake_case"];
function create(context) {
	const options = context.options[0];
	const isIgnoredProp = require_regexp.toRegExpGroupMatcher(context.options[1]?.ignoreProps);
	const caseType = allowedCaseOptions.includes(options) ? options : "camelCase";
	const checker = require_casing.getChecker(caseType);
	function processProps(props) {
		for (const item of props) {
			const propName = item.propName;
			if (propName == null) continue;
			if (!checker(propName) && !isIgnoredProp(propName)) context.report({
				node: item.node,
				messageId: "invalidCase",
				data: {
					name: propName,
					caseType
				}
			});
		}
	}
	return import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, { onDefinePropsEnter(_node, props) {
		processProps(props);
	} }), import_utils.default.executeOnVue(context, (obj) => {
		processProps(import_utils.default.getComponentPropsFromOptions(obj));
	}));
}
var prop_name_casing_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce specific casing for the Prop name in Vue components",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/prop-name-casing.html"
		},
		fixable: null,
		schema: [{ enum: allowedCaseOptions }, {
			type: "object",
			properties: { ignoreProps: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true
			} },
			additionalProperties: false
		}],
		messages: { invalidCase: "Prop \"{{name}}\" is not in {{caseType}}." }
	},
	create
};

//#endregion
exports.default = prop_name_casing_default;