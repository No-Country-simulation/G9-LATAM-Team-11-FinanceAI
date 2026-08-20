const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/prefer-true-attribute-shorthand.ts
/**
* @author Pig Fang
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function getAttributeName(node) {
	if (!node.directive) return node.key.rawName;
	if ((node.key.name.name === "bind" || node.key.name.name === "model") && node.key.argument && node.key.argument.type === "VIdentifier") return node.key.argument.rawName;
	return null;
}
function shouldConvertToLongForm(node, isExcepted, option) {
	return !node.directive && !node.value && (option === "always" ? isExcepted : !isExcepted);
}
function shouldConvertToShortForm(node, isExcepted, option) {
	return node.directive && node.value?.expression?.type === "Literal" && node.value.expression.value === true && Boolean(node.key.argument) && (option === "always" ? !isExcepted : isExcepted);
}
var prefer_true_attribute_shorthand_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "require shorthand form attribute when `v-bind` value is `true`",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/prefer-true-attribute-shorthand.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: [{ enum: ["always", "never"] }, {
			type: "object",
			properties: { except: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true
			} },
			additionalProperties: false
		}],
		messages: {
			expectShort: "Boolean prop with 'true' value should be written in shorthand form.",
			expectLong: "Boolean prop with 'true' value should be written in long form.",
			rewriteIntoShort: "Rewrite this prop into shorthand form.",
			rewriteIntoLongVueProp: "Rewrite this prop into long-form Vue component prop.",
			rewriteIntoLongHtmlAttr: "Rewrite this prop into long-form HTML attribute."
		}
	},
	create(context) {
		const option = context.options[0] || "always";
		const exceptMatcher = require_regexp.toRegExpGroupMatcher(context.options[1]?.except);
		function reportLongForm(node, messageId, longVuePropText, longHtmlAttrText) {
			context.report({
				node,
				messageId,
				suggest: [{
					messageId: "rewriteIntoLongVueProp",
					fix: (fixer) => fixer.replaceText(node, longVuePropText)
				}, {
					messageId: "rewriteIntoLongHtmlAttr",
					fix: (fixer) => fixer.replaceText(node, longHtmlAttrText)
				}]
			});
		}
		function reportShortForm(node, messageId, shortFormText) {
			context.report({
				node,
				messageId,
				suggest: [{
					messageId: "rewriteIntoShort",
					fix: (fixer) => fixer.replaceText(node, shortFormText)
				}]
			});
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { VAttribute(node) {
			if (!import_utils.default.isCustomComponent(node.parent.parent)) return;
			const name = getAttributeName(node);
			if (name === null) return;
			const isExcepted = exceptMatcher(name);
			if (shouldConvertToLongForm(node, isExcepted, option)) {
				const key = node.key;
				reportLongForm(node, "expectLong", `:${key.rawName}="true"`, `${key.rawName}="${key.rawName}"`);
			} else if (shouldConvertToShortForm(node, isExcepted, option)) {
				const directiveKey = node.key;
				if (directiveKey.argument && directiveKey.argument.type === "VIdentifier") reportShortForm(node, "expectShort", directiveKey.argument.rawName);
			}
		} });
	}
};

//#endregion
exports.default = prefer_true_attribute_shorthand_default;