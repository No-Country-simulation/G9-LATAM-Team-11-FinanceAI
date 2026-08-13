const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_inline_non_void_elements = require('../utils/inline-non-void-elements.js');

//#region lib/rules/multiline-html-element-content-newline.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function isMultilineElement(element) {
	return element.loc.start.line < element.endTag.loc.start.line;
}
function parseOptions(options) {
	return Object.assign({
		ignores: [
			"pre",
			"textarea",
			...require_inline_non_void_elements.default
		],
		ignoreWhenEmpty: true,
		allowEmptyLines: false
	}, options);
}
function getPhrase(lineBreaks) {
	switch (lineBreaks) {
		case 0: return "no";
		default: return `${lineBreaks}`;
	}
}
/**
* Check whether the given element is empty or not.
* This ignores whitespaces, doesn't ignore comments.
*/
function isEmpty(node, sourceCode) {
	const start = node.startTag.range[1];
	const end = node.endTag.range[0];
	return sourceCode.text.slice(start, end).trim() === "";
}
var multiline_html_element_content_newline_default = {
	meta: {
		type: "layout",
		docs: {
			description: "require a line break before and after the contents of a multiline element",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/multiline-html-element-content-newline.html"
		},
		fixable: "whitespace",
		schema: [{
			type: "object",
			properties: {
				ignoreWhenEmpty: { type: "boolean" },
				ignores: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true,
					additionalItems: false
				},
				allowEmptyLines: { type: "boolean" }
			},
			additionalProperties: false
		}],
		messages: {
			unexpectedAfterClosingBracket: "Expected 1 line break after opening tag (`<{{name}}>`), but {{actual}} line breaks found.",
			unexpectedBeforeOpeningBracket: "Expected 1 line break before closing tag (`</{{name}}>`), but {{actual}} line breaks found."
		}
	},
	create(context) {
		const options = parseOptions(context.options[0]);
		const ignores = options.ignores;
		const ignoreWhenEmpty = options.ignoreWhenEmpty;
		const allowEmptyLines = options.allowEmptyLines;
		const sourceCode = context.sourceCode;
		const template = sourceCode.parserServices.getTemplateBodyTokenStore && sourceCode.parserServices.getTemplateBodyTokenStore();
		let inIgnoreElement = null;
		function isIgnoredElement(node) {
			return ignores.includes(node.name) || ignores.includes(require_casing.pascalCase(node.rawName)) || ignores.includes(require_casing.kebabCase(node.rawName));
		}
		function isInvalidLineBreaks(lineBreaks) {
			return allowEmptyLines ? lineBreaks === 0 : lineBreaks !== 1;
		}
		return import_utils.default.defineTemplateBodyVisitor(context, {
			VElement(node) {
				if (inIgnoreElement) return;
				if (isIgnoredElement(node)) {
					inIgnoreElement = node;
					return;
				}
				if (node.startTag.selfClosing || !node.endTag) return;
				const element = node;
				if (!isMultilineElement(element)) return;
				const getTokenOption = {
					includeComments: true,
					filter: (token) => token.type !== "HTMLWhitespace"
				};
				if (ignoreWhenEmpty && element.children.length === 0 && template.getFirstTokensBetween(element.startTag, element.endTag, getTokenOption).length === 0) return;
				const contentFirst = template.getTokenAfter(element.startTag, getTokenOption);
				const contentLast = template.getTokenBefore(element.endTag, getTokenOption);
				const beforeLineBreaks = contentFirst.loc.start.line - element.startTag.loc.end.line;
				const afterLineBreaks = element.endTag.loc.start.line - contentLast.loc.end.line;
				if (isInvalidLineBreaks(beforeLineBreaks)) context.report({
					node: template.getLastToken(element.startTag),
					loc: {
						start: element.startTag.loc.end,
						end: contentFirst.loc.start
					},
					messageId: "unexpectedAfterClosingBracket",
					data: {
						name: element.rawName,
						actual: getPhrase(beforeLineBreaks)
					},
					fix(fixer) {
						const range = [element.startTag.range[1], contentFirst.range[0]];
						return fixer.replaceTextRange(range, "\n");
					}
				});
				if (isEmpty(element, sourceCode)) return;
				if (isInvalidLineBreaks(afterLineBreaks)) context.report({
					node: template.getFirstToken(element.endTag),
					loc: {
						start: contentLast.loc.end,
						end: element.endTag.loc.start
					},
					messageId: "unexpectedBeforeOpeningBracket",
					data: {
						name: element.name,
						actual: getPhrase(afterLineBreaks)
					},
					fix(fixer) {
						const range = [contentLast.range[1], element.endTag.range[0]];
						return fixer.replaceTextRange(range, "\n");
					}
				});
			},
			"VElement:exit"(node) {
				if (inIgnoreElement === node) inIgnoreElement = null;
			}
		});
	}
};

//#endregion
exports.default = multiline_html_element_content_newline_default;