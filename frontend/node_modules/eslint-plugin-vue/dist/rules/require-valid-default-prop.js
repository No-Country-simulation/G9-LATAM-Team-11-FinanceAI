const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/require-valid-default-prop.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const NATIVE_TYPES = new Set([
	"String",
	"Number",
	"Boolean",
	"Function",
	"Object",
	"Array",
	"Symbol",
	"BigInt"
]);
const FUNCTION_VALUE_TYPES = new Set([
	"Function",
	"Object",
	"Array"
]);
function getPropertyNode(obj, name) {
	for (const p of obj.properties) if (p.type === "Property" && !p.computed && p.key.type === "Identifier" && p.key.name === name) return p;
	return null;
}
function getTypes(targetNode) {
	const node = import_utils.default.skipTSAsExpression(targetNode);
	if (node.type === "Identifier") return [node.name];
	else if (node.type === "ArrayExpression") return node.elements.filter((item) => item != null && item.type === "Identifier").map((item) => item.name);
	return [];
}
var require_valid_default_prop_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce props default values to be valid",
			categories: ["vue3-essential", "vue2-essential"],
			url: "https://eslint.vuejs.org/rules/require-valid-default-prop.html"
		},
		fixable: null,
		schema: [],
		messages: { invalidType: "Type of the default value for '{{name}}' prop must be a {{types}}." }
	},
	create(context) {
		const vueObjectPropsContexts = /* @__PURE__ */ new Map();
		const scriptSetupPropsContexts = [];
		let scopeStack = null;
		function onFunctionExit() {
			scopeStack = scopeStack && scopeStack.upper;
		}
		function getValueType(targetNode) {
			const node = import_utils.default.skipChainExpression(targetNode);
			switch (node.type) {
				case "CallExpression":
					if (node.callee.type === "Identifier" && NATIVE_TYPES.has(node.callee.name)) return {
						function: false,
						type: node.callee.name
					};
					break;
				case "TemplateLiteral": return {
					function: false,
					type: "String"
				};
				case "Literal": {
					if (node.value === null && !node.bigint) return null;
					const type = node.bigint ? "BigInt" : require_casing.capitalize(typeof node.value);
					if (NATIVE_TYPES.has(type)) return {
						function: false,
						type
					};
					break;
				}
				case "ArrayExpression": return {
					function: false,
					type: "Array"
				};
				case "ObjectExpression": return {
					function: false,
					type: "Object"
				};
				case "FunctionExpression": return {
					function: true,
					expression: false,
					type: "Function",
					functionBody: node.body,
					returnTypes: []
				};
				case "ArrowFunctionExpression":
					if (node.expression) {
						const valueType = getValueType(node.body);
						return {
							function: true,
							expression: true,
							type: "Function",
							functionBody: node.body,
							returnType: valueType ? valueType.type : null
						};
					}
					return {
						function: true,
						expression: false,
						type: "Function",
						functionBody: node.body,
						returnTypes: []
					};
			}
			return null;
		}
		function report(node, prop, expectedTypeNames) {
			const propName = prop.propName == null ? `[${context.sourceCode.getText(prop.node.key)}]` : prop.propName;
			context.report({
				node,
				messageId: "invalidType",
				data: {
					name: propName,
					types: [...expectedTypeNames].join(" or ").toLowerCase()
				}
			});
		}
		function processPropDefs(props, otherDefaultProvider) {
			const propContexts = [];
			for (const prop of props) {
				let typeList;
				const defaultList = [];
				if (prop.type === "object") if (prop.value.type === "ObjectExpression") {
					const type = getPropertyNode(prop.value, "type");
					if (!type) continue;
					typeList = getTypes(type.value);
					const def = getPropertyNode(prop.value, "default");
					if (def) defaultList.push({
						src: "defaultProperty",
						expression: def.value
					});
				} else typeList = getTypes(prop.value);
				else typeList = prop.types;
				if (prop.propName != null) defaultList.push(...otherDefaultProvider(prop.propName));
				if (defaultList.length === 0) continue;
				const typeNames = new Set(typeList.filter((item) => NATIVE_TYPES.has(item)));
				if (typeNames.size === 0) continue;
				for (const defaultDef of defaultList) {
					const defType = getValueType(defaultDef.expression);
					if (!defType) continue;
					if (defType.function) {
						if (typeNames.has("Function")) continue;
						if (defaultDef.src === "assignment") {
							report(defaultDef.expression, prop, typeNames);
							continue;
						}
						if (defType.expression) {
							if (!defType.returnType || typeNames.has(defType.returnType)) continue;
							report(defType.functionBody, prop, typeNames);
						} else propContexts.push({
							prop,
							types: typeNames,
							default: defType
						});
					} else {
						if (typeNames.has(defType.type)) {
							if (defaultDef.src === "assignment") continue;
							if (!FUNCTION_VALUE_TYPES.has(defType.type)) continue;
						}
						report(defaultDef.expression, prop, defaultDef.src === "assignment" ? typeNames : [...typeNames].map((type) => FUNCTION_VALUE_TYPES.has(type) ? "Function" : type));
					}
				}
			}
			return propContexts;
		}
		return import_utils.default.compositingVisitors({
			":function"(node) {
				scopeStack = {
					upper: scopeStack,
					body: node.body,
					returnTypes: null
				};
			},
			ReturnStatement(node) {
				if (!scopeStack) return;
				if (scopeStack.returnTypes && node.argument) {
					const type = getValueType(node.argument);
					if (type) scopeStack.returnTypes.push({
						type: type.type,
						node: node.argument
					});
				}
			},
			":function:exit": onFunctionExit
		}, import_utils.default.defineVueVisitor(context, {
			onVueObjectEnter(obj) {
				const propContexts = processPropDefs(import_utils.default.getComponentPropsFromOptions(obj).filter((prop) => Boolean(prop.type === "object" && prop.value.type === "ObjectExpression")), () => []);
				vueObjectPropsContexts.set(obj, propContexts);
			},
			":function"(node, { node: vueNode }) {
				const data = vueObjectPropsContexts.get(vueNode);
				if (!data || !scopeStack) return;
				for (const { default: defType } of data) if (node.body === defType.functionBody) scopeStack.returnTypes = defType.returnTypes;
			},
			onVueObjectExit(obj) {
				const data = vueObjectPropsContexts.get(obj);
				if (!data) return;
				for (const { prop, types: typeNames, default: defType } of data) for (const returnType of defType.returnTypes) {
					if (typeNames.has(returnType.type)) continue;
					report(returnType.node, prop, typeNames);
				}
			}
		}), import_utils.default.defineScriptSetupVisitor(context, {
			onDefinePropsEnter(node, baseProps) {
				const props = baseProps.filter((prop) => Boolean(prop.type === "type" || prop.type === "infer-type" || prop.type === "object"));
				const defaultsByWithDefaults = import_utils.default.getWithDefaultsPropExpressions(node);
				const defaultsByAssignmentPatterns = import_utils.default.getDefaultPropExpressionsForPropsDestructure(node);
				const propContexts = processPropDefs(props, function* (propName) {
					const withDefaults = defaultsByWithDefaults[propName];
					if (withDefaults) yield {
						src: "withDefaults",
						expression: withDefaults
					};
					const assignmentPattern = defaultsByAssignmentPatterns[propName];
					if (assignmentPattern) yield {
						src: "assignment",
						expression: assignmentPattern.expression
					};
				});
				scriptSetupPropsContexts.push({
					node,
					props: propContexts
				});
			},
			":function"(node) {
				const data = scriptSetupPropsContexts.at(-1);
				if (!data || !scopeStack) return;
				for (const { default: defType } of data.props) if (node.body === defType.functionBody) scopeStack.returnTypes = defType.returnTypes;
			},
			onDefinePropsExit() {
				const data = scriptSetupPropsContexts.pop();
				if (!data) return;
				for (const { prop, types: typeNames, default: defType } of data.props) for (const returnType of defType.returnTypes) {
					if (typeNames.has(returnType.type)) continue;
					report(returnType.node, prop, typeNames);
				}
			}
		}));
	}
};

//#endregion
exports.default = require_valid_default_prop_default;