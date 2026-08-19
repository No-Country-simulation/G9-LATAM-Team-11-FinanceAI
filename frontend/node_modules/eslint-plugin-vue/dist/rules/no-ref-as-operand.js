const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_ref_object_references = require('../utils/ref-object-references.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/rules/no-ref-as-operand.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* Checks whether the given identifier reference has been initialized with a ref object.
*/
function isRefInit(data) {
	const init = data && data.variableDeclarator && data.variableDeclarator.init;
	if (!init) return false;
	return data.defineChain.includes(init);
}
/**
* Get the callee member node from the given CallExpression
*/
function getNameParamNode(node) {
	const nameLiteralNode = node.arguments[0];
	if (nameLiteralNode && import_utils.default.isStringLiteral(nameLiteralNode)) {
		const name = import_utils.default.getStringLiteralValue(nameLiteralNode);
		if (name != null) return {
			name,
			loc: nameLiteralNode.loc
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
var no_ref_as_operand_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow use of value wrapped by `ref()` (Composition API) as an operand",
			categories: ["vue3-essential", "vue2-essential"],
			url: "https://eslint.vuejs.org/rules/no-ref-as-operand.html"
		},
		fixable: "code",
		schema: [],
		messages: { requireDotValue: "Must use `.value` to read or write the value wrapped by `{{method}}()`." }
	},
	create(context) {
		let refReferences;
		const setupContexts = /* @__PURE__ */ new Map();
		/**
		* Collect identifier id
		*/
		function collectReferenceIds(node, referenceIds) {
			const variable = (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, node), node);
			if (!variable) return;
			for (const reference of variable.references) referenceIds.add(reference.identifier);
		}
		function reportIfRefWrapped(node) {
			const data = refReferences.get(node);
			if (!isRefInit(data)) return;
			context.report({
				node,
				messageId: "requireDotValue",
				data: { method: data.method },
				fix(fixer) {
					return fixer.insertTextAfter(node, ".value");
				}
			});
		}
		function reportWrappedIdentifiers(node) {
			const nodes = node.arguments.filter((node) => node.type === "Identifier");
			for (const node of nodes) reportIfRefWrapped(node);
		}
		const programNode = context.sourceCode.ast;
		const callVisitor = { CallExpression(node, info) {
			if (!getNameParamNode(node)) return;
			const setupContext = setupContexts.get(info ? info.node : programNode);
			if (!setupContext) return;
			const { contextReferenceIds, emitReferenceIds } = setupContext;
			if (node.callee.type === "Identifier" && emitReferenceIds.has(node.callee)) reportWrappedIdentifiers(node);
			else {
				const emit = getCalleeMemberNode(node);
				if (emit && emit.name === "emit" && emit.member.object.type === "Identifier" && contextReferenceIds.has(emit.member.object)) reportWrappedIdentifiers(node);
			}
		} };
		return import_utils.default.compositingVisitors({
			Program() {
				refReferences = require_ref_object_references.extractRefObjectReferences(context);
			},
			"IfStatement>Identifier"(node) {
				reportIfRefWrapped(node);
			},
			"SwitchStatement>Identifier"(node) {
				reportIfRefWrapped(node);
			},
			"UnaryExpression>Identifier"(node) {
				reportIfRefWrapped(node);
			},
			"UpdateExpression>Identifier"(node) {
				reportIfRefWrapped(node);
			},
			"BinaryExpression>Identifier"(node) {
				reportIfRefWrapped(node);
			},
			"AssignmentExpression>Identifier"(node) {
				if (node.parent.operator === "=" && node.parent.left !== node) return;
				reportIfRefWrapped(node);
			},
			"LogicalExpression>Identifier"(node) {
				if (node.parent.left !== node) return;
				const data = refReferences.get(node);
				if (!data || !data.variableDeclaration || data.variableDeclaration.kind !== "const") return;
				reportIfRefWrapped(node);
			},
			"ConditionalExpression>Identifier"(node) {
				if (node.parent.test !== node) return;
				reportIfRefWrapped(node);
			},
			":not(TaggedTemplateExpression)>TemplateLiteral>Identifier"(node) {
				reportIfRefWrapped(node);
			},
			"MemberExpression>Identifier"(node) {
				if (node.parent.object !== node) return;
				const name = import_utils.default.getStaticPropertyName(node.parent);
				if (name === "value" || name == null || name === "effect") return;
				reportIfRefWrapped(node);
			}
		}, import_utils.default.defineScriptSetupVisitor(context, {
			onDefineEmitsEnter(node) {
				if (!node.parent || node.parent.type !== "VariableDeclarator" || node.parent.init !== node) return;
				const emitParam = node.parent.id;
				if (emitParam.type !== "Identifier") return;
				const emitReferenceIds = /* @__PURE__ */ new Set();
				collectReferenceIds(emitParam, emitReferenceIds);
				setupContexts.set(programNode, {
					contextReferenceIds: /* @__PURE__ */ new Set(),
					emitReferenceIds
				});
			},
			...callVisitor
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
					collectReferenceIds(emitProperty.value, emitReferenceIds);
				} else collectReferenceIds(contextParam, contextReferenceIds);
				setupContexts.set(vueNode, {
					contextReferenceIds,
					emitReferenceIds
				});
			},
			...callVisitor,
			onVueObjectExit(node) {
				setupContexts.delete(node);
			}
		}));
	}
};

//#endregion
exports.default = no_ref_as_operand_default;