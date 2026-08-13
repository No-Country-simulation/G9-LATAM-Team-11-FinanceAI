const require_indent_common = require('../utils/indent-common.js');

//#region lib/rules/script-indent.ts
/**
* @author Toru Nagashima
* See LICENSE file in root directory for full license.
*/
var script_indent_default = {
	meta: {
		type: "layout",
		docs: {
			description: "enforce consistent indentation in `<script>`",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/script-indent.html"
		},
		fixable: "whitespace",
		schema: [{ oneOf: [{
			type: "integer",
			minimum: 1
		}, { enum: ["tab"] }] }, {
			type: "object",
			properties: {
				baseIndent: {
					type: "integer",
					minimum: 0
				},
				switchCase: {
					type: "integer",
					minimum: 0
				},
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
	},
	create(context) {
		return require_indent_common.defineVisitor(context, context.sourceCode, {});
	}
};

//#endregion
exports.default = script_indent_default;