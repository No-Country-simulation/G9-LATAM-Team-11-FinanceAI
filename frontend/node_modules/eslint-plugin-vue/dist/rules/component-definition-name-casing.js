const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/component-definition-name-casing.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const allowedCaseOptions = ["PascalCase", "kebab-case"];
function canConvert(node) {
	return node.type === "Literal" || node.type === "TemplateLiteral" && node.expressions.length === 0 && node.quasis.length === 1;
}
var component_definition_name_casing_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce specific casing for component definition name",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/component-definition-name-casing.html"
		},
		fixable: "code",
		schema: [{ enum: allowedCaseOptions }],
		messages: { incorrectCase: "Property name \"{{value}}\" is not {{caseType}}." }
	},
	create(context) {
		const options = context.options[0];
		const caseType = allowedCaseOptions.includes(options) ? options : "PascalCase";
		function convertName(node) {
			let nodeValue;
			let range;
			if (node.type === "TemplateLiteral") {
				const quasis = node.quasis[0];
				nodeValue = quasis.value.cooked;
				range = quasis.range;
			} else {
				nodeValue = `${node.value}`;
				range = node.range;
			}
			if (!require_casing.getChecker(caseType)(nodeValue)) context.report({
				node,
				messageId: "incorrectCase",
				data: {
					value: nodeValue,
					caseType
				},
				fix: (fixer) => fixer.replaceTextRange([range[0] + 1, range[1] - 1], require_casing.getExactConverter(caseType)(nodeValue))
			});
		}
		return import_utils.default.compositingVisitors(import_utils.default.executeOnCallVueComponent(context, (node) => {
			if (node.arguments.length === 2) {
				const argument = node.arguments[0];
				if (canConvert(argument)) convertName(argument);
			}
		}), import_utils.default.executeOnVue(context, (obj) => {
			const node = import_utils.default.findProperty(obj, "name");
			if (!node) return;
			if (!canConvert(node.value)) return;
			convertName(node.value);
		}), import_utils.default.defineScriptSetupVisitor(context, { onDefineOptionsEnter(node) {
			if (node.arguments.length === 0) return;
			const define = node.arguments[0];
			if (define.type !== "ObjectExpression") return;
			const nameNode = import_utils.default.findProperty(define, "name");
			if (!nameNode) return;
			if (!canConvert(nameNode.value)) return;
			convertName(nameNode.value);
		} }));
	}
};

//#endregion
exports.default = component_definition_name_casing_default;