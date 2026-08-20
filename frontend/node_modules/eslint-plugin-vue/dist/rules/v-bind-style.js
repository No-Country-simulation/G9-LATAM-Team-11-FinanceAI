const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/v-bind-style.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function kebabCaseToCamelCase(name) {
	return require_casing.isKebabCase(name) ? require_casing.camelCase(name) : name;
}
function isSameName(node) {
	const attrName = node.key.argument.type === "VIdentifier" ? node.key.argument.rawName : null;
	const valueName = node.value?.expression?.type === "Identifier" ? node.value.expression.name : null;
	if (!attrName || !valueName) return false;
	return kebabCaseToCamelCase(attrName) === kebabCaseToCamelCase(valueName);
}
function getCutStart(key) {
	const lastModifier = key.modifiers.at(-1);
	return lastModifier ? lastModifier.range[1] : key.argument.range[1];
}
var v_bind_style_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce `v-bind` directive style",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/v-bind-style.html"
		},
		fixable: "code",
		schema: [{ enum: ["shorthand", "longform"] }, {
			type: "object",
			properties: { sameNameShorthand: { enum: [
				"always",
				"never",
				"ignore"
			] } },
			additionalProperties: false
		}],
		messages: {
			expectedLonghand: "Expected 'v-bind' before ':'.",
			unexpectedLonghand: "Unexpected 'v-bind' before ':'.",
			expectedLonghandForProp: "Expected 'v-bind:' instead of '.'.",
			expectedShorthand: "Expected same-name shorthand.",
			unexpectedShorthand: "Unexpected same-name shorthand."
		}
	},
	create(context) {
		const preferShorthand = context.options[0] !== "longform";
		const sameNameShorthand = context.options[1]?.sameNameShorthand || "ignore";
		function checkAttributeStyle(node) {
			const shorthandProp = node.key.name.rawName === ".";
			if ((node.key.name.rawName === ":" || shorthandProp) === preferShorthand) return;
			let messageId = "expectedLonghand";
			if (preferShorthand) messageId = "unexpectedLonghand";
			else if (shorthandProp) messageId = "expectedLonghandForProp";
			context.report({
				node,
				loc: node.loc,
				messageId,
				*fix(fixer) {
					if (preferShorthand) yield fixer.remove(node.key.name);
					else {
						yield fixer.insertTextBefore(node, "v-bind");
						if (shorthandProp) {
							yield fixer.replaceText(node.key.name, ":");
							const modifier = node.key.modifiers[0];
							if (modifier.name === "prop" && modifier.rawName === "") yield fixer.insertTextBefore(modifier, ".prop");
						}
					}
				}
			});
		}
		function checkAttributeSameName(node) {
			if (sameNameShorthand === "ignore" || !isSameName(node)) return;
			const preferShorthand = sameNameShorthand === "always";
			if (import_utils.default.isVBindSameNameShorthand(node) === preferShorthand) return;
			const messageId = preferShorthand ? "expectedShorthand" : "unexpectedShorthand";
			context.report({
				node,
				loc: node.loc,
				messageId,
				*fix(fixer) {
					if (preferShorthand) {
						const valueRange = [getCutStart(node.key), node.range[1]];
						yield fixer.removeRange(valueRange);
					} else if (node.key.argument.type === "VIdentifier") yield fixer.insertTextAfter(node, `="${kebabCaseToCamelCase(node.key.argument.rawName)}"`);
				}
			});
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { "VAttribute[directive=true][key.name.name='bind'][key.argument!=null]"(node) {
			checkAttributeSameName(node);
			checkAttributeStyle(node);
		} });
	}
};

//#endregion
exports.default = v_bind_style_default;