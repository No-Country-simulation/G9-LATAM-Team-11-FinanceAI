const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-v-bind.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const DEFAULT_OPTIONS = [{
	argument: "/^v-/",
	message: "Using `:v-xxx` is not allowed. Instead, remove `:` and use it as directive."
}];
function parseOption(option) {
	if (typeof option === "string") {
		const matcher = require_regexp.toRegExp(option, { remove: "g" });
		return {
			test(key) {
				return Boolean(key.argument && key.argument.type === "VIdentifier" && matcher.test(key.argument.rawName));
			},
			modifiers: []
		};
	}
	if (option === null) return {
		test(key) {
			return key.argument === null;
		},
		modifiers: []
	};
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
			const element = key.parent.parent.parent;
			return tagMatcher.test(element.rawName);
		};
		parsed.useElement = true;
	}
	parsed.message = option.message;
	return parsed;
}
function defaultMessage(key, option) {
	const vbind = key.name.rawName === ":" ? "" : "v-bind";
	const arg = key.argument != null && key.argument.type === "VIdentifier" ? `:${key.argument.rawName}` : "";
	const mod = option.modifiers.length > 0 ? `.${option.modifiers.join(".")}` : "";
	let on = "";
	if (option.useElement) on = ` on \`<${key.parent.parent.parent.rawName}>\``;
	return `Using \`${vbind + arg + mod}\`${on} is not allowed.`;
}
var no_restricted_v_bind_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific argument in `v-bind`",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-v-bind.html"
		},
		fixable: null,
		schema: {
			type: "array",
			items: { oneOf: [{ type: ["string", "null"] }, {
				type: "object",
				properties: {
					argument: { type: ["string", "null"] },
					modifiers: {
						type: "array",
						items: {
							type: "string",
							enum: [
								"prop",
								"camel",
								"sync",
								"attr"
							]
						},
						uniqueItems: true
					},
					element: { type: "string" },
					message: {
						type: "string",
						minLength: 1
					}
				},
				required: ["argument"],
				additionalProperties: false
			}] },
			uniqueItems: true,
			minItems: 0
		},
		messages: { restrictedVBind: "{{message}}" }
	},
	create(context) {
		const options = (context.options.length === 0 ? DEFAULT_OPTIONS : context.options).map(parseOption);
		return import_utils.default.defineTemplateBodyVisitor(context, { "VAttribute[directive=true][key.name.name='bind'] > VDirectiveKey"(node) {
			for (const option of options) if (option.test(node)) {
				const message = option.message || defaultMessage(node, option);
				context.report({
					node,
					messageId: "restrictedVBind",
					data: { message }
				});
				return;
			}
		} });
	}
};

//#endregion
exports.default = no_restricted_v_bind_default;