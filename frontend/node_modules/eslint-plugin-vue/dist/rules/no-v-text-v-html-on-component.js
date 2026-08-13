const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/no-v-text-v-html-on-component.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var no_v_text_v_html_on_component_default = {
	meta: {
		type: "problem",
		docs: {
			description: "disallow v-text / v-html on component",
			categories: ["vue2-essential", "vue3-essential"],
			url: "https://eslint.vuejs.org/rules/no-v-text-v-html-on-component.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: {
				allow: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true
				},
				ignoreElementNamespaces: { type: "boolean" }
			},
			additionalProperties: false
		}],
		messages: { disallow: "Using {{directiveName}} on component may break component's content." }
	},
	create(context) {
		const options = context.options[0] || {};
		const allow = new Set(options.allow);
		const ignoreElementNamespaces = options.ignoreElementNamespaces === true;
		/**
		* Check whether the given node is an allowed component or not.
		* @param node The start tag node to check.
		*/
		function isAllowedComponent(node) {
			const componentName = node.rawName;
			return allow.has(componentName) || allow.has(require_casing.pascalCase(componentName)) || allow.has(require_casing.kebabCase(componentName));
		}
		/**
		* Verify for v-text and v-html directive
		*/
		function verify(node) {
			const element = node.parent.parent;
			if (import_utils.default.isCustomComponent(element, ignoreElementNamespaces) && !isAllowedComponent(element)) context.report({
				node,
				loc: node.loc,
				messageId: "disallow",
				data: { directiveName: `v-${node.key.name.name}` }
			});
		}
		return import_utils.default.defineTemplateBodyVisitor(context, {
			"VAttribute[directive=true][key.name.name='text']": verify,
			"VAttribute[directive=true][key.name.name='html']": verify
		});
	}
};

//#endregion
exports.default = no_v_text_v_html_on_component_default;