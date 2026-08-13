const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_html_elements$1 = require('../utils/html-elements.js');
const require_svg_elements$1 = require('../utils/svg-elements.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_deprecated_html_elements = require('../utils/deprecated-html-elements.js');

//#region lib/rules/no-reserved-component-names.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var import_html_elements = /* @__PURE__ */ require_runtime.__toESM(require_html_elements$1.default);
var import_svg_elements = /* @__PURE__ */ require_runtime.__toESM(require_svg_elements$1.default);
const kebabCaseElements = [
	"annotation-xml",
	"color-profile",
	"font-face",
	"font-face-src",
	"font-face-uri",
	"font-face-format",
	"font-face-name",
	"missing-glyph"
];
function isLowercase(word) {
	return /^[a-z]*$/.test(word);
}
function canVerify(node) {
	return node.type === "Literal" || node.type === "TemplateLiteral" && node.expressions.length === 0 && node.quasis.length === 1;
}
function addAll(set, iterable) {
	for (const element of iterable) set.add(element);
}
var no_reserved_component_names_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow the use of reserved names in component definitions",
			categories: ["vue3-essential", "vue2-essential"],
			url: "https://eslint.vuejs.org/rules/no-reserved-component-names.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: {
				disallowVueBuiltInComponents: { type: "boolean" },
				disallowVue3BuiltInComponents: { type: "boolean" },
				htmlElementCaseSensitive: { type: "boolean" }
			},
			additionalProperties: false
		}],
		messages: {
			reserved: "Name \"{{name}}\" is reserved.",
			reservedInHtml: "Name \"{{name}}\" is reserved in HTML.",
			reservedInVue: "Name \"{{name}}\" is reserved in Vue.js.",
			reservedInVue3: "Name \"{{name}}\" is reserved in Vue.js 3.x."
		}
	},
	create(context) {
		const options = context.options[0] || {};
		const disallowVueBuiltInComponents = options.disallowVueBuiltInComponents === true;
		const disallowVue3BuiltInComponents = options.disallowVue3BuiltInComponents === true;
		const htmlElementCaseSensitive = options.htmlElementCaseSensitive === true;
		const RESERVED_NAMES_IN_HTML = new Set(import_html_elements.default);
		const RESERVED_NAMES_IN_OTHERS = new Set([
			...require_deprecated_html_elements.default,
			...kebabCaseElements,
			...import_svg_elements.default
		]);
		if (!htmlElementCaseSensitive) {
			addAll(RESERVED_NAMES_IN_HTML, import_html_elements.default.map(require_casing.capitalize));
			addAll(RESERVED_NAMES_IN_OTHERS, [
				...require_deprecated_html_elements.default.map(require_casing.capitalize),
				...kebabCaseElements.map(require_casing.pascalCase),
				...import_svg_elements.default.filter(isLowercase).map(require_casing.capitalize)
			]);
		}
		const reservedNames = new Set([
			...RESERVED_NAMES_IN_HTML,
			...disallowVueBuiltInComponents ? import_utils.default.VUE2_BUILTIN_COMPONENT_NAMES : [],
			...disallowVue3BuiltInComponents ? import_utils.default.VUE3_BUILTIN_COMPONENT_NAMES : [],
			...RESERVED_NAMES_IN_OTHERS
		]);
		function getMessageId(name) {
			if (RESERVED_NAMES_IN_HTML.has(name)) return "reservedInHtml";
			if (import_utils.default.VUE2_BUILTIN_COMPONENT_NAMES.has(name)) return "reservedInVue";
			if (import_utils.default.VUE3_BUILTIN_COMPONENT_NAMES.has(name)) return "reservedInVue3";
			return "reserved";
		}
		function reportIfInvalid(node) {
			let name;
			if (node.type === "TemplateLiteral") name = node.quasis[0].value.cooked;
			else name = `${node.value}`;
			if (reservedNames.has(name)) report(node, name);
		}
		function report(node, name) {
			context.report({
				node,
				messageId: getMessageId(name),
				data: { name }
			});
		}
		return import_utils.default.compositingVisitors(import_utils.default.executeOnCallVueComponent(context, (node) => {
			if (node.arguments.length === 2) {
				const argument = node.arguments[0];
				if (canVerify(argument)) reportIfInvalid(argument);
			}
		}), import_utils.default.executeOnVue(context, (obj) => {
			for (const { node, name } of import_utils.default.getRegisteredComponents(obj)) if (reservedNames.has(name)) report(node, name);
			const node = import_utils.default.findProperty(obj, "name");
			if (!node) return;
			if (!canVerify(node.value)) return;
			reportIfInvalid(node.value);
		}), import_utils.default.defineScriptSetupVisitor(context, { onDefineOptionsEnter(node) {
			if (node.arguments.length === 0) return;
			const define = node.arguments[0];
			if (define.type !== "ObjectExpression") return;
			const nameNode = import_utils.default.findProperty(define, "name");
			if (!nameNode) return;
			if (!canVerify(nameNode.value)) return;
			reportIfInvalid(nameNode.value);
		} }));
	}
};

//#endregion
exports.default = no_reserved_component_names_default;