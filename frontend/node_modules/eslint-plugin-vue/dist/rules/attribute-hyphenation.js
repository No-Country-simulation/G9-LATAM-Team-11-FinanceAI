const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');
const require_svg_attributes_weird_case = require('../utils/svg-attributes-weird-case.js');

//#region lib/rules/attribute-hyphenation.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function getAttributeName(node) {
	if (!node.directive) return node.key.rawName;
	if ((node.key.name.name === "bind" || node.key.name.name === "model") && node.key.argument && node.key.argument.type === "VIdentifier") return node.key.argument.rawName;
	return null;
}
var attribute_hyphenation_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce attribute naming style on custom components in template",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/attribute-hyphenation.html"
		},
		fixable: "code",
		schema: [{ enum: ["always", "never"] }, {
			type: "object",
			properties: {
				ignore: {
					type: "array",
					items: { allOf: [
						{ type: "string" },
						{ not: {
							type: "string",
							pattern: ":exit$"
						} },
						{ not: {
							type: "string",
							pattern: String.raw`^\s*$`
						} }
					] },
					uniqueItems: true,
					additionalItems: false
				},
				ignoreTags: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true,
					additionalItems: false
				}
			},
			additionalProperties: false
		}],
		messages: {
			mustBeHyphenated: "Attribute '{{text}}' must be hyphenated.",
			cannotBeHyphenated: "Attribute '{{text}}' can't be hyphenated."
		}
	},
	create(context) {
		const sourceCode = context.sourceCode;
		const option = context.options[0];
		const optionsPayload = context.options[1];
		const useHyphenated = option !== "never";
		const isIgnoredTagName = require_regexp.toRegExpGroupMatcher(optionsPayload?.ignoreTags);
		const ignoredAttributes = [
			"data-",
			"aria-",
			"slot-scope",
			...require_svg_attributes_weird_case.default
		];
		if (optionsPayload && optionsPayload.ignore) ignoredAttributes.push(...optionsPayload.ignore);
		const caseConverter = require_casing.getExactConverter(useHyphenated ? "kebab-case" : "camelCase");
		function reportIssue(node, name) {
			const text = sourceCode.getText(node.key);
			context.report({
				node: node.key,
				loc: node.loc,
				messageId: useHyphenated ? "mustBeHyphenated" : "cannotBeHyphenated",
				data: { text },
				fix: (fixer) => {
					if (text.includes("_")) return null;
					if (text.endsWith(".sync")) return null;
					if (/^[A-Z]/.test(name)) return null;
					return fixer.replaceText(node.key, text.replace(name, caseConverter(name)));
				}
			});
		}
		function isIgnoredAttribute(value) {
			if (ignoredAttributes.some((attr) => value.includes(attr))) return true;
			return useHyphenated ? value.toLowerCase() === value : !/-/.test(value);
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { VAttribute(node) {
			const element = node.parent.parent;
			if (!import_utils.default.isCustomComponent(element) && element.name !== "slot" || isIgnoredTagName(element.rawName)) return;
			const name = getAttributeName(node);
			if (name === null || isIgnoredAttribute(name)) return;
			reportIssue(node, name);
		} });
	}
};

//#endregion
exports.default = attribute_hyphenation_default;