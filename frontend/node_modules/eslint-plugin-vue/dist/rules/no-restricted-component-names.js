const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-component-names.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function buildMatcher(str) {
	if (require_regexp.isRegExp(str)) {
		const regex = require_regexp.toRegExp(str, { remove: "g" });
		return (s) => regex.test(s);
	}
	return (s) => s === require_casing.pascalCase(str) || s === require_casing.kebabCase(str);
}
function parseOption(option) {
	if (typeof option === "string") return { test: buildMatcher(option) };
	const parsed = parseOption(option.name);
	parsed.message = option.message;
	parsed.suggest = option.suggest;
	return parsed;
}
function createSuggest(property, suggest) {
	if (!suggest) return [];
	return [{
		fix(fixer) {
			return fixer.replaceText(property.value, JSON.stringify(suggest));
		},
		messageId: "suggest",
		data: { suggest }
	}];
}
var no_restricted_component_names_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific component names",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-component-names.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: {
			type: "array",
			items: { oneOf: [{ type: "string" }, {
				type: "object",
				properties: {
					name: { type: "string" },
					message: {
						type: "string",
						minLength: 1
					},
					suggest: { type: "string" }
				},
				required: ["name"],
				additionalProperties: false
			}] },
			uniqueItems: true,
			minItems: 0
		},
		messages: {
			disallow: "{{message}}",
			suggest: "Instead, change to `{{suggest}}`."
		}
	},
	create(context) {
		const options = context.options.map(parseOption);
		function verify(node) {
			const property = import_utils.default.findProperty(node, "name");
			if (!property) return;
			if (import_utils.default.getStaticPropertyName(property) === "name" && property.value.type === "Literal") {
				const componentName = property.value.value?.toString();
				if (!componentName) return;
				for (const option of options) if (option.test(componentName)) context.report({
					node: property.value,
					messageId: "disallow",
					data: { message: option.message || `Using component name \`${componentName}\` is not allowed.` },
					suggest: createSuggest(property, option.suggest)
				});
			}
		}
		return import_utils.default.compositingVisitors(import_utils.default.defineVueVisitor(context, { onVueObjectEnter(node) {
			verify(node);
		} }), import_utils.default.defineScriptSetupVisitor(context, { onDefineOptionsEnter(node) {
			const expression = node.arguments[0];
			if (expression.type === "ObjectExpression") verify(expression);
		} }));
	}
};

//#endregion
exports.default = no_restricted_component_names_default;