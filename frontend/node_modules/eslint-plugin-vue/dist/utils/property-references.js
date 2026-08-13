const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('./index.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/utils/property-references.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const ANY = {
	hasProperty: () => true,
	allProperties: () => /* @__PURE__ */ new Map(),
	getNest: () => ANY,
	getNestNodes: () => []
};
const NEVER = {
	hasProperty: () => false,
	allProperties: () => /* @__PURE__ */ new Map(),
	getNest: () => NEVER,
	getNestNodes: () => []
};
function findFunction(context, id) {
	const calleeVariable = import_utils.default.findVariableByIdentifier(context, id);
	if (!calleeVariable) return null;
	if (calleeVariable.defs.length === 1) {
		const def = calleeVariable.defs[0];
		if (def.node.type === "FunctionDeclaration") return def.node;
		if (def.type === "Variable" && def.parent.kind === "const" && def.node.init) {
			if (def.node.init.type === "FunctionExpression" || def.node.init.type === "ArrowFunctionExpression") return def.node.init;
			if (def.node.init.type === "Identifier") return findFunction(context, def.node.init);
		}
	}
	return null;
}
function definePropertyReferenceExtractor(context, { unknownMemberAsUnreferenced = false, returnAsUnreferenced = false } = {}) {
	const cacheForExpression = /* @__PURE__ */ new Map();
	const cacheForPattern = /* @__PURE__ */ new Map();
	const cacheForFunction = /* @__PURE__ */ new Map();
	let toRefSet = null;
	let isFunctionalTemplate = false;
	const templateBody = context.sourceCode.ast.templateBody;
	if (templateBody) isFunctionalTemplate = import_utils.default.hasAttribute(templateBody, "functional");
	function getToRefSet() {
		if (toRefSet) return toRefSet;
		const tracker = new _eslint_community_eslint_utils.ReferenceTracker(context.sourceCode.scopeManager.scopes[0]);
		const toRefNodes = /* @__PURE__ */ new Set();
		for (const { node } of import_utils.default.iterateReferencesTraceMap(tracker, {
			[_eslint_community_eslint_utils.ReferenceTracker.ESM]: true,
			toRef: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true }
		})) toRefNodes.add(node);
		const toRefsNodes = /* @__PURE__ */ new Set();
		for (const { node } of import_utils.default.iterateReferencesTraceMap(tracker, {
			[_eslint_community_eslint_utils.ReferenceTracker.ESM]: true,
			toRefs: { [_eslint_community_eslint_utils.ReferenceTracker.CALL]: true }
		})) toRefsNodes.add(node);
		return toRefSet = {
			toRefNodes,
			toRefsNodes
		};
	}
	/**
	* Collects the property references for member expr.
	*/
	class PropertyReferencesForMember {
		node;
		name;
		withInTemplate;
		constructor(node, name, withInTemplate) {
			this.node = node;
			this.name = name;
			this.withInTemplate = withInTemplate;
		}
		hasProperty(name) {
			return name === this.name;
		}
		allProperties() {
			return new Map([[this.name, { nodes: [this.node.property] }]]);
		}
		getNest(name) {
			return name === this.name ? extractFromExpression(this.node, this.withInTemplate) : NEVER;
		}
		*getNestNodes(name) {
			if (name === this.name) yield {
				type: "expression",
				node: this.node
			};
		}
	}
	/**
	* Collects the property references for object.
	*/
	class PropertyReferencesForObject {
		properties;
		constructor() {
			this.properties = Object.create(null);
		}
		hasProperty(name) {
			return Boolean(this.properties[name]);
		}
		allProperties() {
			const result = /* @__PURE__ */ new Map();
			for (const [name, nodes] of Object.entries(this.properties)) result.set(name, { nodes: nodes.map((node) => node.key) });
			return result;
		}
		getNest(name) {
			const properties = this.properties[name];
			return properties ? mergePropertyReferences(properties.map((property) => getNestFromPattern(property.value))) : NEVER;
		}
		*getNestNodes(name) {
			const properties = this.properties[name];
			if (!properties) return;
			const values = properties.map((property) => property.value);
			let node;
			while (node = values.shift()) if (node.type === "Identifier" || node.type === "MemberExpression" || node.type === "ObjectPattern" || node.type === "ArrayPattern") yield {
				type: "pattern",
				node
			};
			else if (node.type === "AssignmentPattern") values.unshift(node.left);
			return properties ? properties.map((p) => p.value) : [];
		}
	}
	function getNestFromPattern(pattern) {
		if (pattern.type === "ObjectPattern") return extractFromObjectPattern(pattern);
		if (pattern.type === "Identifier") return extractFromIdentifier(pattern);
		else if (pattern.type === "AssignmentPattern") return getNestFromPattern(pattern.left);
		return ANY;
	}
	/**
	* Extract the property references from Expression.
	*/
	function extractFromExpression(node, withInTemplate) {
		const ref = cacheForExpression.get(node);
		if (ref) return ref;
		cacheForExpression.set(node, ANY);
		const result = extractWithoutCache();
		cacheForExpression.set(node, result);
		return result;
		function extractWithoutCache() {
			const parent = node.parent;
			switch (parent.type) {
				case "AssignmentExpression": return !withInTemplate && parent.right === node && parent.operator === "=" ? extractFromPattern(parent.left) : NEVER;
				case "VariableDeclarator": return !withInTemplate && parent.init === node ? extractFromPattern(parent.id) : NEVER;
				case "MemberExpression":
					if (parent.object === node) {
						const name = import_utils.default.getStaticPropertyName(parent);
						if (name === "$props" && parent.parent.type === "MemberExpression") {
							const propName = import_utils.default.getStaticPropertyName(parent.parent);
							if (!propName) return unknownMemberAsUnreferenced ? NEVER : ANY;
							return new PropertyReferencesForMember(parent.parent, propName, withInTemplate);
						} else if (name) return new PropertyReferencesForMember(parent, name, withInTemplate);
						else return unknownMemberAsUnreferenced ? NEVER : ANY;
					}
					return NEVER;
				case "CallExpression": {
					const argIndex = parent.arguments.indexOf(node);
					return !withInTemplate && argIndex !== -1 ? extractFromCall(parent, argIndex) : NEVER;
				}
				case "ChainExpression": return extractFromExpression(parent, withInTemplate);
				case "ArrowFunctionExpression":
				case "VExpressionContainer":
				case "Property":
				case "ArrayExpression": return maybeExternalUsed(parent) ? ANY : NEVER;
				case "ReturnStatement": if (returnAsUnreferenced) return NEVER;
				else return maybeExternalUsed(parent) ? ANY : NEVER;
			}
			return NEVER;
		}
		function maybeExternalUsed(parentTarget) {
			if (parentTarget.type === "ReturnStatement" || parentTarget.type === "VExpressionContainer") return true;
			if (parentTarget.type === "ArrayExpression") return maybeExternalUsed(parentTarget.parent);
			if (parentTarget.type === "Property") return maybeExternalUsed(parentTarget.parent.parent);
			if (parentTarget.type === "ArrowFunctionExpression") return parentTarget.body === node;
			return false;
		}
	}
	/**
	* Extract the property references from one parameter of the function.
	*/
	function extractFromPattern(node) {
		const ref = cacheForPattern.get(node);
		if (ref) return ref;
		cacheForPattern.set(node, ANY);
		const result = extractWithoutCache();
		cacheForPattern.set(node, result);
		return result;
		function extractWithoutCache() {
			while (node.type === "AssignmentPattern") node = node.left;
			if (node.type === "RestElement" || node.type === "ArrayPattern") return NEVER;
			if (node.type === "ObjectPattern") return extractFromObjectPattern(node);
			if (node.type === "Identifier") return extractFromIdentifier(node);
			return NEVER;
		}
	}
	/**
	* Extract the property references from ObjectPattern.
	*/
	function extractFromObjectPattern(node) {
		const refs = new PropertyReferencesForObject();
		for (const prop of node.properties) if (prop.type === "Property") {
			const name = import_utils.default.getStaticPropertyName(prop);
			if (name) (refs.properties[name] || (refs.properties[name] = [])).push(prop);
			else return ANY;
		} else return ANY;
		return refs;
	}
	/**
	* Extract the property references from id.
	*/
	function extractFromIdentifier(node) {
		const variable = import_utils.default.findVariableByIdentifier(context, node);
		if (!variable) return NEVER;
		return mergePropertyReferences(variable.references.map((reference) => {
			const id = reference.identifier;
			return extractFromExpression(id, false);
		}));
	}
	/**
	* Extract the property references from call.
	*/
	function extractFromCall(node, argIndex) {
		if (node.callee.type !== "Identifier") return {
			hasProperty(_name, options) {
				return Boolean(options && options.unknownCallAsAny);
			},
			allProperties: () => /* @__PURE__ */ new Map(),
			getNest: () => ANY,
			getNestNodes: () => []
		};
		const fnNode = findFunction(context, node.callee);
		if (!fnNode) {
			if (argIndex === 0) {
				if (getToRefSet().toRefNodes.has(node)) return extractFromToRef(node);
				else if (getToRefSet().toRefsNodes.has(node)) return extractFromToRefs(node);
			}
			return {
				hasProperty(_name, options) {
					return Boolean(options && options.unknownCallAsAny);
				},
				allProperties: () => /* @__PURE__ */ new Map(),
				getNest: () => ANY,
				getNestNodes: () => []
			};
		}
		return extractFromFunctionParam(fnNode, argIndex);
	}
	/**
	* Extract the property references from function param.
	*/
	function extractFromFunctionParam(node, argIndex) {
		let cacheForIndexes = cacheForFunction.get(node);
		if (!cacheForIndexes) {
			cacheForIndexes = /* @__PURE__ */ new Map();
			cacheForFunction.set(node, cacheForIndexes);
		}
		const ref = cacheForIndexes.get(argIndex);
		if (ref) return ref;
		cacheForIndexes.set(argIndex, NEVER);
		const arg = node.params[argIndex];
		if (!arg) return NEVER;
		const result = extractFromPattern(arg);
		cacheForIndexes.set(argIndex, result);
		return result;
	}
	/**
	* Extract the property references from path.
	*/
	function extractFromPath(pathString, node) {
		return extractFromSegments(pathString.split("."));
		function extractFromSegments(segments) {
			if (segments.length === 0) return ANY;
			const segmentName = segments[0];
			return {
				hasProperty: (name) => name === segmentName,
				allProperties: () => new Map([[segmentName, { nodes: [node] }]]),
				getNest: (name) => name === segmentName ? extractFromSegments(segments.slice(1)) : NEVER,
				getNestNodes: () => []
			};
		}
	}
	/**
	* Extract the property references from name literal.
	*/
	function extractFromNameLiteral(node) {
		const referenceName = node.type === "Literal" || node.type === "TemplateLiteral" ? import_utils.default.getStringLiteralValue(node) : null;
		return referenceName ? {
			hasProperty: (name) => name === referenceName,
			allProperties: () => new Map([[referenceName, { nodes: [node] }]]),
			getNest: (name) => name === referenceName ? ANY : NEVER,
			getNestNodes: () => []
		} : NEVER;
	}
	/**
	* Extract the property references from name.
	*/
	function extractFromName(referenceName, nameNode, getNest) {
		return {
			hasProperty: (name) => name === referenceName,
			allProperties: () => new Map([[referenceName, { nodes: [nameNode] }]]),
			getNest: (name) => name === referenceName ? getNest ? getNest() : ANY : NEVER,
			getNestNodes: () => []
		};
	}
	/**
	* Extract the property references from toRef call.
	*/
	function extractFromToRef(node) {
		const nameNode = node.arguments[1];
		const refName = nameNode && (nameNode.type === "Literal" || nameNode.type === "TemplateLiteral") ? import_utils.default.getStringLiteralValue(nameNode) : null;
		if (!refName) return ANY;
		return extractFromName(refName, nameNode, () => extractFromExpression(node, false).getNest("value"));
	}
	/**
	* Extract the property references from toRefs call.
	*/
	function extractFromToRefs(node) {
		const base = extractFromExpression(node, false);
		return {
			hasProperty: (name, option) => base.hasProperty(name, option),
			allProperties: () => base.allProperties(),
			getNest: (name) => base.getNest(name).getNest("value"),
			getNestNodes: (name) => base.getNest(name).getNestNodes("value")
		};
	}
	/**
	* Extract the property references from VExpressionContainer.
	*/
	function extractFromVExpressionContainer(node, options) {
		const ignoreGlobals = options && options.ignoreGlobals;
		let ignoreRef = () => false;
		if (ignoreGlobals) {
			const globalScope = context.sourceCode.scopeManager.globalScope || context.sourceCode.scopeManager.scopes[0];
			ignoreRef = (name) => globalScope.set.has(name);
		}
		const references = [];
		for (const id of node.references.filter((ref) => ref.variable == null).map((ref) => ref.id)) {
			if (ignoreRef(id.name)) continue;
			if (isFunctionalTemplate) {
				if (id.name === "props") references.push(extractFromExpression(id, true));
			} else {
				const referenceId = id.name === "$props" && id.parent.type === "MemberExpression" && id.parent.property.type === "Identifier" ? id.parent.property : id;
				references.push(extractFromName(referenceId.name, referenceId, () => extractFromExpression(referenceId, true)));
			}
		}
		return mergePropertyReferences(references);
	}
	/**
	* Extract the property references from StyleVariablesContext.
	*/
	function extractFromStyleVariablesContext(ctx) {
		const references = [];
		for (const { id } of ctx.references) references.push(extractFromName(id.name, id, () => extractFromExpression(id, true)));
		return mergePropertyReferences(references);
	}
	return {
		extractFromExpression,
		extractFromPattern,
		extractFromFunctionParam,
		extractFromPath,
		extractFromName,
		extractFromNameLiteral,
		extractFromVExpressionContainer,
		extractFromStyleVariablesContext
	};
}
function mergePropertyReferences(references) {
	if (references.length === 0) return NEVER;
	if (references.length === 1) return references[0];
	return new PropertyReferencesForMerge(references);
}
/**
* Collects the property references for merge.
*/
var PropertyReferencesForMerge = class {
	references;
	constructor(references) {
		this.references = references;
	}
	hasProperty(name, option) {
		return this.references.some((ref) => ref.hasProperty(name, option));
	}
	allProperties() {
		const result = /* @__PURE__ */ new Map();
		for (const reference of this.references) for (const [name, { nodes }] of reference.allProperties()) {
			const r = result.get(name);
			if (r) r.nodes = [...new Set([...r.nodes, ...nodes])];
			else result.set(name, { nodes: [...nodes] });
		}
		return result;
	}
	getNest(name) {
		const nest = [];
		for (const ref of this.references) if (ref.hasProperty(name)) nest.push(ref.getNest(name));
		return mergePropertyReferences(nest);
	}
	*getNestNodes(name) {
		for (const ref of this.references) if (ref.hasProperty(name)) yield* ref.getNestNodes(name);
	}
};

//#endregion
exports.definePropertyReferenceExtractor = definePropertyReferenceExtractor;
exports.mergePropertyReferences = mergePropertyReferences;