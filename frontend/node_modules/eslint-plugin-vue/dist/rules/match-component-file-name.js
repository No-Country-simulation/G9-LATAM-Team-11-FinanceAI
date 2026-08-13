const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
let node_path = require("node:path");
node_path = require_runtime.__toESM(node_path);

//#region lib/rules/match-component-file-name.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function canVerify(node) {
	return node.type === "Literal" || node.type === "TemplateLiteral" && node.expressions.length === 0 && node.quasis.length === 1;
}
var match_component_file_name_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "require component name property to match its file name",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/match-component-file-name.html"
		},
		fixable: null,
		hasSuggestions: true,
		schema: [{
			type: "object",
			properties: {
				extensions: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true,
					additionalItems: false
				},
				shouldMatchCase: { type: "boolean" }
			},
			additionalProperties: false
		}],
		messages: { shouldMatchFileName: "Component name `{{name}}` should match file name `{{filename}}`." }
	},
	create(context) {
		const options = context.options[0];
		const shouldMatchCase = options && options.shouldMatchCase || false;
		const extensionsArray = options && options.extensions;
		const allowedExtensions = Array.isArray(extensionsArray) ? extensionsArray : ["jsx"];
		const extension = node_path.default.extname(context.filename);
		const filename = node_path.default.basename(context.filename, extension);
		const errors = [];
		let componentCount = 0;
		if (!allowedExtensions.includes(extension.replace(/^\./, ""))) return {};
		function compareNames(name, filename) {
			if (shouldMatchCase) return name === filename;
			return require_casing.pascalCase(name) === filename || require_casing.kebabCase(name) === filename;
		}
		function verifyName(node) {
			let name;
			if (node.type === "TemplateLiteral") name = node.quasis[0].value.cooked;
			else name = `${node.value}`;
			if (!compareNames(name, filename)) errors.push({
				node,
				messageId: "shouldMatchFileName",
				data: {
					filename,
					name
				},
				suggest: [{
					desc: "Rename component to match file name.",
					fix(fixer) {
						const quote = node.type === "TemplateLiteral" ? "`" : node.raw[0];
						return fixer.replaceText(node, `${quote}${filename}${quote}`);
					}
				}]
			});
		}
		return import_utils.default.compositingVisitors(import_utils.default.executeOnCallVueComponent(context, (node) => {
			if (node.arguments.length === 2) {
				const argument = node.arguments[0];
				if (canVerify(argument)) verifyName(argument);
			}
		}), import_utils.default.executeOnVue(context, (object) => {
			const node = import_utils.default.findProperty(object, "name");
			componentCount++;
			if (!node) return;
			if (!canVerify(node.value)) return;
			verifyName(node.value);
		}), import_utils.default.defineScriptSetupVisitor(context, { onDefineOptionsEnter(node) {
			componentCount++;
			if (node.arguments.length === 0) return;
			const define = node.arguments[0];
			if (define.type !== "ObjectExpression") return;
			const nameNode = import_utils.default.findProperty(define, "name");
			if (!nameNode) return;
			if (!canVerify(nameNode.value)) return;
			verifyName(nameNode.value);
		} }), { "Program:exit"() {
			if (componentCount > 1) return;
			for (const error of errors) context.report(error);
		} });
	}
};

//#endregion
exports.default = match_component_file_name_default;