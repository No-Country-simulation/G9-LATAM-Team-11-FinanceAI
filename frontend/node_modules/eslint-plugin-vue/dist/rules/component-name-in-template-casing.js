const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/component-name-in-template-casing.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const allowedCaseOptions = ["PascalCase", "kebab-case"];
const defaultCase = "PascalCase";
/**
* Checks whether the given variable is the type-only import object.
*/
function isTypeOnlyImport(variable) {
	if (variable.defs.length === 0) return false;
	return variable.defs.every((def) => {
		if (def.type !== "ImportBinding") return false;
		if (def.parent.importKind === "type") return true;
		if (def.node.type === "ImportSpecifier" && def.node.importKind === "type") return true;
		return false;
	});
}
var component_name_in_template_casing_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce specific casing for the component naming style in template",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/component-name-in-template-casing.html"
		},
		fixable: "code",
		schema: [{ enum: allowedCaseOptions }, {
			type: "object",
			properties: {
				globals: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true
				},
				ignores: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true,
					additionalItems: false
				},
				registeredComponentsOnly: { type: "boolean" }
			},
			additionalProperties: false
		}],
		messages: { incorrectCase: "Component name \"{{name}}\" is not {{caseType}}." }
	},
	create(context) {
		const caseOption = context.options[0];
		const options = context.options[1] || {};
		const caseType = allowedCaseOptions.includes(caseOption) ? caseOption : defaultCase;
		const isIgnored = require_regexp.toRegExpGroupMatcher(options.ignores);
		const globalStrings = [];
		const globalPatterns = [];
		for (const global of options.globals || []) if (require_regexp.isRegExp(global)) globalPatterns.push(global);
		else globalStrings.push(global);
		const isGlobalPattern = require_regexp.toRegExpGroupMatcher(globalPatterns);
		const registeredComponentsOnly = options.registeredComponentsOnly !== false;
		const sourceCode = context.sourceCode;
		const tokens = sourceCode.parserServices.getTemplateBodyTokenStore && sourceCode.parserServices.getTemplateBodyTokenStore();
		const registeredComponents = new Set(globalStrings.map(require_casing.pascalCase));
		if (import_utils.default.isScriptSetup(context)) {
			const globalScope = context.sourceCode.scopeManager.globalScope;
			if (globalScope) {
				const moduleScope = globalScope.childScopes.find((scope) => scope.type === "module");
				for (const variable of moduleScope && moduleScope.variables || []) if (!isTypeOnlyImport(variable)) registeredComponents.add(variable.name);
			}
		}
		/**
		* Checks whether the given node is the verification target node.
		*/
		function isVerifyTarget(node) {
			if (isIgnored(node.rawName)) return false;
			if (!import_utils.default.isHtmlElementNode(node) && !import_utils.default.isSvgElementNode(node) && !import_utils.default.isMathElementNode(node) || import_utils.default.isHtmlWellKnownElementName(node.rawName) || import_utils.default.isSvgWellKnownElementName(node.rawName) || import_utils.default.isMathWellKnownElementName(node.rawName) || import_utils.default.isVueBuiltInElementName(node.rawName)) return false;
			if (!registeredComponentsOnly) return true;
			return registeredComponents.has(require_casing.pascalCase(node.rawName)) || isGlobalPattern(node.rawName);
		}
		let hasInvalidEOF = false;
		return import_utils.default.defineTemplateBodyVisitor(context, { VElement(node) {
			if (hasInvalidEOF) return;
			if (!isVerifyTarget(node)) return;
			const name = node.rawName;
			if (!require_casing.getChecker(caseType)(name)) {
				const startTag = node.startTag;
				const open = tokens.getFirstToken(startTag);
				const casingName = require_casing.getExactConverter(caseType)(name);
				context.report({
					node: open,
					loc: open.loc,
					messageId: "incorrectCase",
					data: {
						name,
						caseType
					},
					*fix(fixer) {
						yield fixer.replaceText(open, `<${casingName}`);
						const endTag = node.endTag;
						if (endTag) {
							const endTagOpen = tokens.getFirstToken(endTag);
							yield fixer.replaceText(endTagOpen, `</${casingName}`);
						}
					}
				});
			}
		} }, {
			Program(node) {
				hasInvalidEOF = import_utils.default.hasInvalidEOF(node);
			},
			...registeredComponentsOnly ? import_utils.default.executeOnVue(context, (obj) => {
				for (const n of import_utils.default.getRegisteredComponents(obj)) registeredComponents.add(n.name);
			}) : {}
		});
	}
};

//#endregion
exports.default = component_name_in_template_casing_default;