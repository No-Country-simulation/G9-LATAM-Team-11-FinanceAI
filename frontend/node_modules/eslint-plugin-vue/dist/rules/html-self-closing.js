const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');

//#region lib/rules/html-self-closing.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* These strings wil be displayed in error messages.
*/
const ELEMENT_TYPE_MESSAGES = Object.freeze({
	NORMAL: "HTML elements",
	VOID: "HTML void elements",
	COMPONENT: "Vue.js custom components",
	SVG: "SVG elements",
	MATH: "MathML elements",
	UNKNOWN: "unknown elements"
});
/**
* Normalize the given options.
*/
function parseOptions(options) {
	return {
		NORMAL: options && options.html && options.html.normal || "always",
		VOID: options && options.html && options.html.void || "never",
		COMPONENT: options && options.html && options.html.component || "always",
		SVG: options && options.svg || "always",
		MATH: options && options.math || "always",
		UNKNOWN: null
	};
}
/**
* Get the elementType of the given element.
*/
function getElementType(node) {
	if (import_utils.default.isCustomComponent(node)) return "COMPONENT";
	if (import_utils.default.isHtmlElementNode(node)) {
		if (import_utils.default.isHtmlVoidElementName(node.name)) return "VOID";
		return "NORMAL";
	}
	if (import_utils.default.isSvgElementNode(node)) return "SVG";
	if (import_utils.default.isMathElementNode(node)) return "MATH";
	return "UNKNOWN";
}
/**
* Check whether the given element is empty or not.
* This ignores whitespaces, doesn't ignore comments.
*/
function isEmpty(node, sourceCode) {
	const start = node.startTag.range[1];
	const end = node.endTag == null ? node.range[1] : node.endTag.range[0];
	return sourceCode.text.slice(start, end).trim() === "";
}
var html_self_closing_default = {
	meta: {
		type: "layout",
		docs: {
			description: "enforce self-closing style",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/html-self-closing.html"
		},
		fixable: "code",
		schema: {
			definitions: { optionValue: { enum: [
				"always",
				"never",
				"any"
			] } },
			type: "array",
			items: [{
				type: "object",
				properties: {
					html: {
						type: "object",
						properties: {
							normal: { $ref: "#/definitions/optionValue" },
							void: { $ref: "#/definitions/optionValue" },
							component: { $ref: "#/definitions/optionValue" }
						},
						additionalProperties: false
					},
					svg: { $ref: "#/definitions/optionValue" },
					math: { $ref: "#/definitions/optionValue" }
				},
				additionalProperties: false
			}],
			maxItems: 1
		},
		messages: {
			requireSelfClosing: "Require self-closing on {{elementType}} (<{{name}}>).",
			disallowSelfClosing: "Disallow self-closing on {{elementType}} (<{{name}}/>)."
		}
	},
	create(context) {
		const sourceCode = context.sourceCode;
		const options = parseOptions(context.options[0]);
		let hasInvalidEOF = false;
		return import_utils.default.defineTemplateBodyVisitor(context, { VElement(node) {
			if (hasInvalidEOF || node.parent.type === "VDocumentFragment") return;
			const elementType = getElementType(node);
			const mode = options[elementType];
			if (mode === "always" && !node.startTag.selfClosing && isEmpty(node, sourceCode)) context.report({
				node: node.endTag || node,
				messageId: "requireSelfClosing",
				data: {
					elementType: ELEMENT_TYPE_MESSAGES[elementType],
					name: node.rawName
				},
				fix(fixer) {
					const close = sourceCode.parserServices.getTemplateBodyTokenStore().getLastToken(node.startTag);
					if (close.type !== "HTMLTagClose") return null;
					return fixer.replaceTextRange([close.range[0], node.range[1]], "/>");
				}
			});
			if (mode === "never" && node.startTag.selfClosing) context.report({
				node,
				loc: {
					start: {
						line: node.loc.end.line,
						column: node.loc.end.column - 2
					},
					end: node.loc.end
				},
				messageId: "disallowSelfClosing",
				data: {
					elementType: ELEMENT_TYPE_MESSAGES[elementType],
					name: node.rawName
				},
				fix(fixer) {
					const close = sourceCode.parserServices.getTemplateBodyTokenStore().getLastToken(node.startTag);
					if (close.type !== "HTMLSelfClosingTagClose") return null;
					if (elementType === "VOID") return fixer.replaceText(close, ">");
					const elementPart = sourceCode.text.slice(node.range[0], close.range[0]);
					return fixer.replaceText(node, `${elementPart}></${node.rawName}>`);
				}
			});
		} }, { Program(node) {
			hasInvalidEOF = import_utils.default.hasInvalidEOF(node);
		} });
	}
};

//#endregion
exports.default = html_self_closing_default;