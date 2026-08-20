const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/match-component-import-name.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function getExpectedNames(identifier) {
	return [require_casing.pascalCase(identifier.name), require_casing.kebabCase(identifier.name)];
}
var match_component_import_name_default = {
	meta: {
		type: "problem",
		docs: {
			description: "require the registered component name to match the imported component name",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/match-component-import-name.html"
		},
		fixable: null,
		schema: [],
		messages: { unexpected: "Component alias {{importedName}} should be one of: {{expectedName}}." }
	},
	create(context) {
		return import_utils.default.executeOnVueComponent(context, (obj) => {
			const components = import_utils.default.findProperty(obj, "components");
			if (!components || !components.value || components.value.type !== "ObjectExpression") return;
			for (const property of components.value.properties) {
				if (property.type === "SpreadElement" || property.value.type !== "Identifier" || property.computed === true) continue;
				const importedName = import_utils.default.getStaticPropertyName(property) || "";
				const expectedNames = getExpectedNames(property.value);
				if (!expectedNames.includes(importedName)) context.report({
					node: property,
					messageId: "unexpected",
					data: {
						importedName,
						expectedName: expectedNames.join(", ")
					}
				});
			}
		});
	}
};

//#endregion
exports.default = match_component_import_name_default;