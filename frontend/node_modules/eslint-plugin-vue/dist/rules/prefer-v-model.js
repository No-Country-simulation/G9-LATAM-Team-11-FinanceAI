const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/prefer-v-model.ts
/**
* @author Flo Edelmann
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* Get the static argument name of a directive, or `null` for dynamic arguments.
*/
const getStaticArgName = (directive) => directive.key.argument?.type === "VIdentifier" ? directive.key.argument.rawName : null;
/**
* Extract the prop name from an `update:propName` event directive argument.
*/
function getUpdateEventPropName(onDirective) {
	const argName = getStaticArgName(onDirective);
	if (!argName?.startsWith("update:")) return null;
	return argName.slice(7);
}
/**
* Check if the event handler is a simple mirror assignment of the bind expression.
* Matches: `bar = $event` or `(param) => bar = param`
*/
function isMirrorAssignment(bindExpr, onExpr, sourceCode) {
	const bindText = sourceCode.getText(bindExpr);
	if (onExpr.type === "VOnExpression") {
		const statements = onExpr.body;
		if (statements.length !== 1) return false;
		const stmt = statements[0];
		if (stmt.type !== "ExpressionStatement") return false;
		const expr = stmt.expression;
		if (expr.type !== "AssignmentExpression" || expr.operator !== "=") return false;
		return sourceCode.getText(expr.left) === bindText && expr.right.type === "Identifier" && expr.right.name === "$event";
	}
	if (onExpr.type === "ArrowFunctionExpression") {
		if (onExpr.params.length !== 1) return false;
		const param = onExpr.params[0];
		if (param.type !== "Identifier") return false;
		const body = onExpr.body;
		if (body.type !== "AssignmentExpression" || body.operator !== "=") return false;
		return sourceCode.getText(body.left) === bindText && body.right.type === "Identifier" && body.right.name === param.name;
	}
	return false;
}
var prefer_v_model_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce using `v-model` instead of `:prop`/`@update:prop` pair",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/prefer-v-model.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: [],
		messages: {
			preferVModel: "Prefer `{{ vModelName }}` over the `:{{ propName }}`/`@update:{{ eventName }}` pair.",
			replaceWithVModel: "Replace with `{{ vModelName }}`."
		}
	},
	create(context) {
		const sourceCode = context.sourceCode;
		return import_utils.default.defineTemplateBodyVisitor(context, { VStartTag(node) {
			const element = node.parent;
			if (!import_utils.default.isCustomComponent(element)) return;
			const bindDirectives = [];
			const onDirectives = [];
			for (const attr of node.attributes) {
				if (!attr.directive) continue;
				if (attr.key.name.name === "bind" && getStaticArgName(attr) != null && attr.key.modifiers.length === 0) bindDirectives.push(attr);
				if (attr.key.name.name === "on" && getUpdateEventPropName(attr) != null && attr.key.modifiers.length === 0) onDirectives.push(attr);
			}
			for (const bindDir of bindDirectives) {
				const propName = getStaticArgName(bindDir);
				if (!propName) continue;
				const normalizedBindName = require_casing.camelCase(propName);
				const matchingOnDir = onDirectives.find((onDir) => require_casing.camelCase(getUpdateEventPropName(onDir)) === normalizedBindName);
				if (!matchingOnDir) continue;
				const bindExpr = bindDir.value?.expression;
				const onExpr = matchingOnDir.value?.expression;
				if (!bindExpr || bindExpr.type === "VFilterSequenceExpression" || bindExpr.type === "VForExpression" || bindExpr.type === "VOnExpression" || bindExpr.type === "VSlotScopeExpression" || !onExpr || !isMirrorAssignment(bindExpr, onExpr, sourceCode)) continue;
				const vModelName = normalizedBindName === "modelValue" ? "v-model" : `v-model:${propName}`;
				const eventName = getUpdateEventPropName(matchingOnDir) ?? propName;
				const vModelText = `${vModelName}=${sourceCode.getText(bindDir.value)}`;
				context.report({
					node: bindDir,
					messageId: "preferVModel",
					data: {
						vModelName,
						propName,
						eventName
					},
					suggest: [{
						messageId: "replaceWithVModel",
						data: { vModelName },
						*fix(fixer) {
							yield fixer.replaceText(bindDir, vModelText);
							const textBefore = sourceCode.getText().slice(0, matchingOnDir.range[0]);
							const removeStart = matchingOnDir.range[0] - (textBefore.length - textBefore.trimEnd().length);
							yield fixer.removeRange([removeStart, matchingOnDir.range[1]]);
						}
					}]
				});
			}
		} });
	}
};

//#endregion
exports.default = prefer_v_model_default;