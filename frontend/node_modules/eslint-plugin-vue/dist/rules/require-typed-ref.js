const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_ref_object_references = require('../utils/ref-object-references.js');

//#region lib/rules/require-typed-ref.ts
/**
* @author Ivan Demchuk <https://github.com/Demivan>
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function isNullOrUndefined(node) {
	return node.type === "Literal" && node.value === null || node.type === "Identifier" && node.name === "undefined";
}
var require_typed_ref_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "require `ref` and `shallowRef` functions to be strongly typed",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/require-typed-ref.html"
		},
		fixable: null,
		schema: [],
		messages: { noType: "Specify type parameter for `{{name}}` function, otherwise created variable will not be typechecked." }
	},
	create(context) {
		const filename = context.filename;
		if (!import_utils.default.isVueFile(filename) && !import_utils.default.isTypeScriptFile(filename)) return {};
		if (import_utils.default.isVueFile(filename)) {
			const sourceCode = context.sourceCode;
			const documentFragment = sourceCode.parserServices.getDocumentFragment && sourceCode.parserServices.getDocumentFragment();
			if (!documentFragment) return {};
			if (documentFragment.children.filter((element) => import_utils.default.isVElement(element) && element.name === "script").every((script) => !import_utils.default.hasAttribute(script, "lang", "ts"))) return {};
		}
		const defines = require_ref_object_references.iterateDefineRefs(context.sourceCode.scopeManager.globalScope);
		function report(name, node) {
			context.report({
				node,
				messageId: "noType",
				data: { name }
			});
		}
		return { Program() {
			for (const ref of defines) {
				if (ref.name !== "ref" && ref.name !== "shallowRef") continue;
				if (ref.node.arguments.length > 0 && !isNullOrUndefined(ref.node.arguments[0])) continue;
				if (("typeArguments" in ref.node ? ref.node.typeArguments : ref.node.typeParameters) == null) if (ref.node.parent.type === "VariableDeclarator" && ref.node.parent.id.type === "Identifier") {
					if (ref.node.parent.id.typeAnnotation == null) report(ref.name, ref.node);
				} else report(ref.name, ref.node);
			}
		} };
	}
};

//#endregion
exports.default = require_typed_ref_default;