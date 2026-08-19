const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('./index.js');
const require_property_references = require('./property-references.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/utils/ref-object-references.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const REF_MACROS = [
	"$ref",
	"$computed",
	"$shallowRef",
	"$customRef",
	"$toRef",
	"$"
];
const cacheForRefObjectReferences = /* @__PURE__ */ new WeakMap();
const cacheForReactiveVariableReferences = /* @__PURE__ */ new WeakMap();
/**
* Iterate the call expressions that define the ref object.
*/
function* iterateDefineRefs(globalScope) {
	const tracker = new _eslint_community_eslint_utils.ReferenceTracker(globalScope);
	for (const { node, path } of import_utils.default.iterateReferencesTraceMap(tracker, {
		ref: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true },
		computed: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true },
		toRef: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true },
		customRef: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true },
		shallowRef: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true },
		toRefs: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true }
	})) yield {
		node,
		name: path.at(-1)
	};
}
/**
* Iterate the call expressions that defineModel() macro.
*/
function* iterateDefineModels(globalScope) {
	for (const { identifier } of iterateMacroReferences()) if (identifier.parent.type === "CallExpression" && identifier.parent.callee === identifier) yield { node: identifier.parent };
	/**
	* Iterate macro reference.
	*/
	function* iterateMacroReferences() {
		const variable = globalScope.set.get("defineModel");
		if (variable && variable.defs.length === 0) yield* variable.references;
		for (const ref of globalScope.through) if (ref.identifier.name === "defineModel") yield ref;
	}
}
/**
* Iterate the call expressions that define the reactive variables.
*/
function* iterateDefineReactiveVariables(globalScope) {
	for (const { identifier } of iterateRefMacroReferences()) if (identifier.parent.type === "CallExpression" && identifier.parent.callee === identifier) yield {
		node: identifier.parent,
		name: identifier.name
	};
	/**
	* Iterate ref macro reference.
	*/
	function* iterateRefMacroReferences() {
		yield* REF_MACROS.map((m) => globalScope.set.get(m)).filter(import_utils.default.isDef).flatMap((v) => v.references);
		for (const ref of globalScope.through) if (REF_MACROS.includes(ref.identifier.name)) yield ref;
	}
}
/**
*  Iterate the call expressions that the escape hint values.
*/
function* iterateEscapeHintValueRefs(globalScope) {
	for (const { identifier } of iterateEscapeHintReferences()) if (identifier.parent.type === "CallExpression" && identifier.parent.callee === identifier) yield identifier.parent;
	/**
	* Iterate escape hint reference.
	*/
	function* iterateEscapeHintReferences() {
		const escapeHint = globalScope.set.get("$$");
		if (escapeHint) yield* escapeHint.references;
		for (const ref of globalScope.through) if (ref.identifier.name === "$$") yield ref;
	}
}
/**
* Extract identifier from given pattern node.
*/
function* extractIdentifier(node) {
	switch (node.type) {
		case "Identifier":
			yield node;
			break;
		case "ObjectPattern":
			for (const property of node.properties) if (property.type === "Property") yield* extractIdentifier(property.value);
			else if (property.type === "RestElement") yield* extractIdentifier(property);
			break;
		case "ArrayPattern":
			for (const element of node.elements) if (element) yield* extractIdentifier(element);
			break;
		case "AssignmentPattern":
			yield* extractIdentifier(node.left);
			break;
		case "RestElement":
			yield* extractIdentifier(node.argument);
			break;
		case "MemberExpression": break;
	}
}
/**
* Iterate references of the given identifier.
*/
function* iterateIdentifierReferences(id, globalScope) {
	const variable = (0, _eslint_community_eslint_utils.findVariable)(globalScope, id);
	if (!variable) return;
	for (const reference of variable.references) yield reference;
}
function getGlobalScope(context) {
	const sourceCode = context.sourceCode;
	return sourceCode.scopeManager.globalScope || sourceCode.scopeManager.scopes[0];
}
var RefObjectReferenceExtractor = class {
	context;
	references = /* @__PURE__ */ new Map();
	_processedIds = /* @__PURE__ */ new Set();
	constructor(context) {
		this.context = context;
	}
	get(node) {
		return this.references.get(node) || null;
	}
	processDefineRef(node, method) {
		const parent = node.parent;
		let pattern = null;
		if (parent.type === "VariableDeclarator") pattern = parent.id;
		else if (parent.type === "AssignmentExpression" && parent.operator === "=") pattern = parent.left;
		else {
			if (method !== "toRefs") this.references.set(node, {
				type: "expression",
				node,
				method,
				define: node,
				defineChain: [node]
			});
			return;
		}
		const ctx = {
			method,
			define: node,
			defineChain: [node]
		};
		if (method === "toRefs") {
			const propertyReferences = require_property_references.definePropertyReferenceExtractor(this.context).extractFromPattern(pattern);
			for (const name of propertyReferences.allProperties().keys()) for (const nest of propertyReferences.getNestNodes(name)) if (nest.type === "expression") this.processMemberExpression(nest.node, ctx);
			else if (nest.type === "pattern") this.processPattern(nest.node, ctx);
		} else this.processPattern(pattern, ctx);
	}
	processDefineModel(node) {
		const parent = node.parent;
		let pattern = null;
		if (parent.type === "VariableDeclarator") pattern = parent.id;
		else if (parent.type === "AssignmentExpression" && parent.operator === "=") pattern = parent.left;
		else return;
		const ctx = {
			method: "defineModel",
			define: node,
			defineChain: [node]
		};
		if (pattern.type === "ArrayPattern" && pattern.elements[0]) pattern = pattern.elements[0];
		this.processPattern(pattern, ctx);
	}
	processExpression(node, ctx) {
		const parent = node.parent;
		if (parent.type === "AssignmentExpression") {
			if (parent.operator === "=" && parent.right === node) {
				this.processPattern(parent.left, {
					...ctx,
					defineChain: [node, ...ctx.defineChain]
				});
				return true;
			}
		} else if (parent.type === "VariableDeclarator" && parent.init === node) {
			this.processPattern(parent.id, {
				...ctx,
				defineChain: [node, ...ctx.defineChain]
			});
			return true;
		}
		return false;
	}
	processMemberExpression(node, ctx) {
		if (this.processExpression(node, ctx)) return;
		this.references.set(node, {
			type: "expression",
			node,
			...ctx
		});
	}
	processPattern(node, ctx) {
		switch (node.type) {
			case "Identifier":
				this.processIdentifierPattern(node, ctx);
				break;
			case "ArrayPattern":
			case "RestElement":
			case "MemberExpression": return;
			case "ObjectPattern":
				this.references.set(node, {
					type: "pattern",
					node,
					...ctx
				});
				return;
			case "AssignmentPattern":
				this.processPattern(node.left, ctx);
				return;
		}
	}
	processIdentifierPattern(node, ctx) {
		if (this._processedIds.has(node)) return;
		this._processedIds.add(node);
		for (const reference of iterateIdentifierReferences(node, getGlobalScope(this.context))) {
			const def = reference.resolved && reference.resolved.defs.length === 1 && reference.resolved.defs[0].type === "Variable" ? reference.resolved.defs[0] : null;
			if (def && def.name === reference.identifier) continue;
			if (reference.isRead() && this.processExpression(reference.identifier, ctx)) continue;
			this.references.set(reference.identifier, {
				type: reference.isWrite() ? "pattern" : "expression",
				node: reference.identifier,
				variableDeclarator: def ? def.node : null,
				variableDeclaration: def ? def.parent : null,
				...ctx
			});
		}
	}
};
/**
* Extracts references of all ref objects.
* @param context The rule context.
*/
function extractRefObjectReferences(context) {
	const sourceCode = context.sourceCode;
	const cachedReferences = cacheForRefObjectReferences.get(sourceCode.ast);
	if (cachedReferences) return cachedReferences;
	const references = new RefObjectReferenceExtractor(context);
	const globalScope = getGlobalScope(context);
	for (const { node, name } of iterateDefineRefs(globalScope)) references.processDefineRef(node, name);
	for (const { node } of iterateDefineModels(globalScope)) references.processDefineModel(node);
	cacheForRefObjectReferences.set(sourceCode.ast, references);
	return references;
}
var ReactiveVariableReferenceExtractor = class {
	context;
	references;
	_processedIds;
	_escapeHintValueRefs;
	constructor(context) {
		this.context = context;
		this.references = /* @__PURE__ */ new Map();
		this._processedIds = /* @__PURE__ */ new Set();
		this._escapeHintValueRefs = new Set(iterateEscapeHintValueRefs(getGlobalScope(context)));
	}
	get(node) {
		return this.references.get(node) || null;
	}
	processDefineReactiveVariable(node, method) {
		const parent = node.parent;
		if (parent.type !== "VariableDeclarator") return;
		const pattern = parent.id;
		if (method === "$") for (const id of extractIdentifier(pattern)) this.processIdentifierPattern(id, method, node);
		else if (pattern.type === "Identifier") this.processIdentifierPattern(pattern, method, node);
	}
	processIdentifierPattern(node, method, define) {
		if (this._processedIds.has(node)) return;
		this._processedIds.add(node);
		for (const reference of iterateIdentifierReferences(node, getGlobalScope(this.context))) {
			const def = reference.resolved && reference.resolved.defs.length === 1 && reference.resolved.defs[0].type === "Variable" ? reference.resolved.defs[0] : null;
			if (!def || def.name === reference.identifier) continue;
			this.references.set(reference.identifier, {
				node: reference.identifier,
				escape: this.withinEscapeHint(reference.identifier),
				method,
				define,
				variableDeclaration: def.parent
			});
		}
	}
	/**
	* Checks whether the given identifier node within the escape hints (`$$()`) or not.
	*/
	withinEscapeHint(node) {
		let target = node;
		let parent = target.parent;
		while (parent) {
			if (parent.type === "CallExpression") {
				if (parent.arguments.includes(target) && this._escapeHintValueRefs.has(parent)) return true;
				return false;
			}
			if (parent.type === "Property" && parent.value === target || parent.type === "ObjectExpression" && parent.properties.includes(target) || parent.type === "ArrayExpression" || parent.type === "SpreadElement") {
				target = parent;
				parent = target.parent;
			} else return false;
		}
		return false;
	}
};
/**
* Extracts references of all reactive variables.
*/
function extractReactiveVariableReferences(context) {
	const sourceCode = context.sourceCode;
	const cachedReferences = cacheForReactiveVariableReferences.get(sourceCode.ast);
	if (cachedReferences) return cachedReferences;
	const references = new ReactiveVariableReferenceExtractor(context);
	for (const { node, name } of iterateDefineReactiveVariables(getGlobalScope(context))) references.processDefineReactiveVariable(node, name);
	cacheForReactiveVariableReferences.set(sourceCode.ast, references);
	return references;
}

//#endregion
exports.extractReactiveVariableReferences = extractReactiveVariableReferences;
exports.extractRefObjectReferences = extractRefObjectReferences;
exports.iterateDefineRefs = iterateDefineRefs;