const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
let node_path = require("node:path");
node_path = require_runtime.__toESM(node_path);

//#region lib/rules/no-undef-components.ts
/**
* @author Yosuke Ota
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* `casing.camelCase()` converts the beginning to lowercase,
* but does not convert the case of the beginning character when converting with Vue3.
* @see https://github.com/vuejs/core/blob/ae4b0783d78670b6e942ae2a4e3ec6efbbffa158/packages/shared/src/index.ts#L105
*/
function camelize(str) {
	return str.replaceAll(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
}
var DefinedInSetupComponents = class {
	/**
	* Component names
	*/
	names = /* @__PURE__ */ new Set();
	addName(...names) {
		for (const name of names) this.names.add(name);
	}
	/**
	* @see https://github.com/vuejs/core/blob/ae4b0783d78670b6e942ae2a4e3ec6efbbffa158/packages/compiler-core/src/transforms/transformElement.ts#L334
	*/
	isDefinedComponent(rawName) {
		if (this.names.has(rawName)) return true;
		const camelName = camelize(rawName);
		if (this.names.has(camelName)) return true;
		const pascalName = require_casing.capitalize(camelName);
		if (this.names.has(pascalName)) return true;
		const dotIndex = rawName.indexOf(".");
		if (dotIndex > 0 && this.isDefinedComponent(rawName.slice(0, dotIndex))) return true;
		return false;
	}
};
var DefinedInOptionComponents = class {
	/**
	* Component names
	*/
	names = /* @__PURE__ */ new Set();
	/**
	* Component names, transformed to kebab-case
	*/
	kebabCaseNames = /* @__PURE__ */ new Set();
	addName(...names) {
		for (const name of names) {
			this.names.add(name);
			this.kebabCaseNames.add(require_casing.kebabCase(name));
		}
	}
	isDefinedComponent(rawName) {
		if (this.names.has(rawName)) return true;
		const kebabCaseName = require_casing.kebabCase(rawName);
		if (this.kebabCaseNames.has(kebabCaseName) && !require_casing.isPascalCase(rawName)) return true;
		return false;
	}
};
var no_undef_components_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow use of undefined components in `<template>`",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-undef-components.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { ignorePatterns: { type: "array" } },
			additionalProperties: false
		}],
		messages: {
			undef: "The '<{{name}}>' component has been used, but not defined.",
			typeOnly: "The '<{{name}}>' component has been used, but '{{name}}' only refers to a type."
		}
	},
	create(context) {
		const ignorePatterns = (context.options[0] || {}).ignorePatterns || [];
		/**
		* Check whether the given element name is a verify target or not.
		*/
		function isVerifyTargetComponent(rawName) {
			const kebabCaseName = require_casing.kebabCase(rawName);
			if (import_utils.default.isHtmlWellKnownElementName(rawName) || import_utils.default.isSvgWellKnownElementName(rawName) || import_utils.default.isMathWellKnownElementName(rawName) || import_utils.default.isBuiltInComponentName(kebabCaseName)) return false;
			const pascalCaseName = require_casing.pascalCase(rawName);
			if (ignorePatterns.some((pattern) => {
				const regExp = new RegExp(pattern);
				return regExp.test(rawName) || regExp.test(kebabCaseName) || regExp.test(pascalCaseName);
			})) return false;
			return true;
		}
		let verifyName;
		let scriptVisitor = {};
		const templateBodyVisitor = {
			VElement(node) {
				if (!import_utils.default.isHtmlElementNode(node) && !import_utils.default.isSvgElementNode(node) && !import_utils.default.isMathElementNode(node)) return;
				verifyName(node.rawName, node.startTag);
			},
			"VAttribute[directive=false][key.name='is']"(node) {
				if (!node.value) return;
				const value = node.value.value.startsWith("vue:") ? node.value.value.slice(4) : node.value.value;
				verifyName(value, node);
			}
		};
		if (import_utils.default.isScriptSetup(context)) {
			const definedInSetupComponents = new DefinedInSetupComponents();
			const definedInOptionComponents = new DefinedInOptionComponents();
			const scriptTypeOnlyNames = /* @__PURE__ */ new Set();
			const globalScope = context.sourceCode.scopeManager.globalScope;
			if (globalScope) {
				for (const variable of globalScope.variables) definedInSetupComponents.addName(variable.name);
				const moduleScope = globalScope.childScopes.find((scope) => scope.type === "module");
				for (const variable of moduleScope && moduleScope.variables || []) if (variable.isTypeVariable && !variable.isValueVariable || variable.defs.length > 0 && variable.defs.every((def) => {
					if (def.type !== "ImportBinding") return false;
					if (def.parent.importKind === "type") return true;
					if (def.node.type === "ImportSpecifier" && def.node.importKind === "type") return true;
					return false;
				})) scriptTypeOnlyNames.add(variable.name);
				else definedInSetupComponents.addName(variable.name);
			}
			const fileName = context.filename;
			const selfComponentName = node_path.default.basename(fileName, node_path.default.extname(fileName));
			definedInSetupComponents.addName(selfComponentName);
			scriptVisitor = import_utils.default.defineVueVisitor(context, { onVueObjectEnter(node, { type }) {
				if (type !== "export") return;
				const nameProperty = import_utils.default.findProperty(node, "name");
				if (nameProperty && import_utils.default.isStringLiteral(nameProperty.value)) {
					const name = import_utils.default.getStringLiteralValue(nameProperty.value);
					if (name) definedInOptionComponents.addName(name);
				}
			} });
			verifyName = (rawName, reportNode) => {
				if (!isVerifyTargetComponent(rawName)) return;
				if (definedInSetupComponents.isDefinedComponent(rawName)) return;
				if (definedInOptionComponents.isDefinedComponent(rawName)) return;
				context.report({
					node: reportNode,
					messageId: scriptTypeOnlyNames.has(rawName) ? "typeOnly" : "undef",
					data: { name: rawName }
				});
			};
		} else {
			const definedInOptionComponents = new DefinedInOptionComponents();
			scriptVisitor = import_utils.default.executeOnVue(context, (obj) => {
				definedInOptionComponents.addName(...import_utils.default.getRegisteredComponents(obj).map(({ name }) => name));
				const nameProperty = import_utils.default.findProperty(obj, "name");
				if (nameProperty && import_utils.default.isStringLiteral(nameProperty.value)) {
					const name = import_utils.default.getStringLiteralValue(nameProperty.value);
					if (name) definedInOptionComponents.addName(name);
				}
			});
			verifyName = (rawName, reportNode) => {
				if (!isVerifyTargetComponent(rawName)) return;
				if (definedInOptionComponents.isDefinedComponent(rawName)) return;
				context.report({
					node: reportNode,
					messageId: "undef",
					data: { name: rawName }
				});
			};
			templateBodyVisitor["VAttribute[directive=true][key.name.name='bind'][key.argument.name='is'], VAttribute[directive=true][key.name.name='is']"] = (node) => {
				if (!node.value || node.value.type !== "VExpressionContainer" || !node.value.expression) return;
				if (node.value.expression.type === "Literal") verifyName(`${node.value.expression.value}`, node);
			};
		}
		return import_utils.default.defineTemplateBodyVisitor(context, templateBodyVisitor, scriptVisitor);
	}
};

//#endregion
exports.default = no_undef_components_default;