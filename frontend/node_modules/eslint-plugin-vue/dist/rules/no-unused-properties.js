const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_index$1 = require('../utils/style-variables/index.js');
const require_property_references = require('../utils/property-references.js');
const require_comments = require('../utils/comments.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");
_eslint_community_eslint_utils = require_runtime.__toESM(_eslint_community_eslint_utils);

//#region lib/rules/no-unused-properties.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const GROUP_PROPERTY = "props";
const GROUP_DATA = "data";
const GROUP_ASYNC_DATA = "asyncData";
const GROUP_COMPUTED_PROPERTY = "computed";
const GROUP_METHODS = "methods";
const GROUP_SETUP = "setup";
const GROUP_WATCHER = "watch";
const GROUP_EXPOSE = "expose";
const GROUP_INJECT = "inject";
const UNREFERENCED_UNKNOWN_MEMBER = "unknownMemberAsUnreferenced";
const UNREFERENCED_RETURN = "returnAsUnreferenced";
const PROPERTY_LABEL = {
	props: "property",
	data: "data",
	asyncData: "async data",
	computed: "computed property",
	methods: "method",
	setup: "property returned from `setup()`",
	inject: "inject",
	watch: "watch",
	provide: "provide",
	expose: "expose"
};
function findExpression(context, id) {
	const variable = import_utils.default.findVariableByIdentifier(context, id);
	if (!variable) return id;
	if (variable.defs.length === 1) {
		const def = variable.defs[0];
		if (def.type === "Variable" && def.parent.kind === "const" && def.node.init) {
			if (def.node.init.type === "Identifier") return findExpression(context, def.node.init);
			return def.node.init;
		}
	}
	return id;
}
/**
* Check if the given component property is marked as `@public` in JSDoc comments.
*/
function isPublicMember(property, sourceCode) {
	if (property.type === "object" && property.groupName !== "props") return isPublicProperty(property.property, sourceCode);
	return false;
}
/**
* Check if the given property node is marked as `@public` in JSDoc comments.
*/
function isPublicProperty(node, sourceCode) {
	const jsdoc = getJSDocFromProperty(node, sourceCode);
	if (jsdoc) return /(?:^|\s|\*)@public\b/u.test(jsdoc.value);
	return false;
}
/**
* Get the JSDoc comment for a given property node.
*/
function getJSDocFromProperty(node, sourceCode) {
	const jsdoc = findJSDocComment(node, sourceCode);
	if (jsdoc) return jsdoc;
	if (node.value.type === "FunctionExpression" || node.value.type === "ArrowFunctionExpression") return findJSDocComment(node.value, sourceCode);
	return null;
}
/**
* Finds a JSDoc comment for the given node.
*/
function findJSDocComment(node, sourceCode) {
	let currentNode = node;
	let tokenBefore = null;
	while (currentNode) {
		tokenBefore = sourceCode.getTokenBefore(currentNode, { includeComments: true });
		if (!tokenBefore || !_eslint_community_eslint_utils.default.isCommentToken(tokenBefore)) return null;
		if (tokenBefore.type === "Line") {
			currentNode = tokenBefore;
			continue;
		}
		break;
	}
	if (tokenBefore && require_comments.isJSDocComment(tokenBefore)) return tokenBefore;
	return null;
}
var no_unused_properties_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow unused properties",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-unused-properties.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: {
				groups: {
					type: "array",
					items: { enum: [
						GROUP_PROPERTY,
						GROUP_DATA,
						GROUP_ASYNC_DATA,
						GROUP_COMPUTED_PROPERTY,
						GROUP_METHODS,
						GROUP_SETUP,
						GROUP_INJECT
					] },
					additionalItems: false,
					uniqueItems: true
				},
				deepData: { type: "boolean" },
				ignorePublicMembers: { type: "boolean" },
				unreferencedOptions: {
					type: "array",
					items: { enum: [UNREFERENCED_UNKNOWN_MEMBER, UNREFERENCED_RETURN] },
					additionalItems: false,
					uniqueItems: true
				}
			},
			additionalProperties: false
		}],
		messages: { unused: "'{{name}}' of {{group}} found, but never used." }
	},
	create(context) {
		const options = context.options[0] || {};
		const groups = new Set(options.groups || [GROUP_PROPERTY]);
		const deepData = Boolean(options.deepData);
		const ignorePublicMembers = Boolean(options.ignorePublicMembers);
		const unreferencedOptions = new Set(options.unreferencedOptions || []);
		let propsReferencePattern = null;
		const propertyReferenceExtractor = require_property_references.definePropertyReferenceExtractor(context, {
			unknownMemberAsUnreferenced: unreferencedOptions.has(UNREFERENCED_UNKNOWN_MEMBER),
			returnAsUnreferenced: unreferencedOptions.has(UNREFERENCED_RETURN)
		});
		const templatePropertiesContainer = {
			propertyReferences: [],
			refNames: /* @__PURE__ */ new Set()
		};
		const vueComponentPropertiesContainerMap = /* @__PURE__ */ new Map();
		function getVueComponentPropertiesContainer(node) {
			let container = vueComponentPropertiesContainerMap.get(node);
			if (!container) {
				container = {
					properties: [],
					propertyReferences: [],
					propertyReferencesForProps: []
				};
				vueComponentPropertiesContainerMap.set(node, container);
			}
			return container;
		}
		function verifyDataOptionDeepProperties(segments, propertyValue, propertyReferences) {
			let targetExpr = propertyValue;
			if (targetExpr.type === "Identifier") targetExpr = findExpression(context, targetExpr);
			if (targetExpr.type === "ObjectExpression") for (const prop of targetExpr.properties) {
				if (prop.type !== "Property") continue;
				const name = import_utils.default.getStaticPropertyName(prop);
				if (name == null) continue;
				if (!propertyReferences.hasProperty(name, { unknownCallAsAny: true })) {
					context.report({
						node: prop.key,
						messageId: "unused",
						data: {
							group: PROPERTY_LABEL.data,
							name: [...segments, name].join(".")
						}
					});
					continue;
				}
				verifyDataOptionDeepProperties([...segments, name], prop.value, propertyReferences.getNest(name));
			}
		}
		/**
		* Report all unused properties.
		*/
		function reportUnusedProperties() {
			for (const container of vueComponentPropertiesContainerMap.values()) {
				const propertyReferences = require_property_references.mergePropertyReferences([...container.propertyReferences, ...templatePropertiesContainer.propertyReferences]);
				const propertyReferencesForProps = require_property_references.mergePropertyReferences(container.propertyReferencesForProps);
				for (const property of container.properties) {
					if (property.groupName === "props" && propertyReferencesForProps.hasProperty(property.name) || propertyReferences.hasProperty("$props")) continue;
					if (property.groupName === "setup" && templatePropertiesContainer.refNames.has(property.name)) continue;
					if (ignorePublicMembers && isPublicMember(property, context.sourceCode)) continue;
					if (propertyReferences.hasProperty(property.name)) {
						if (deepData && (property.groupName === "data" || property.groupName === "asyncData") && property.type === "object") verifyDataOptionDeepProperties([property.name], property.property.value, propertyReferences.getNest(property.name));
						continue;
					}
					context.report({
						node: property.node,
						messageId: "unused",
						data: {
							group: PROPERTY_LABEL[property.groupName],
							name: property.name
						}
					});
				}
			}
		}
		function getParentProperty(node) {
			if (!node.parent || node.parent.type !== "Property" || node.parent.value !== node) return null;
			const property = node.parent;
			if (!import_utils.default.isProperty(property)) return null;
			return property;
		}
		const scriptVisitor = import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, {
			onDefinePropsEnter(node, props) {
				if (!groups.has("props")) return;
				const container = getVueComponentPropertiesContainer(context.sourceCode.ast);
				for (const prop of props) {
					if (!prop.propName) continue;
					if (prop.type === "object") container.properties.push({
						type: prop.type,
						name: prop.propName,
						groupName: "props",
						node: prop.key,
						property: prop.node
					});
					else container.properties.push({
						type: prop.type,
						name: prop.propName,
						groupName: "props",
						node: prop.type === "infer-type" ? prop.node : prop.key
					});
				}
				let target = node;
				if (target.parent && target.parent.type === "CallExpression" && target.parent.arguments[0] === target && target.parent.callee.type === "Identifier" && target.parent.callee.name === "withDefaults") target = target.parent;
				if (!target.parent || target.parent.type !== "VariableDeclarator" || target.parent.init !== target) return;
				propsReferencePattern = target.parent.id;
				const propertyReferences = propertyReferenceExtractor.extractFromPattern(propsReferencePattern);
				container.propertyReferencesForProps.push(propertyReferences);
			},
			onDefineModelEnter(node, model) {
				if (!groups.has("props")) return;
				const container = getVueComponentPropertiesContainer(context.sourceCode.ast);
				if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.init === node) {
					container.propertyReferences.push(propertyReferenceExtractor.extractFromName(model.name.modelName, model.name.node || node));
					return;
				}
				container.properties.push({
					type: "model",
					name: model.name.modelName,
					groupName: "props",
					node: model.name.node || node
				});
			}
		}), import_utils.default.defineVueVisitor(context, {
			CallExpression(node, vueData) {
				if (node.callee.type !== "Identifier") return;
				let groupName = null;
				if (/^mapMutations|mapActions$/u.test(node.callee.name)) groupName = "methods";
				else if (/^mapState|mapGetters|mapWritableState$/u.test(node.callee.name)) groupName = "computed";
				if (!groupName || node.arguments.length === 0) return;
				const arg = node.arguments.length === 2 ? node.arguments[1] : node.arguments[0];
				if (arg.type === "ObjectExpression") {
					const container = getVueComponentPropertiesContainer(vueData.node);
					for (const prop of arg.properties) {
						const name = prop.type === "SpreadElement" ? null : import_utils.default.getStaticPropertyName(prop);
						if (name) container.properties.push({
							type: "array",
							name,
							groupName,
							node: prop
						});
					}
				} else if (arg.type === "ArrayExpression") {
					const container = getVueComponentPropertiesContainer(vueData.node);
					for (const element of arg.elements) {
						if (!element || element.type !== "Literal" && element.type !== "TemplateLiteral") continue;
						const name = import_utils.default.getStringLiteralValue(element);
						if (name) container.properties.push({
							type: "array",
							name,
							groupName,
							node: element
						});
					}
				}
			},
			onVueObjectEnter(node, vueNode) {
				const container = getVueComponentPropertiesContainer(vueNode.node);
				for (const watcherOrExpose of import_utils.default.iterateProperties(node, new Set([GROUP_WATCHER, GROUP_EXPOSE]))) if (watcherOrExpose.groupName === GROUP_WATCHER) {
					const watcher = watcherOrExpose;
					container.propertyReferences.push(propertyReferenceExtractor.extractFromPath(watcher.name, watcher.node));
					if (watcher.type === "object") {
						const property = watcher.property;
						if (property.kind === "init") for (const handlerValueNode of import_utils.default.iterateWatchHandlerValues(property)) container.propertyReferences.push(propertyReferenceExtractor.extractFromNameLiteral(handlerValueNode));
					}
				} else if (watcherOrExpose.groupName === GROUP_EXPOSE) {
					const expose = watcherOrExpose;
					container.propertyReferences.push(propertyReferenceExtractor.extractFromName(expose.name, expose.node));
				}
				container.properties.push(...import_utils.default.iterateProperties(node, groups));
			},
			"ObjectExpression > Property > :function[params.length>0]"(node, vueData) {
				const property = getParentProperty(node);
				if (!property) return;
				if (property.parent === vueData.node) {
					if (import_utils.default.getStaticPropertyName(property) !== "data") return;
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
				getVueComponentPropertiesContainer(vueData.node).propertyReferences.push(propertyReferences);
			},
			onSetupFunctionEnter(node, vueData) {
				const container = getVueComponentPropertiesContainer(vueData.node);
				const propertyReferences = propertyReferenceExtractor.extractFromFunctionParam(node, 0);
				container.propertyReferencesForProps.push(propertyReferences);
			},
			onRenderFunctionEnter(node, vueData) {
				const container = getVueComponentPropertiesContainer(vueData.node);
				const propertyReferences = propertyReferenceExtractor.extractFromFunctionParam(node, 0);
				container.propertyReferencesForProps.push(propertyReferences);
				if (vueData.functional) {
					const propertyReferencesForV2 = propertyReferenceExtractor.extractFromFunctionParam(node, 1);
					container.propertyReferencesForProps.push(propertyReferencesForV2.getNest("props"));
				}
			},
			"ThisExpression, Identifier"(node, vueData) {
				if (!import_utils.default.isThis(node, context)) return;
				const container = getVueComponentPropertiesContainer(vueData.node);
				const propertyReferences = propertyReferenceExtractor.extractFromExpression(node, false);
				container.propertyReferences.push(propertyReferences);
			}
		}), {
			Program() {
				const styleVars = require_index$1.getStyleVariablesContext(context);
				if (styleVars) templatePropertiesContainer.propertyReferences.push(propertyReferenceExtractor.extractFromStyleVariablesContext(styleVars));
			},
			"Program:exit"(node) {
				if (!node.templateBody) reportUnusedProperties();
			}
		});
		return import_utils.default.defineTemplateBodyVisitor(context, {
			VExpressionContainer(node) {
				const property = propertyReferenceExtractor.extractFromVExpressionContainer(node);
				templatePropertiesContainer.propertyReferences.push(property);
				if (!propsReferencePattern) return;
				for (const key of property.allProperties().keys()) if (propsReferencePattern.type === "Identifier" && propsReferencePattern.name === key) templatePropertiesContainer.propertyReferences.push(property.getNest(key));
			},
			"VAttribute[directive=false]"(node) {
				if (node.key.name === "ref" && node.value != null) templatePropertiesContainer.refNames.add(node.value.value);
			},
			"VElement[parent.type!='VElement']:exit"() {
				reportUnusedProperties();
			}
		}, scriptVisitor);
	}
};

//#endregion
exports.default = no_unused_properties_default;