const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_html_elements$1 = require('../utils/html-elements.js');
const require_svg_elements$1 = require('../utils/svg-elements.js');
const require_vue2_builtin_components$1 = require('../utils/vue2-builtin-components.js');
const require_vue3_builtin_components$1 = require('../utils/vue3-builtin-components.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');
const require_deprecated_html_elements = require('../utils/deprecated-html-elements.js');

//#region lib/rules/restricted-component-names.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var import_html_elements = /* @__PURE__ */ require_runtime.__toESM(require_html_elements$1.default);
var import_svg_elements = /* @__PURE__ */ require_runtime.__toESM(require_svg_elements$1.default);
var import_vue2_builtin_components = /* @__PURE__ */ require_runtime.__toESM(require_vue2_builtin_components$1.default);
var import_vue3_builtin_components = /* @__PURE__ */ require_runtime.__toESM(require_vue3_builtin_components$1.default);
const reservedNames = new Set([
	...import_html_elements.default,
	...require_deprecated_html_elements.default,
	...import_svg_elements.default,
	...import_vue2_builtin_components.default,
	...import_vue3_builtin_components.default
]);
var restricted_component_names_default = {
	meta: {
		type: "problem",
		docs: {
			description: "enforce using only specific component names",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/restricted-component-names.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			additionalProperties: false,
			properties: { allow: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true,
				additionalItems: false
			} }
		}],
		messages: { invalidName: "Component name \"{{name}}\" is not allowed." }
	},
	create(context) {
		const isAllowed = require_regexp.toRegExpGroupMatcher((context.options[0] || {}).allow);
		function isAllowedTarget(name) {
			return reservedNames.has(name) || isAllowed(name);
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { VElement(node) {
			const name = node.rawName;
			if (isAllowedTarget(name)) return;
			context.report({
				node,
				loc: node.loc,
				messageId: "invalidName",
				data: { name }
			});
		} });
	}
};

//#endregion
exports.default = restricted_component_names_default;