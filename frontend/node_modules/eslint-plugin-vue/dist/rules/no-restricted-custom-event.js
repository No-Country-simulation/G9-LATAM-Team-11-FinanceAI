const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/rules/no-restricted-custom-event.ts
/**
* @author Yosuke Ota
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function parseOption(option) {
	if (typeof option === "string") {
		const matcher = require_regexp.toRegExp(option, { remove: "g" });
		return { test(name) {
			return matcher.test(name);
		} };
	}
	const parsed = parseOption(option.event);
	parsed.message = option.message;
	parsed.suggest = option.suggest;
	return parsed;
}
/**
* Get the name param node from the given CallExpression
*/
function getNameParamNode(node) {
	const nameLiteralNode = node.arguments[0];
	if (nameLiteralNode && import_utils.default.isStringLiteral(nameLiteralNode)) {
		const name = import_utils.default.getStringLiteralValue(nameLiteralNode);
		if (name != null) return {
			name,
			loc: nameLiteralNode.loc,
			range: nameLiteralNode.range
		};
	}
	return null;
}
/**
* Get the callee member node from the given CallExpression
*/
function getCalleeMemberNode(node) {
	const callee = import_utils.default.skipChainExpression(node.callee);
	if (callee.type === "MemberExpression") {
		const name = import_utils.default.getStaticPropertyName(callee);
		if (name) return {
			name,
			member: callee
		};
	}
	return null;
}
var no_restricted_custom_event_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific custom event",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-custom-event.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: {
			type: "array",
			items: { oneOf: [{ type: ["string"] }, {
				type: "object",
				properties: {
					event: { type: "string" },
					message: {
						type: "string",
						minLength: 1
					},
					suggest: { type: "string" }
				},
				required: ["event"],
				additionalProperties: false
			}] },
			uniqueItems: true,
			minItems: 0
		},
		messages: {
			restrictedEvent: "{{message}}",
			instead: "Instead, change to `{{suggest}}`."
		}
	},
	create(context) {
		const setupContexts = /* @__PURE__ */ new Map();
		const options = context.options.map(parseOption);
		function verify(nameWithLoc) {
			const name = nameWithLoc.name;
			for (const option of options) if (option.test(name)) {
				const message = option.message || `Using \`${name}\` event is not allowed.`;
				context.report({
					loc: nameWithLoc.loc,
					messageId: "restrictedEvent",
					data: { message },
					suggest: option.suggest ? [{
						fix(fixer) {
							const sourceCode = context.sourceCode;
							return fixer.replaceTextRange(nameWithLoc.range, `${sourceCode.text[nameWithLoc.range[0]]}${JSON.stringify(option.suggest).slice(1, -1).replaceAll("'", String.raw`\'`)}${sourceCode.text[nameWithLoc.range[1] - 1]}`);
						},
						messageId: "instead",
						data: { suggest: option.suggest }
					}] : []
				});
				break;
			}
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { CallExpression(node) {
			const callee = node.callee;
			const nameWithLoc = getNameParamNode(node);
			if (!nameWithLoc) return;
			if (callee.type === "Identifier" && callee.name === "$emit") verify(nameWithLoc);
		} }, import_utils.default.compositingVisitors(import_utils.default.defineVueVisitor(context, {
			onSetupFunctionEnter(node, { node: vueNode }) {
				const contextParam = import_utils.default.skipDefaultParamValue(node.params[1]);
				if (!contextParam) return;
				if (contextParam.type === "RestElement" || contextParam.type === "ArrayPattern") return;
				const contextReferenceIds = /* @__PURE__ */ new Set();
				const emitReferenceIds = /* @__PURE__ */ new Set();
				if (contextParam.type === "ObjectPattern") {
					const emitProperty = import_utils.default.findAssignmentProperty(contextParam, "emit");
					if (!emitProperty || emitProperty.value.type !== "Identifier") return;
					const emitParam = emitProperty.value;
					const variable = (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, emitParam), emitParam);
					if (!variable) return;
					for (const reference of variable.references) emitReferenceIds.add(reference.identifier);
				} else {
					const variable = (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, contextParam), contextParam);
					if (!variable) return;
					for (const reference of variable.references) contextReferenceIds.add(reference.identifier);
				}
				setupContexts.set(vueNode, {
					contextReferenceIds,
					emitReferenceIds
				});
			},
			CallExpression(node, { node: vueNode }) {
				const nameWithLoc = getNameParamNode(node);
				if (!nameWithLoc) return;
				const setupContext = setupContexts.get(vueNode);
				if (setupContext) {
					const { contextReferenceIds, emitReferenceIds } = setupContext;
					if (node.callee.type === "Identifier" && emitReferenceIds.has(node.callee)) verify(nameWithLoc);
					else {
						const emit = getCalleeMemberNode(node);
						if (emit && emit.name === "emit" && emit.member.object.type === "Identifier" && contextReferenceIds.has(emit.member.object)) verify(nameWithLoc);
					}
				}
			},
			onVueObjectExit(node) {
				setupContexts.delete(node);
			}
		}), { CallExpression(node) {
			const nameWithLoc = getNameParamNode(node);
			if (!nameWithLoc) return;
			const emit = getCalleeMemberNode(node);
			if (emit && emit.name === "$emit") verify(nameWithLoc);
		} }));
	}
};

//#endregion
exports.default = no_restricted_custom_event_default;