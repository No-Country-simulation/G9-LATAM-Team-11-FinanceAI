const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-props.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function parseOption(option) {
	if (typeof option === "string") {
		const matcher = require_regexp.toRegExp(option, { remove: "g" });
		return { test(name) {
			return matcher.test(name);
		} };
	}
	const parsed = parseOption(option.name);
	parsed.message = option.message;
	parsed.suggest = option.suggest;
	return parsed;
}
var no_restricted_props_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific props",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-props.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: {
			type: "array",
			items: { oneOf: [{ type: ["string"] }, {
				type: "object",
				properties: {
					name: { type: "string" },
					message: {
						type: "string",
						minLength: 1
					},
					suggest: { type: "string" }
				},
				required: ["name"],
				additionalProperties: false
			}] },
			uniqueItems: true,
			minItems: 0
		},
		messages: {
			restrictedProp: "{{message}}",
			instead: "Instead, change to `{{suggest}}`."
		}
	},
	create(context) {
		const options = context.options.map(parseOption);
		function processProps(props, fixPropInOtherPlaces) {
			for (const prop of props) {
				if (!prop.propName) continue;
				for (const option of options) if (option.test(prop.propName)) {
					const message = option.message || `Using \`${prop.propName}\` props is not allowed.`;
					context.report({
						node: prop.type === "infer-type" ? prop.node : prop.key,
						messageId: "restrictedProp",
						data: { message },
						suggest: prop.type === "infer-type" ? null : createSuggest(prop.key, option, fixPropInOtherPlaces ? (fixer, replaceKeyText) => fixPropInOtherPlaces(fixer, prop.propName, replaceKeyText) : void 0)
					});
					break;
				}
			}
		}
		return import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, { onDefinePropsEnter(node, props) {
			processProps(props, fixPropInOtherPlaces);
			function fixPropInOtherPlaces(fixer, propName, replaceKeyText) {
				const propertyNodes = [];
				const withDefault = import_utils.default.getWithDefaultsProps(node)[propName];
				if (withDefault) propertyNodes.push(withDefault);
				const propDestructure = import_utils.default.getPropsDestructure(node)[propName];
				if (propDestructure) propertyNodes.push(propDestructure);
				return propertyNodes.map((propertyNode) => propertyNode.shorthand ? fixer.insertTextBefore(propertyNode.value, `${replaceKeyText}:`) : fixer.replaceText(propertyNode.key, replaceKeyText));
			}
		} }), import_utils.default.defineVueVisitor(context, { onVueObjectEnter(node) {
			processProps(import_utils.default.getComponentPropsFromOptions(node));
		} }));
	}
};
function createSuggest(node, option, fixPropInOtherPlaces) {
	if (!option.suggest) return [];
	let replaceText;
	if (node.type === "Literal" || node.type === "TemplateLiteral") replaceText = JSON.stringify(option.suggest);
	else if (node.type === "Identifier") replaceText = /^[a-z]\w*$/iu.test(option.suggest) ? option.suggest : JSON.stringify(option.suggest);
	else return [];
	return [{
		fix(fixer) {
			const fixes = [fixer.replaceText(node, replaceText)];
			if (fixPropInOtherPlaces) fixes.push(...fixPropInOtherPlaces(fixer, replaceText));
			return fixes.sort((a, b) => a.range[0] - b.range[0]);
		},
		messageId: "instead",
		data: { suggest: option.suggest }
	}];
}

//#endregion
exports.default = no_restricted_props_default;