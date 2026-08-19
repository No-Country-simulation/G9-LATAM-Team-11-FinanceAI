const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-component-options.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function parseOption(option) {
	if (typeof option === "string" || Array.isArray(option)) return parseOption({ name: option });
	const steps = [];
	for (const name of Array.isArray(option.name) ? option.name : [option.name]) if (name === "*") steps.push({ wildcard: true });
	else {
		const matcher = require_regexp.toRegExp(name, { remove: "g" });
		steps.push({ test: (value) => matcher.test(value) });
	}
	const message = option.message;
	return {
		test: buildTester(0),
		message
	};
	function buildTester(index) {
		const step = steps[index];
		const next = index + 1;
		const needNext = steps.length > next;
		return (node) => {
			let keyName;
			if (step.wildcard) keyName = "*";
			else {
				if (node.type !== "Property") return null;
				const name = import_utils.default.getStaticPropertyName(node);
				if (!name || !step.test(name)) return null;
				keyName = name;
			}
			return {
				next: needNext ? buildTester(next) : void 0,
				wildcard: step.wildcard,
				keyName
			};
		};
	}
}
function defaultMessage(path) {
	return `Using \`${path.join(".")}\` is not allowed.`;
}
var no_restricted_component_options_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific component option",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-component-options.html"
		},
		fixable: null,
		schema: {
			type: "array",
			items: { oneOf: [
				{ type: "string" },
				{
					type: "array",
					items: { type: "string" }
				},
				{
					type: "object",
					properties: {
						name: { oneOf: [{ type: "string" }, {
							type: "array",
							items: { type: "string" }
						}] },
						message: {
							type: "string",
							minLength: 1
						}
					},
					required: ["name"],
					additionalProperties: false
				}
			] },
			uniqueItems: true,
			minItems: 0
		},
		messages: { restrictedOption: "{{message}}" }
	},
	create(context) {
		if (!context.options || context.options.length === 0) return {};
		const options = context.options.map(parseOption);
		return import_utils.default.compositingVisitors(import_utils.default.defineVueVisitor(context, { onVueObjectEnter(node) {
			for (const option of options) verify(node, option.test, option.message);
		} }), import_utils.default.defineScriptSetupVisitor(context, { onDefineOptionsEnter(node) {
			if (node.arguments.length === 0) return;
			const define = node.arguments[0];
			if (define.type !== "ObjectExpression") return;
			for (const option of options) verify(define, option.test, option.message);
		} }));
		function verify(node, test, customMessage, path = []) {
			for (const prop of node.properties) {
				const result = test(prop);
				if (!result) continue;
				if (result.next) {
					if (prop.type !== "Property" || prop.value.type !== "ObjectExpression") continue;
					verify(prop.value, result.next, customMessage, [...path, result.keyName]);
				} else {
					const message = customMessage || defaultMessage([...path, result.keyName]);
					context.report({
						node: prop.type === "Property" ? prop.key : prop,
						messageId: "restrictedOption",
						data: { message }
					});
				}
			}
		}
	}
};

//#endregion
exports.default = no_restricted_component_options_default;