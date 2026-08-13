const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/v-slot-style.ts
/**
* @author Toru Nagashima
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function normalizeOptions(options) {
	const normalized = {
		atComponent: "v-slot",
		default: "shorthand",
		named: "shorthand"
	};
	if (typeof options === "string") normalized.atComponent = normalized.default = normalized.named = options;
	else if (options != null) {
		for (const key of [
			"atComponent",
			"default",
			"named"
		]) if (options[key] != null) normalized[key] = options[key];
	}
	return normalized;
}
/**
* Get the expected style.
*/
function getExpectedStyle(options, node) {
	const { argument } = node.key;
	if (argument == null || argument.type === "VIdentifier" && argument.name === "default") return node.parent.parent.name === "template" ? options.default : options.atComponent;
	return options.named;
}
/**
* Get the expected style.
*/
function getActualStyle(node) {
	const { name, argument } = node.key;
	if (name.rawName === "#") return "shorthand";
	if (argument != null) return "longform";
	return "v-slot";
}
var v_slot_style_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce `v-slot` directive style",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/v-slot-style.html"
		},
		fixable: "code",
		schema: [{ oneOf: [{ enum: ["shorthand", "longform"] }, {
			type: "object",
			properties: {
				atComponent: { enum: [
					"shorthand",
					"longform",
					"v-slot"
				] },
				default: { enum: [
					"shorthand",
					"longform",
					"v-slot"
				] },
				named: { enum: ["shorthand", "longform"] }
			},
			additionalProperties: false
		}] }],
		messages: {
			expectedShorthand: "Expected '#{{argument}}' instead of '{{actual}}'.",
			expectedLongform: "Expected 'v-slot:{{argument}}' instead of '{{actual}}'.",
			expectedVSlot: "Expected 'v-slot' instead of '{{actual}}'."
		}
	},
	create(context) {
		const sourceCode = context.sourceCode;
		const options = normalizeOptions(context.options[0]);
		return import_utils.default.defineTemplateBodyVisitor(context, { "VAttribute[directive=true][key.name.name='slot']"(node) {
			const expected = getExpectedStyle(options, node);
			if (getActualStyle(node) === expected) return;
			const { name, argument } = node.key;
			const range = [name.range[0], (argument || name).range[1]];
			const argumentText = argument ? sourceCode.getText(argument) : "default";
			context.report({
				node,
				messageId: `expected${require_casing.pascalCase(expected)}`,
				data: {
					actual: sourceCode.text.slice(range[0], range[1]),
					argument: argumentText
				},
				fix(fixer) {
					switch (expected) {
						case "shorthand": return fixer.replaceTextRange(range, `#${argumentText}`);
						case "longform": return fixer.replaceTextRange(range, `v-slot:${argumentText}`);
						case "v-slot": return fixer.replaceTextRange(range, "v-slot");
						default: return null;
					}
				}
			});
		} });
	}
};

//#endregion
exports.default = v_slot_style_default;