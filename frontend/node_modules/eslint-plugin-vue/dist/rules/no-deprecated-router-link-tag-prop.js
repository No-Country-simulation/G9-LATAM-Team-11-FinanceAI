const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/no-deprecated-router-link-tag-prop.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function getComponentNames(context) {
	let components = ["RouterLink"];
	if (context.options[0] && context.options[0].components) components = context.options[0].components;
	return new Set(components.flatMap((component) => [require_casing.kebabCase(component), require_casing.pascalCase(component)]));
}
var no_deprecated_router_link_tag_prop_default = {
	meta: {
		type: "problem",
		docs: {
			description: "disallow using deprecated `tag` property on `RouterLink` (in Vue.js 3.0.0+)",
			categories: ["vue3-essential"],
			url: "https://eslint.vuejs.org/rules/no-deprecated-router-link-tag-prop.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { components: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true,
				minItems: 1
			} },
			additionalProperties: false
		}],
		messages: { deprecated: "'tag' property on '{{element}}' component is deprecated. Use scoped slots instead." }
	},
	create(context) {
		const components = getComponentNames(context);
		return import_utils.default.defineTemplateBodyVisitor(context, { VElement(node) {
			if (!components.has(node.rawName)) return;
			let tagKey = null;
			const tagAttr = import_utils.default.getAttribute(node, "tag");
			if (tagAttr) tagKey = tagAttr.key;
			else {
				const directive = import_utils.default.getDirective(node, "bind", "tag");
				if (directive) {
					const arg = directive.key.argument;
					if (arg && arg.type === "VIdentifier") tagKey = arg;
				}
			}
			if (tagKey) context.report({
				node: tagKey,
				messageId: "deprecated",
				data: { element: node.rawName }
			});
		} });
	}
};

//#endregion
exports.default = no_deprecated_router_link_tag_prop_default;