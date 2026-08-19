const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/rules/prefer-single-event-payload.ts
/**
* @author Flo Edelmann
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
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
function getReportLocation(parameters, firstReportedIndex) {
	if (parameters.length < firstReportedIndex + 1) return;
	return {
		start: parameters[firstReportedIndex].loc.start,
		end: parameters.at(-1).loc.end
	};
}
var prefer_single_event_payload_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce passing a single argument to custom event emissions",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/prefer-single-event-payload.html"
		},
		fixable: null,
		hasSuggestions: false,
		schema: [],
		messages: {
			preferSinglePayload: "Pass a single payload object instead of multiple arguments when emitting the \"{{name}}\" event.",
			preferSinglePayloadInDeclaration: "Declare a single payload parameter instead of multiple parameters for the \"{{name}}\" event."
		}
	},
	create(context) {
		const setupContexts = /* @__PURE__ */ new Map();
		function verifyEmitCall(node) {
			if (node.arguments.length <= 2) return;
			const eventNameArg = node.arguments[0];
			const name = import_utils.default.isStringLiteral(eventNameArg) ? import_utils.default.getStringLiteralValue(eventNameArg) : null;
			context.report({
				node,
				loc: getReportLocation(node.arguments, 2),
				messageId: "preferSinglePayload",
				data: { name: name ?? "unknown" }
			});
		}
		function verifyEmitDeclarationNode(emit, parameters, firstReportedIndex = 1) {
			const reportLocation = getReportLocation(parameters, firstReportedIndex);
			if (reportLocation) context.report({
				node: emit.node,
				loc: reportLocation,
				messageId: "preferSinglePayloadInDeclaration",
				data: { name: emit.emitName ?? "unknown" }
			});
		}
		function verifyEmitDeclaration(emit) {
			if (emit.type === "object") {
				if (emit.value.type === "ArrowFunctionExpression" || emit.value.type === "FunctionExpression") verifyEmitDeclarationNode(emit, emit.value.params);
			} else if (emit.type === "type") switch (emit.node.type) {
				case "TSCallSignatureDeclaration":
				case "TSFunctionType":
					verifyEmitDeclarationNode(emit, emit.node.params, 2);
					break;
				case "TSPropertySignature": {
					const typeAnno = emit.node.typeAnnotation?.typeAnnotation;
					if (typeAnno?.type === "TSTupleType") verifyEmitDeclarationNode(emit, typeAnno.elementTypes);
					break;
				}
				case "TSMethodSignature":
					verifyEmitDeclarationNode(emit, emit.node.params);
					break;
			}
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { CallExpression(node) {
			const callee = import_utils.default.skipChainExpression(node.callee);
			const setupContext = setupContexts.get(context.sourceCode.ast);
			if (callee.type === "Identifier" && (callee.name === "$emit" || setupContext && [...setupContext.emitReferenceIds].some((id) => id.name === callee.name))) verifyEmitCall(node);
		} }, import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, {
			onDefineEmitsEnter(node, emits) {
				for (const emit of emits) verifyEmitDeclaration(emit);
				if (!node.parent || node.parent.type !== "VariableDeclarator" || node.parent.init !== node) return;
				const emitParam = node.parent.id;
				if (emitParam.type !== "Identifier") return;
				const variable = (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, emitParam), emitParam);
				if (!variable) return;
				const emitReferenceIds = /* @__PURE__ */ new Set();
				for (const reference of variable.references) {
					if (!reference.isRead()) continue;
					emitReferenceIds.add(reference.identifier);
				}
				const programNode = context.sourceCode.ast;
				setupContexts.set(programNode, {
					contextReferenceIds: /* @__PURE__ */ new Set(),
					emitReferenceIds
				});
			},
			CallExpression(node) {
				const callee = import_utils.default.skipChainExpression(node.callee);
				const programNode = context.sourceCode.ast;
				const setupContext = setupContexts.get(programNode);
				if (setupContext && callee.type === "Identifier" && setupContext.emitReferenceIds.has(callee)) verifyEmitCall(node);
			}
		}), import_utils.default.executeOnVue(context, (obj) => {
			for (const emit of import_utils.default.getComponentEmitsFromOptions(obj)) verifyEmitDeclaration(emit);
		}), import_utils.default.defineVueVisitor(context, {
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
				const callee = import_utils.default.skipChainExpression(node.callee);
				const setupContext = setupContexts.get(vueNode);
				if (setupContext) {
					const { contextReferenceIds, emitReferenceIds } = setupContext;
					if (callee.type === "Identifier" && emitReferenceIds.has(callee)) verifyEmitCall(node);
					else {
						const emit = getCalleeMemberNode(node);
						if (emit && emit.name === "emit" && emit.member.object.type === "Identifier" && contextReferenceIds.has(emit.member.object)) verifyEmitCall(node);
					}
				}
			},
			onVueObjectExit(node) {
				setupContexts.delete(node);
			}
		}), { CallExpression(node) {
			const emit = getCalleeMemberNode(node);
			if (emit && emit.name === "$emit") verifyEmitCall(node);
		} }));
	}
};

//#endregion
exports.default = prefer_single_event_payload_default;