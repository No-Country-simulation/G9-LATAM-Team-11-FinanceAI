const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_indent_common = require('../utils/indent-common.js');

//#region lib/rules/html-indent.ts
/**
* @author Toru Nagashima
* @copyright 2016 Toru Nagashima. All rights reserved.
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var html_indent_default = {
	create(context) {
		const sourceCode = context.sourceCode;
		const visitor = require_indent_common.defineVisitor(context, sourceCode.parserServices.getTemplateBodyTokenStore && sourceCode.parserServices.getTemplateBodyTokenStore(), { baseIndent: 1 });
		return import_utils.default.defineTemplateBodyVisitor(context, visitor);
	},
	meta: {
		type: "layout",
		docs: {
			description: "enforce consistent indentation in `<template>`",
			categories: ["vue3-strongly-recommended", "vue2-strongly-recommended"],
			url: "https://eslint.vuejs.org/rules/html-indent.html"
		},
		fixable: "whitespace",
		schema: [{ oneOf: [{
			type: "integer",
			minimum: 1
		}, { enum: ["tab"] }] }, {
			type: "object",
			properties: {
				attribute: {
					type: "integer",
					minimum: 0
				},
				baseIndent: {
					type: "integer",
					minimum: 0
				},
				closeBracket: { oneOf: [{
					type: "integer",
					minimum: 0
				}, {
					type: "object",
					properties: {
						startTag: {
							type: "integer",
							minimum: 0
						},
						endTag: {
							type: "integer",
							minimum: 0
						},
						selfClosingTag: {
							type: "integer",
							minimum: 0
						}
					},
					additionalProperties: false
				}] },
				switchCase: {
					type: "integer",
					minimum: 0
				},
				alignAttributesVertically: { type: "boolean" },
				ignores: {
					type: "array",
					items: { allOf: [
						{ type: "string" },
						{ not: {
							type: "string",
							pattern: ":exit$"
						} },
						{ not: {
							type: "string",
							pattern: String.raw`^\s*$`
						} }
					] },
					uniqueItems: true,
					additionalItems: false
				}
			},
			additionalProperties: false
		}]
	}
};

//#endregion
exports.default = html_indent_default;