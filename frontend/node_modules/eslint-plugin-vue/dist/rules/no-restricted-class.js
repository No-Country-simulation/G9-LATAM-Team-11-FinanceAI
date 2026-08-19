const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-class.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const reportForbiddenClass = (className, node, context, isForbiddenClass) => {
	if (isForbiddenClass(className)) {
		const loc = node.value ? node.value.loc : node.loc;
		context.report({
			node,
			loc,
			messageId: "forbiddenClass",
			data: { class: className }
		});
	}
};
function* extractClassNames(node, textOnly) {
	if (node.type === "Literal") {
		yield* `${node.value}`.split(/\s+/).map((className) => ({
			className,
			reportNode: node
		}));
		return;
	}
	if (node.type === "TemplateLiteral") {
		for (const templateElement of node.quasis) yield* templateElement.value.cooked.split(/\s+/).map((className) => ({
			className,
			reportNode: templateElement
		}));
		for (const expr of node.expressions) yield* extractClassNames(expr, true);
		return;
	}
	if (node.type === "BinaryExpression") {
		if (node.operator !== "+") return;
		yield* extractClassNames(node.left, true);
		yield* extractClassNames(node.right, true);
		return;
	}
	if (textOnly) return;
	if (node.type === "ObjectExpression") {
		for (const prop of node.properties) {
			if (prop.type !== "Property") continue;
			const classNames = import_utils.default.getStaticPropertyName(prop);
			if (!classNames) continue;
			yield* classNames.split(/\s+/).map((className) => ({
				className,
				reportNode: prop.key
			}));
		}
		return;
	}
	if (node.type === "ArrayExpression") {
		for (const element of node.elements) {
			if (element == null) continue;
			if (element.type === "SpreadElement") continue;
			yield* extractClassNames(element);
		}
		return;
	}
}
var no_restricted_class_default = {
	meta: {
		type: "problem",
		docs: {
			description: "disallow specific classes in Vue components",
			url: "https://eslint.vuejs.org/rules/no-restricted-class.html",
			categories: void 0
		},
		fixable: null,
		schema: {
			type: "array",
			items: { type: "string" }
		},
		messages: { forbiddenClass: "'{{class}}' class is not allowed." }
	},
	create(context) {
		const { options = [] } = context;
		const isForbiddenClass = require_regexp.toRegExpGroupMatcher(options);
		return import_utils.default.defineTemplateBodyVisitor(context, {
			"VAttribute[directive=false][key.name=\"class\"][value!=null]"(node) {
				for (const className of node.value.value.split(/\s+/)) reportForbiddenClass(className, node, context, isForbiddenClass);
			},
			"VAttribute[directive=true][key.name.name='bind'][key.argument.name='class'] > VExpressionContainer.value"(node) {
				if (!node.expression) return;
				for (const { className, reportNode } of extractClassNames(node.expression)) reportForbiddenClass(className, reportNode, context, isForbiddenClass);
			}
		});
	}
};

//#endregion
exports.default = no_restricted_class_default;