const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/component-options-name-casing.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function getOptionsComponentName(node) {
	if (node.type === "Identifier") return node.name;
	if (node.type === "Literal") return typeof node.value === "string" ? node.value : null;
	return null;
}
var component_options_name_casing_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce the casing of component name in `components` options",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/component-options-name-casing.html"
		},
		fixable: "code",
		hasSuggestions: true,
		schema: [{ enum: require_casing.allowedCaseOptions }],
		messages: {
			caseNotMatched: "Component name \"{{component}}\" is not {{caseType}}.",
			possibleRenaming: "Rename component name to be in {{caseType}}."
		}
	},
	create(context) {
		const caseType = context.options[0] || "PascalCase";
		const canAutoFix = caseType === "PascalCase";
		const checkCase = require_casing.getChecker(caseType);
		const convert = require_casing.getConverter(caseType);
		return import_utils.default.executeOnVue(context, (obj) => {
			const node = import_utils.default.findProperty(obj, "components");
			if (!node || node.value.type !== "ObjectExpression") return;
			for (const property of node.value.properties) {
				if (property.type !== "Property") continue;
				const name = getOptionsComponentName(property.key);
				if (!name || checkCase(name)) continue;
				context.report({
					node: property.key,
					messageId: "caseNotMatched",
					data: {
						component: name,
						caseType
					},
					fix: canAutoFix ? (fixer) => {
						const converted = convert(name);
						return property.shorthand ? fixer.replaceText(property, `${converted}: ${name}`) : fixer.replaceText(property.key, converted);
					} : void 0,
					suggest: canAutoFix ? void 0 : [{
						messageId: "possibleRenaming",
						data: { caseType },
						fix: (fixer) => {
							const converted = convert(name);
							if (caseType === "kebab-case") return property.shorthand ? fixer.replaceText(property, `'${converted}': ${name}`) : fixer.replaceText(property.key, `'${converted}'`);
							return property.shorthand ? fixer.replaceText(property, `${converted}: ${name}`) : fixer.replaceText(property.key, converted);
						}
					}]
				});
			}
		});
	}
};

//#endregion
exports.default = component_options_name_casing_default;