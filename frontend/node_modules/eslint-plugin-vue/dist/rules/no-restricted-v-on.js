const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-v-on.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function parseOption(option) {
	if (typeof option === "string") {
		const matcher = require_regexp.toRegExp(option, { remove: "g" });
		return { test(key) {
			return Boolean(key.argument && key.argument.type === "VIdentifier" && matcher.test(key.argument.rawName));
		} };
	}
	if (option === null) return { test(key) {
		return key.argument === null;
	} };
	const parsed = parseOption(option.argument);
	if (option.modifiers) {
		const argTest = parsed.test;
		parsed.test = (key) => {
			if (!argTest(key)) return false;
			return option.modifiers.every((modName) => key.modifiers.some((mid) => mid.name === modName));
		};
		parsed.modifiers = option.modifiers;
	}
	if (option.element) {
		const argTest = parsed.test;
		const tagMatcher = require_regexp.toRegExp(option.element, { remove: "g" });
		parsed.test = (key) => {
			if (!argTest(key)) return false;
			return tagMatcher.test(key.parent.parent.parent.rawName);
		};
		parsed.useElement = true;
	}
	parsed.message = option.message;
	return parsed;
}
function defaultMessage(key, option) {
	const von = key.name.rawName === "@" ? "" : "v-on";
	const arg = key.argument != null && key.argument.type === "VIdentifier" ? `${key.name.rawName === "@" ? "@" : ":"}${key.argument.rawName}` : "";
	const mod = option.modifiers != null && option.modifiers.length > 0 ? `.${option.modifiers.join(".")}` : "";
	let element = "element";
	if (option.useElement) element = `<${key.parent.parent.parent.rawName}>`;
	return `Using \`${von + arg + mod}\` is not allowed on this ${element}.`;
}
var no_restricted_v_on_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific argument in `v-on`",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-v-on.html"
		},
		fixable: null,
		schema: {
			type: "array",
			items: { oneOf: [{ type: ["string", "null"] }, {
				type: "object",
				properties: {
					argument: { type: ["string", "null"] },
					element: { type: "string" },
					message: {
						type: "string",
						minLength: 1
					},
					modifiers: {
						type: "array",
						items: {
							type: "string",
							enum: [
								"prevent",
								"stop",
								"capture",
								"self",
								"once",
								"passive"
							]
						},
						uniqueItems: true,
						minItems: 1
					}
				},
				required: ["argument"],
				additionalProperties: false
			}] },
			uniqueItems: true
		},
		messages: { restrictedVOn: "{{message}}" }
	},
	create(context) {
		if (context.options.length === 0) return {};
		const options = context.options.map(parseOption);
		return import_utils.default.defineTemplateBodyVisitor(context, { "VAttribute[directive=true][key.name.name='on'] > VDirectiveKey"(node) {
			for (const option of options) if (option.test(node)) {
				const message = option.message || defaultMessage(node, option);
				context.report({
					node,
					messageId: "restrictedVOn",
					data: { message }
				});
				return;
			}
		} });
	}
};

//#endregion
exports.default = no_restricted_v_on_default;