const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
let node_path = require("node:path");
node_path = require_runtime.__toESM(node_path);

//#region lib/rules/multi-word-component-names.ts
/**
* @author Marton Csordas
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var multi_word_component_names_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "require component names to be always multi-word",
			categories: ["vue3-essential", "vue2-essential"],
			url: "https://eslint.vuejs.org/rules/multi-word-component-names.html"
		},
		schema: [{
			type: "object",
			properties: { ignores: {
				type: "array",
				items: { type: "string" },
				uniqueItems: true,
				additionalItems: false
			} },
			additionalProperties: false
		}],
		messages: { unexpected: "Component name \"{{value}}\" should always be multi-word." }
	},
	create(context) {
		const ignores = new Set(["App", "app"]);
		for (const ignore of context.options[0] && context.options[0].ignores || []) {
			ignores.add(ignore);
			if (require_casing.isPascalCase(ignore)) ignores.add(require_casing.kebabCase(ignore));
		}
		let hasVue = import_utils.default.isScriptSetup(context);
		let hasName = false;
		/**
		* Returns true if the given component name is valid, otherwise false.
		* */
		function isValidComponentName(name) {
			if (ignores.has(name) || import_utils.default.VUE3_BUILTIN_COMPONENT_NAMES.has(name)) return true;
			return require_casing.kebabCase(name).split("-").length > 1;
		}
		function validateName(nameNode) {
			if (nameNode.type !== "Literal") return;
			const componentName = `${nameNode.value}`;
			if (!isValidComponentName(componentName)) context.report({
				node: nameNode,
				messageId: "unexpected",
				data: { value: componentName }
			});
		}
		return import_utils.default.compositingVisitors(import_utils.default.executeOnCallVueComponent(context, (node) => {
			hasVue = true;
			if (node.arguments.length !== 2) return;
			hasName = true;
			validateName(node.arguments[0]);
		}), import_utils.default.executeOnVue(context, (obj) => {
			hasVue = true;
			const node = import_utils.default.findProperty(obj, "name");
			if (!node) return;
			hasName = true;
			validateName(node.value);
		}), import_utils.default.defineScriptSetupVisitor(context, { onDefineOptionsEnter(node) {
			if (node.arguments.length === 0) return;
			const define = node.arguments[0];
			if (define.type !== "ObjectExpression") return;
			const nameNode = import_utils.default.findProperty(define, "name");
			if (!nameNode) return;
			hasName = true;
			validateName(nameNode.value);
		} }), { "Program:exit"(node) {
			if (hasName) return;
			if (!hasVue && node.body.length > 0) return;
			const fileName = context.filename;
			const componentName = node_path.default.basename(fileName, node_path.default.extname(fileName));
			if (import_utils.default.isVueFile(fileName) && !isValidComponentName(componentName)) context.report({
				messageId: "unexpected",
				data: { value: componentName },
				loc: {
					line: 1,
					column: 0
				}
			});
		} });
	}
};

//#endregion
exports.default = multi_word_component_names_default;