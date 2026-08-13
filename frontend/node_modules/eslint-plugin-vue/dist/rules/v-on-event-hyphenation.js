const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/v-on-event-hyphenation.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var v_on_event_hyphenation_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce v-on event naming style on custom components in template",
			categories: ["vue3-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/v-on-event-hyphenation.html",
			defaultOptions: { vue3: ["always", { autofix: true }] }
		},
		fixable: "code",
		schema: [{ enum: ["always", "never"] }, {
			type: "object",
			properties: {
				autofix: { type: "boolean" },
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
			mustBeHyphenated: "v-on event '{{text}}' must be hyphenated.",
			cannotBeHyphenated: "v-on event '{{text}}' can't be hyphenated."
		}
	},
	create(context) {
		const sourceCode = context.sourceCode;
		const option = context.options[0];
		const optionsPayload = context.options[1];
		const useHyphenated = option !== "never";
		const ignoredAttributes = optionsPayload && optionsPayload.ignore || [];
		const isIgnoredTag = require_regexp.toRegExpGroupMatcher(optionsPayload?.ignoreTags);
		const autofix = Boolean(optionsPayload && optionsPayload.autofix);
		const caseConverter = require_casing.getConverter(useHyphenated ? "kebab-case" : "camelCase");
		function reportIssue(node, argument, name) {
			const text = sourceCode.getText(node.key);
			context.report({
				node: node.key,
				loc: node.loc,
				messageId: useHyphenated ? "mustBeHyphenated" : "cannotBeHyphenated",
				data: { text },
				fix: autofix && !name.includes("_") ? (fixer) => fixer.replaceText(argument, caseConverter(name)) : null
			});
		}
		function isIgnoredAttribute(value) {
			if (ignoredAttributes.some((attr) => value.includes(attr))) return true;
			return useHyphenated ? value.toLowerCase() === value : !/-/.test(value);
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { "VAttribute[directive=true][key.name.name='on']"(node) {
			const element = node.parent.parent;
			if (!import_utils.default.isCustomComponent(element) || isIgnoredTag(element.rawName)) return;
			if (!node.key.argument || node.key.argument.type !== "VIdentifier") return;
			const name = node.key.argument.rawName;
			if (!name || isIgnoredAttribute(name)) return;
			reportIssue(node, node.key.argument, name);
		} });
	}
};

//#endregion
exports.default = v_on_event_hyphenation_default;