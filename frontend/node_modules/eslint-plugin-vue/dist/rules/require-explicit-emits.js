const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/rules/require-explicit-emits.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const FIX_EMITS_AFTER_OPTIONS = new Set([
	"setup",
	"data",
	"computed",
	"watch",
	"methods",
	"template",
	"render",
	"renderError",
	"beforeCreate",
	"created",
	"beforeMount",
	"mounted",
	"beforeUpdate",
	"updated",
	"activated",
	"deactivated",
	"beforeUnmount",
	"unmounted",
	"beforeDestroy",
	"destroyed",
	"renderTracked",
	"renderTriggered",
	"errorCaptured"
]);
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
var require_explicit_emits_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "require `emits` option with name triggered by `$emit()`",
			categories: ["vue3-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/require-explicit-emits.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: [{
			type: "object",
			properties: { allowProps: { type: "boolean" } },
			additionalProperties: false
		}],
		messages: {
			missing: "The \"{{name}}\" event has been triggered but not declared on {{emitsKind}}.",
			addOneOption: "Add the \"{{name}}\" to {{emitsKind}}.",
			addArrayEmitsOption: "Add the {{emitsKind}} with array syntax and define \"{{name}}\" event.",
			addObjectEmitsOption: "Add the {{emitsKind}} with object syntax and define \"{{name}}\" event."
		}
	},
	create(context) {
		const allowProps = !!(context.options[0] || {}).allowProps;
		const setupContexts = /* @__PURE__ */ new Map();
		const vueEmitsDeclarations = /* @__PURE__ */ new Map();
		const vuePropsDeclarations = /* @__PURE__ */ new Map();
		let emitParamName = "";
		let vueTemplateDefineData = null;
		function verifyEmit(emits, props, nameWithLoc, vueDefineNode) {
			const name = nameWithLoc.name;
			if (emits.some((e) => e.emitName === name || e.emitName == null)) return;
			if (allowProps) {
				const key = `on${require_casing.capitalize(name)}`;
				if (props.some((e) => e.propName === key || e.propName == null)) return;
			}
			context.report({
				loc: nameWithLoc.loc,
				messageId: "missing",
				data: {
					name,
					emitsKind: vueDefineNode.type === "ObjectExpression" ? "`emits` option" : "`defineEmits`"
				},
				suggest: buildSuggest(vueDefineNode, emits, nameWithLoc, context)
			});
		}
		const programNode = context.sourceCode.ast;
		if (import_utils.default.isScriptSetup(context)) vueTemplateDefineData = {
			type: "setup",
			define: programNode,
			emits: [],
			props: []
		};
		const callVisitor = { CallExpression(node, info) {
			const callee = import_utils.default.skipChainExpression(node.callee);
			const nameWithLoc = getNameParamNode(node);
			if (!nameWithLoc) return;
			const vueDefineNode = info ? info.node : programNode;
			const emitsDeclarations = vueEmitsDeclarations.get(vueDefineNode);
			if (!emitsDeclarations) return;
			let emit;
			if (callee.type === "MemberExpression") {
				const name = import_utils.default.getStaticPropertyName(callee);
				if (name === "emit" || name === "$emit") emit = {
					name,
					member: callee
				};
			}
			const setupContext = setupContexts.get(vueDefineNode);
			if (setupContext) {
				const { contextReferenceIds, emitReferenceIds } = setupContext;
				if (callee.type === "Identifier" && emitReferenceIds.has(callee)) verifyEmit(emitsDeclarations, vuePropsDeclarations.get(vueDefineNode) || [], nameWithLoc, vueDefineNode);
				else if (emit && emit.name === "emit") {
					const memObject = import_utils.default.skipChainExpression(emit.member.object);
					if (memObject.type === "Identifier" && contextReferenceIds.has(memObject)) verifyEmit(emitsDeclarations, vuePropsDeclarations.get(vueDefineNode) || [], nameWithLoc, vueDefineNode);
				}
			}
			if (emit && emit.name === "$emit") {
				const memObject = import_utils.default.skipChainExpression(emit.member.object);
				if (import_utils.default.isThis(memObject, context)) verifyEmit(emitsDeclarations, vuePropsDeclarations.get(vueDefineNode) || [], nameWithLoc, vueDefineNode);
			}
		} };
		return import_utils.default.defineTemplateBodyVisitor(context, { CallExpression(node) {
			const callee = import_utils.default.skipChainExpression(node.callee);
			const nameWithLoc = getNameParamNode(node);
			if (!nameWithLoc) return;
			if (!vueTemplateDefineData) return;
			if (callee.type === "Identifier" && (callee.name === "$emit" || callee.name === emitParamName)) verifyEmit(vueTemplateDefineData.emits, vueTemplateDefineData.props, nameWithLoc, vueTemplateDefineData.define);
		} }, import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, {
			onDefineEmitsEnter(node, emits) {
				vueEmitsDeclarations.set(programNode, emits);
				if (vueTemplateDefineData && vueTemplateDefineData.type === "setup") {
					vueTemplateDefineData.emits = emits;
					vueTemplateDefineData.defineEmits = node;
				}
				if (!node.parent || node.parent.type !== "VariableDeclarator" || node.parent.init !== node) return;
				const emitParam = node.parent.id;
				if (emitParam.type !== "Identifier") return;
				emitParamName = emitParam.name;
				const variable = (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, emitParam), emitParam);
				if (!variable) return;
				const emitReferenceIds = /* @__PURE__ */ new Set();
				for (const reference of variable.references) {
					if (!reference.isRead()) continue;
					emitReferenceIds.add(reference.identifier);
				}
				setupContexts.set(programNode, {
					contextReferenceIds: /* @__PURE__ */ new Set(),
					emitReferenceIds
				});
			},
			onDefinePropsEnter(_node, props) {
				if (allowProps) {
					vuePropsDeclarations.set(programNode, props);
					if (vueTemplateDefineData && vueTemplateDefineData.type === "setup") vueTemplateDefineData.props = props;
				}
			},
			...callVisitor
		}), import_utils.default.defineVueVisitor(context, {
			onVueObjectEnter(node) {
				vueEmitsDeclarations.set(node, import_utils.default.getComponentEmitsFromOptions(node));
				if (allowProps) vuePropsDeclarations.set(node, import_utils.default.getComponentPropsFromOptions(node));
			},
			onSetupFunctionEnter(node, { node: vueNode }) {
				const contextParam = node.params[1];
				if (!contextParam) return;
				if (contextParam.type === "RestElement") return;
				if (contextParam.type === "ArrayPattern") return;
				const contextReferenceIds = /* @__PURE__ */ new Set();
				const emitReferenceIds = /* @__PURE__ */ new Set();
				if (contextParam.type === "ObjectPattern") {
					const emitProperty = import_utils.default.findAssignmentProperty(contextParam, "emit");
					if (!emitProperty) return;
					const emitParam = emitProperty.value;
					const variable = emitParam.type === "Identifier" ? (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, emitParam), emitParam) : null;
					if (!variable) return;
					for (const reference of variable.references) {
						if (!reference.isRead()) continue;
						emitReferenceIds.add(reference.identifier);
					}
				} else if (contextParam.type === "Identifier") {
					const variable = (0, _eslint_community_eslint_utils.findVariable)(import_utils.default.getScope(context, contextParam), contextParam);
					if (!variable) return;
					for (const reference of variable.references) {
						if (!reference.isRead()) continue;
						contextReferenceIds.add(reference.identifier);
					}
				}
				setupContexts.set(vueNode, {
					contextReferenceIds,
					emitReferenceIds
				});
			},
			...callVisitor,
			onVueObjectExit(node, { type }) {
				const emits = vueEmitsDeclarations.get(node);
				if ((!vueTemplateDefineData || vueTemplateDefineData.type !== "export" && vueTemplateDefineData.type !== "setup") && emits && (type === "mark" || type === "export" || type === "definition")) vueTemplateDefineData = {
					type,
					define: node,
					emits,
					props: vuePropsDeclarations.get(node) || []
				};
				setupContexts.delete(node);
				vueEmitsDeclarations.delete(node);
				vuePropsDeclarations.delete(node);
			}
		})));
	}
};
function buildSuggest(define, emits, nameWithLoc, context) {
	const emitsKind = define.type === "ObjectExpression" ? "`emits` option" : "`defineEmits`";
	const lastEmit = emits.filter((e) => e.type === "array" || e.type === "object").at(-1);
	if (lastEmit) return [{
		messageId: "addOneOption",
		data: {
			name: nameWithLoc.name,
			emitsKind
		},
		fix(fixer) {
			if (lastEmit.type === "array") return fixer.insertTextAfter(lastEmit.node, `, '${nameWithLoc.name}'`);
			else if (lastEmit.type === "object") return fixer.insertTextAfter(lastEmit.node, `, '${nameWithLoc.name}': null`);
			else return null;
		}
	}];
	if (define.type !== "ObjectExpression") return [];
	const object = define;
	const propertyNodes = object.properties.filter(import_utils.default.isProperty);
	const emitsOption = propertyNodes.find((p) => import_utils.default.getStaticPropertyName(p) === "emits");
	if (emitsOption) {
		const sourceCode = context.sourceCode;
		const emitsOptionValue = emitsOption.value;
		if (emitsOptionValue.type === "ArrayExpression") {
			const leftBracket = sourceCode.getFirstToken(emitsOptionValue, _eslint_community_eslint_utils.isOpeningBracketToken);
			return [{
				messageId: "addOneOption",
				data: {
					name: `${nameWithLoc.name}`,
					emitsKind
				},
				fix(fixer) {
					return fixer.insertTextAfter(leftBracket, `'${nameWithLoc.name}'${emitsOptionValue.elements.length > 0 ? "," : ""}`);
				}
			}];
		} else if (emitsOptionValue.type === "ObjectExpression") {
			const leftBrace = sourceCode.getFirstToken(emitsOptionValue, _eslint_community_eslint_utils.isOpeningBraceToken);
			return [{
				messageId: "addOneOption",
				data: {
					name: `${nameWithLoc.name}`,
					emitsKind
				},
				fix(fixer) {
					return fixer.insertTextAfter(leftBrace, `'${nameWithLoc.name}': null${emitsOptionValue.properties.length > 0 ? "," : ""}`);
				}
			}];
		}
		return [];
	}
	const sourceCode = context.sourceCode;
	const afterOptionNode = propertyNodes.find((p) => FIX_EMITS_AFTER_OPTIONS.has(import_utils.default.getStaticPropertyName(p) || ""));
	return [{
		messageId: "addArrayEmitsOption",
		data: {
			name: `${nameWithLoc.name}`,
			emitsKind
		},
		fix(fixer) {
			if (afterOptionNode) return fixer.insertTextAfter(sourceCode.getTokenBefore(afterOptionNode), `\nemits: ['${nameWithLoc.name}'],`);
			const lastPropertyNode = object.properties.at(-1);
			if (lastPropertyNode) {
				const before = propertyNodes.at(-1) || lastPropertyNode;
				return fixer.insertTextAfter(before, `,\nemits: ['${nameWithLoc.name}']`);
			} else {
				const objectLeftBrace = sourceCode.getFirstToken(object, _eslint_community_eslint_utils.isOpeningBraceToken);
				const objectRightBrace = sourceCode.getLastToken(object, _eslint_community_eslint_utils.isClosingBraceToken);
				return fixer.insertTextAfter(objectLeftBrace, `\nemits: ['${nameWithLoc.name}']${objectLeftBrace.loc.end.line < objectRightBrace.loc.start.line ? "" : "\n"}`);
			}
		}
	}, {
		messageId: "addObjectEmitsOption",
		data: {
			name: `${nameWithLoc.name}`,
			emitsKind
		},
		fix(fixer) {
			if (afterOptionNode) return fixer.insertTextAfter(sourceCode.getTokenBefore(afterOptionNode), `\nemits: {'${nameWithLoc.name}': null},`);
			const lastPropertyNode = object.properties.at(-1);
			if (lastPropertyNode) {
				const before = propertyNodes.at(-1) || lastPropertyNode;
				return fixer.insertTextAfter(before, `,\nemits: {'${nameWithLoc.name}': null}`);
			} else {
				const objectLeftBrace = sourceCode.getFirstToken(object, _eslint_community_eslint_utils.isOpeningBraceToken);
				const objectRightBrace = sourceCode.getLastToken(object, _eslint_community_eslint_utils.isClosingBraceToken);
				return fixer.insertTextAfter(objectLeftBrace, `\nemits: {'${nameWithLoc.name}': null}${objectLeftBrace.loc.end.line < objectRightBrace.loc.start.line ? "" : "\n"}`);
			}
		}
	}];
}

//#endregion
exports.default = require_explicit_emits_default;