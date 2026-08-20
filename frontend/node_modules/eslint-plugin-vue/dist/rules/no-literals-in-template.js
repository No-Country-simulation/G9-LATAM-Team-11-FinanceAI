const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-literals-in-template.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const EXPRESSION_TYPES = {
	ObjectExpression: "object",
	ArrayExpression: "array",
	FunctionExpression: "function",
	ArrowFunctionExpression: "arrow function"
};
var no_literals_in_template_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow object, array, and function literals in template",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-literals-in-template.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { ignores: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true,
				additionalItems: false
			} },
			additionalProperties: false
		}],
		messages: { unexpected: "Unexpected {{type}} literal in template." }
	},
	create(context) {
		const isIgnored = require_regexp.toRegExpGroupMatcher((context.options[0] || {}).ignores);
		const upperElements = /* @__PURE__ */ new Set();
		/**
		* Checks whether the given node refers to a variable of the element.
		*/
		function hasReferenceUpperElementVariable(node) {
			for (const element of upperElements) for (const variable of element.variables) for (const reference of variable.references) {
				const { range } = reference.id;
				if (node.range[0] <= range[0] && range[1] <= node.range[1]) return true;
			}
			return false;
		}
		return import_utils.default.defineTemplateBodyVisitor(context, {
			VElement(node) {
				upperElements.add(node);
			},
			"VElement:exit"(node) {
				upperElements.delete(node);
			},
			"VAttribute[directive=true][key.name.name='bind']"(node) {
				const expression = node.value?.expression;
				const argumentName = node.key.argument?.type === "VIdentifier" ? node.key.argument.name : null;
				if (!expression || argumentName === "class" || argumentName === "style" || argumentName != null && isIgnored(argumentName)) return;
				const type = EXPRESSION_TYPES[expression.type];
				if (type && !hasReferenceUpperElementVariable(expression)) context.report({
					node: expression,
					messageId: "unexpected",
					data: { type }
				});
			}
		});
	}
};

//#endregion
exports.default = no_literals_in_template_default;