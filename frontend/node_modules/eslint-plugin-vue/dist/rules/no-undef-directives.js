const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-undef-directives.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function getRegisteredDirectives(componentObject) {
	const directivesNode = componentObject.properties.find((p) => p.type === "Property" && import_utils.default.getStaticPropertyName(p) === "directives" && p.value.type === "ObjectExpression");
	if (!directivesNode || directivesNode.type !== "Property" || directivesNode.value.type !== "ObjectExpression") return [];
	return directivesNode.value.properties.flatMap((node) => {
		const name = node.type === "Property" ? import_utils.default.getStaticPropertyName(node) : null;
		return name ? [{
			node,
			name
		}] : [];
	});
}
function isDefinedInSetup(rawName, definedNames) {
	const variableName = `v${require_casing.capitalize(require_casing.camelCase(rawName))}`;
	return definedNames.has(variableName);
}
function isDefinedInOptions(rawName, definedNames) {
	const camelName = require_casing.camelCase(rawName);
	if (definedNames.has(rawName)) return true;
	for (const name of definedNames) {
		const lowercaseName = name.toLowerCase();
		if (name !== lowercaseName && lowercaseName === camelName.toLowerCase()) return true;
	}
	return false;
}
var no_undef_directives_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow use of undefined custom directives",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-undef-directives.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { ignore: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true
			} },
			additionalProperties: false
		}],
		messages: { undef: "The 'v-{{name}}' directive has been used, but not defined." }
	},
	create(context) {
		const { ignore = [] } = context.options[0] || {};
		const isAnyIgnored = require_regexp.toRegExpGroupMatcher(ignore);
		/**
		* Check whether the given directive name is a verify target or not.
		*/
		function isVerifyTargetDirective(rawName) {
			const kebabName = require_casing.kebabCase(rawName);
			if (import_utils.default.isBuiltInDirectiveName(rawName) || isAnyIgnored(rawName, kebabName)) return false;
			return true;
		}
		function createTemplateBodyVisitor(isDefined) {
			return { "VAttribute[directive=true]"(node) {
				const name = node.key.name.name;
				if (import_utils.default.isBuiltInDirectiveName(name)) return;
				const rawName = node.key.name.rawName || name;
				if (isVerifyTargetDirective(rawName) && !isDefined(rawName)) context.report({
					node: node.key,
					messageId: "undef",
					data: { name: rawName }
				});
			} };
		}
		const definedInOptionDirectives = /* @__PURE__ */ new Set();
		if (import_utils.default.isScriptSetup(context)) {
			const definedInSetupDirectives = /* @__PURE__ */ new Set();
			const globalScope = context.sourceCode.scopeManager.globalScope;
			if (globalScope) {
				for (const variable of globalScope.variables) definedInSetupDirectives.add(variable.name);
				const moduleScope = globalScope.childScopes.find((scope) => scope.type === "module");
				for (const variable of moduleScope?.variables ?? []) definedInSetupDirectives.add(variable.name);
			}
			const scriptVisitor = import_utils.default.defineVueVisitor(context, { onVueObjectEnter(node) {
				for (const directive of getRegisteredDirectives(node)) definedInOptionDirectives.add(directive.name);
			} });
			const templateBodyVisitor = createTemplateBodyVisitor((rawName) => isDefinedInSetup(rawName, definedInSetupDirectives) || isDefinedInOptions(rawName, definedInOptionDirectives));
			return import_utils.default.defineTemplateBodyVisitor(context, templateBodyVisitor, scriptVisitor);
		}
		const scriptVisitor = import_utils.default.executeOnVue(context, (obj) => {
			for (const directive of getRegisteredDirectives(obj)) definedInOptionDirectives.add(directive.name);
		});
		const templateBodyVisitor = createTemplateBodyVisitor((rawName) => isDefinedInOptions(rawName, definedInOptionDirectives));
		return import_utils.default.defineTemplateBodyVisitor(context, templateBodyVisitor, scriptVisitor);
	}
};

//#endregion
exports.default = no_undef_directives_default;