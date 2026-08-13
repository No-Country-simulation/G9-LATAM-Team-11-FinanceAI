const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/no-unused-components.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var no_unused_components_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow registering components that are not used inside templates",
			categories: ["vue3-essential", "vue2-essential"],
			url: "https://eslint.vuejs.org/rules/no-unused-components.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { ignoreWhenBindingPresent: { type: "boolean" } },
			additionalProperties: false
		}],
		messages: { unused: "The \"{{name}}\" component has been registered but not used." }
	},
	create(context) {
		const options = context.options[0] || {};
		const ignoreWhenBindingPresent = options.ignoreWhenBindingPresent === void 0 ? true : options.ignoreWhenBindingPresent;
		const usedComponents = /* @__PURE__ */ new Set();
		let registeredComponents = [];
		let ignoreReporting = false;
		let templateLocation;
		return import_utils.default.defineTemplateBodyVisitor(context, {
			VElement(node) {
				if (!import_utils.default.isHtmlElementNode(node) && !import_utils.default.isSvgElementNode(node) && !import_utils.default.isMathElementNode(node) || import_utils.default.isHtmlWellKnownElementName(node.rawName) || import_utils.default.isSvgWellKnownElementName(node.rawName) || import_utils.default.isMathWellKnownElementName(node.rawName)) return;
				usedComponents.add(node.rawName);
			},
			"VAttribute[directive=true][key.name.name='bind'][key.argument.name='is'], VAttribute[directive=true][key.name.name='is']"(node) {
				if (!node.value || node.value.type !== "VExpressionContainer" || !node.value.expression) return;
				if (node.value.expression.type === "Literal") usedComponents.add(node.value.expression.value);
				else if (ignoreWhenBindingPresent) ignoreReporting = true;
			},
			"VAttribute[directive=false][key.name='is']"(node) {
				if (!node.value) return;
				const value = node.value.value.startsWith("vue:") ? node.value.value.slice(4) : node.value.value;
				usedComponents.add(value);
			},
			"VElement[name='template']"(node) {
				templateLocation = templateLocation || node.loc.start;
			},
			"VElement[name='template']:exit"(node) {
				if (node.loc.start !== templateLocation || ignoreReporting || import_utils.default.hasAttribute(node, "src")) return;
				for (const { node, name } of registeredComponents) {
					if (require_casing.isPascalCase(name) || require_casing.isCamelCase(name)) {
						if ([...usedComponents].some((n) => !n.includes("_") && (name === require_casing.pascalCase(n) || name === require_casing.camelCase(n)))) continue;
					} else if (usedComponents.has(name)) continue;
					context.report({
						node,
						messageId: "unused",
						data: { name }
					});
				}
			}
		}, import_utils.default.executeOnVue(context, (obj) => {
			registeredComponents = import_utils.default.getRegisteredComponents(obj);
		}));
	}
};

//#endregion
exports.default = no_unused_components_default;