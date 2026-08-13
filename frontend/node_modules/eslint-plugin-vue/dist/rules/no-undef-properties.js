const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');
const require_index$1 = require('../utils/style-variables/index.js');
const require_property_references = require('../utils/property-references.js');
const require_vue_reserved$1 = require('../utils/vue-reserved.js');

//#region lib/rules/no-undef-properties.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var import_vue_reserved = /* @__PURE__ */ require_runtime.__toESM(require_vue_reserved$1.default);
const GROUP_PROPERTY = "props";
const GROUP_ASYNC_DATA = "asyncData";
const GROUP_DATA = "data";
const GROUP_COMPUTED_PROPERTY = "computed";
const GROUP_METHODS = "methods";
const GROUP_SETUP = "setup";
const GROUP_WATCHER = "watch";
const GROUP_EXPOSE = "expose";
const GROUP_INJECT = "inject";
function getObjectPropertyMap(object) {
	const props = /* @__PURE__ */ new Map();
	for (const p of object.properties) {
		if (p.type !== "Property") return null;
		const name = import_utils.default.getStaticPropertyName(p);
		if (name == null) return null;
		props.set(name, p);
	}
	return props;
}
function getPropertyDataFromObjectProperty(property) {
	if (property == null) return null;
	const propertyMap = property.value.type === "ObjectExpression" ? getObjectPropertyMap(property.value) : null;
	return {
		hasNestProperty: Boolean(propertyMap),
		get(name) {
			if (!propertyMap) return null;
			return getPropertyDataFromObjectProperty(propertyMap.get(name));
		}
	};
}
var no_undef_properties_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow undefined properties",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-undef-properties.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { ignores: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true
			} },
			additionalProperties: false
		}],
		messages: {
			undef: "'{{name}}' is not defined.",
			undefProps: "'{{name}}' is not defined in props."
		}
	},
	create(context) {
		const { ignores = [String.raw`/^\$/`] } = context.options[0] || {};
		const isIgnored = require_regexp.toRegExpGroupMatcher(ignores);
		const propertyReferenceExtractor = require_property_references.definePropertyReferenceExtractor(context);
		const programNode = context.sourceCode.ast;
		/**
		* Property names identified as defined via a Vuex or Pinia helpers
		*/
		const propertiesDefinedByStoreHelpers = /* @__PURE__ */ new Set();
		function isScriptSetupProgram(node) {
			return node === programNode;
		}
		/** Vue component context */
		class VueComponentContext {
			defineProperties = /* @__PURE__ */ new Map();
			reported = /* @__PURE__ */ new Set();
			hasUnknownProperty = false;
			/**
			* Report
			*/
			verifyReferences(references, options) {
				if (this.hasUnknownProperty) return;
				const report = this.report.bind(this);
				verifyUndefProperties(this.defineProperties, references, null);
				function verifyUndefProperties(defineProperties, references, pathName) {
					if (!references) return;
					for (const [refName, { nodes }] of references.allProperties()) {
						const referencePathName = pathName ? `${pathName}.${refName}` : refName;
						const prop = defineProperties.get && defineProperties.get(refName);
						if (prop) {
							if (options && options.props && !prop.isProps) {
								report(nodes[0], referencePathName, "undefProps");
								continue;
							}
						} else {
							report(nodes[0], referencePathName, "undef");
							continue;
						}
						if (prop.hasNestProperty) verifyUndefProperties(prop, references.getNest(refName), referencePathName);
					}
				}
			}
			/**
			* Report
			*/
			report(node, name, messageId = "undef") {
				if (import_vue_reserved.default.includes(name) || isIgnored(name) || propertiesDefinedByStoreHelpers.has(name)) return;
				if (this.reported.has(node) || this.reported.has(name)) return;
				this.reported.add(node);
				this.reported.add(name);
				context.report({
					node,
					messageId,
					data: { name }
				});
			}
			markAsHasUnknownProperty() {
				this.hasUnknownProperty = true;
			}
		}
		const vueComponentContextMap = /* @__PURE__ */ new Map();
		function getVueComponentContext(node) {
			let ctx = vueComponentContextMap.get(node);
			if (!ctx) {
				ctx = new VueComponentContext();
				vueComponentContextMap.set(node, ctx);
			}
			return ctx;
		}
		function getVueComponentContextForTemplate() {
			const keys = [...vueComponentContextMap.keys()];
			const exported = keys.find(isScriptSetupProgram) || keys.find(import_utils.default.isInExportDefault);
			return exported && vueComponentContextMap.get(exported);
		}
		function getParentProperty(node) {
			if (!node.parent || node.parent.type !== "Property" || node.parent.value !== node) return null;
			const property = node.parent;
			if (!import_utils.default.isProperty(property)) return null;
			return property;
		}
		const scriptVisitor = import_utils.default.compositingVisitors({ Program() {
			if (!import_utils.default.isScriptSetup(context)) return;
			const ctx = getVueComponentContext(programNode);
			const globalScope = context.sourceCode.scopeManager.globalScope;
			if (globalScope) {
				for (const variable of globalScope.variables) ctx.defineProperties.set(variable.name, {});
				const moduleScope = globalScope.childScopes.find((scope) => scope.type === "module");
				for (const variable of moduleScope && moduleScope.variables || []) ctx.defineProperties.set(variable.name, {});
			}
		} }, import_utils.default.defineScriptSetupVisitor(context, {
			onDefinePropsEnter(node, props) {
				const ctx = getVueComponentContext(programNode);
				for (const prop of props) {
					if (prop.type === "unknown") {
						ctx.markAsHasUnknownProperty();
						return;
					}
					if (!prop.propName) continue;
					ctx.defineProperties.set(prop.propName, { isProps: true });
				}
				let target = node;
				if (target.parent && target.parent.type === "CallExpression" && target.parent.arguments[0] === target && target.parent.callee.type === "Identifier" && target.parent.callee.name === "withDefaults") target = target.parent;
				if (!target.parent || target.parent.type !== "VariableDeclarator" || target.parent.init !== target) return;
				const pattern = target.parent.id;
				const propertyReferences = propertyReferenceExtractor.extractFromPattern(pattern);
				ctx.verifyReferences(propertyReferences);
			},
			onDefineModelEnter(_node, model) {
				getVueComponentContext(programNode).defineProperties.set(model.name.modelName, { isProps: true });
			}
		}), import_utils.default.defineVueVisitor(context, {
			CallExpression(node) {
				if (node.callee.type !== "Identifier") return;
				let groupName = null;
				if (/^mapMutations|mapActions$/u.test(node.callee.name)) groupName = GROUP_METHODS;
				else if (/^mapState|mapGetters|mapWritableState$/u.test(node.callee.name)) groupName = GROUP_COMPUTED_PROPERTY;
				if (!groupName || node.arguments.length === 0) return;
				const arg = node.arguments.length === 2 ? node.arguments[1] : node.arguments[0];
				if (arg.type === "ObjectExpression") for (const prop of arg.properties) {
					const name = prop.type === "SpreadElement" ? null : import_utils.default.getStaticPropertyName(prop);
					if (name) propertiesDefinedByStoreHelpers.add(name);
				}
				else if (arg.type === "ArrayExpression") for (const element of arg.elements) {
					if (!element || !import_utils.default.isStringLiteral(element)) continue;
					const name = import_utils.default.getStringLiteralValue(element);
					if (name) propertiesDefinedByStoreHelpers.add(name);
				}
			},
			onVueObjectEnter(node) {
				const ctx = getVueComponentContext(node);
				for (const prop of import_utils.default.iterateProperties(node, new Set([
					GROUP_PROPERTY,
					GROUP_ASYNC_DATA,
					GROUP_DATA,
					GROUP_COMPUTED_PROPERTY,
					GROUP_SETUP,
					GROUP_METHODS,
					GROUP_INJECT
				]))) {
					const propertyMap = (prop.groupName === GROUP_DATA || prop.groupName === GROUP_ASYNC_DATA) && prop.type === "object" && prop.property.value.type === "ObjectExpression" ? getObjectPropertyMap(prop.property.value) : null;
					ctx.defineProperties.set(prop.name, {
						hasNestProperty: Boolean(propertyMap),
						isProps: prop.groupName === GROUP_PROPERTY,
						get(name) {
							if (!propertyMap) return null;
							return getPropertyDataFromObjectProperty(propertyMap.get(name));
						}
					});
				}
				for (const watcherOrExpose of import_utils.default.iterateProperties(node, new Set([GROUP_WATCHER, GROUP_EXPOSE]))) if (watcherOrExpose.groupName === GROUP_WATCHER) {
					const watcher = watcherOrExpose;
					ctx.verifyReferences(propertyReferenceExtractor.extractFromPath(watcher.name, watcher.node));
					if (watcher.type === "object") {
						const property = watcher.property;
						if (property.kind === "init") for (const handlerValueNode of import_utils.default.iterateWatchHandlerValues(property)) ctx.verifyReferences(propertyReferenceExtractor.extractFromNameLiteral(handlerValueNode));
					}
				} else if (watcherOrExpose.groupName === GROUP_EXPOSE) {
					const expose = watcherOrExpose;
					ctx.verifyReferences(propertyReferenceExtractor.extractFromName(expose.name, expose.node));
				}
			},
			"ObjectExpression > Property > :function[params.length>0]"(node, vueData) {
				let props = false;
				const property = getParentProperty(node);
				if (!property) return;
				if (property.parent === vueData.node) {
					if (import_utils.default.getStaticPropertyName(property) !== "data") return;
					props = true;
				} else {
					const parentProperty = getParentProperty(property.parent);
					if (!parentProperty) return;
					if (parentProperty.parent === vueData.node) {
						if (import_utils.default.getStaticPropertyName(parentProperty) !== "computed") return;
					} else {
						const parentParentProperty = getParentProperty(parentProperty.parent);
						if (!parentParentProperty) return;
						if (parentParentProperty.parent === vueData.node) {
							if (import_utils.default.getStaticPropertyName(parentParentProperty) !== "computed" || import_utils.default.getStaticPropertyName(property) !== "get") return;
						} else return;
					}
				}
				const propertyReferences = propertyReferenceExtractor.extractFromFunctionParam(node, 0);
				getVueComponentContext(vueData.node).verifyReferences(propertyReferences, { props });
			},
			onSetupFunctionEnter(node, vueData) {
				const propertyReferences = propertyReferenceExtractor.extractFromFunctionParam(node, 0);
				getVueComponentContext(vueData.node).verifyReferences(propertyReferences, { props: true });
			},
			onRenderFunctionEnter(node, vueData) {
				const ctx = getVueComponentContext(vueData.node);
				const propertyReferences = propertyReferenceExtractor.extractFromFunctionParam(node, 0);
				ctx.verifyReferences(propertyReferences);
				if (vueData.functional) {
					const propertyReferencesForV2 = propertyReferenceExtractor.extractFromFunctionParam(node, 1);
					ctx.verifyReferences(propertyReferencesForV2.getNest("props"), { props: true });
				}
			},
			"ThisExpression, Identifier"(node, vueData) {
				if (!import_utils.default.isThis(node, context)) return;
				const ctx = getVueComponentContext(vueData.node);
				const propertyReferences = propertyReferenceExtractor.extractFromExpression(node, false);
				ctx.verifyReferences(propertyReferences);
			}
		}), { "Program:exit"() {
			const ctx = getVueComponentContextForTemplate();
			if (!ctx) return;
			const styleVars = require_index$1.getStyleVariablesContext(context);
			if (styleVars) ctx.verifyReferences(propertyReferenceExtractor.extractFromStyleVariablesContext(styleVars));
		} });
		return import_utils.default.defineTemplateBodyVisitor(context, { VExpressionContainer(node) {
			const ctx = getVueComponentContextForTemplate();
			if (!ctx) return;
			ctx.verifyReferences(propertyReferenceExtractor.extractFromVExpressionContainer(node, { ignoreGlobals: true }));
		} }, scriptVisitor);
	}
};

//#endregion
exports.default = no_undef_properties_default;