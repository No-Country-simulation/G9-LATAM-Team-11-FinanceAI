const require_html_comments = require('../utils/html-comments.js');

//#region lib/rules/html-comment-content-spacing.ts
var html_comment_content_spacing_default = {
	meta: {
		type: "layout",
		docs: {
			description: "enforce unified spacing in HTML comments",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/html-comment-content-spacing.html"
		},
		fixable: "whitespace",
		schema: [{ enum: ["always", "never"] }, {
			type: "object",
			properties: { exceptions: {
				type: "array",
				items: { type: "string" }
			} },
			additionalProperties: false
		}],
		messages: {
			expectedAfterHTMLCommentOpen: "Expected space after '<!--'.",
			expectedBeforeHTMLCommentOpen: "Expected space before '-->'.",
			expectedAfterExceptionBlock: "Expected space after exception block.",
			expectedBeforeExceptionBlock: "Expected space before exception block.",
			unexpectedAfterHTMLCommentOpen: "Unexpected space after '<!--'.",
			unexpectedBeforeHTMLCommentOpen: "Unexpected space before '-->'."
		}
	},
	create(context) {
		const requireSpace = context.options[0] !== "never";
		return require_html_comments.defineVisitor(context, context.options[1], (comment) => {
			checkCommentOpen(comment);
			checkCommentClose(comment);
		}, { includeDirectives: true });
		/**
		* Reports the space before the contents of a given comment if it's invalid.
		*/
		function checkCommentOpen(comment) {
			const { value, openDecoration, open } = comment;
			if (!value) return;
			const beforeToken = openDecoration || open;
			if (beforeToken.loc.end.line !== value.loc.start.line) return;
			if (requireSpace) {
				if (beforeToken.range[1] < value.range[0]) return;
				context.report({
					loc: {
						start: beforeToken.loc.end,
						end: value.loc.start
					},
					messageId: openDecoration ? "expectedAfterExceptionBlock" : "expectedAfterHTMLCommentOpen",
					fix: openDecoration ? void 0 : (fixer) => fixer.insertTextAfter(beforeToken, " ")
				});
			} else {
				if (openDecoration) return;
				if (beforeToken.range[1] === value.range[0]) return;
				context.report({
					loc: {
						start: beforeToken.loc.end,
						end: value.loc.start
					},
					messageId: "unexpectedAfterHTMLCommentOpen",
					fix: (fixer) => fixer.removeRange([beforeToken.range[1], value.range[0]])
				});
			}
		}
		/**
		* Reports the space after the contents of a given comment if it's invalid.
		*/
		function checkCommentClose(comment) {
			const { value, closeDecoration, close } = comment;
			if (!value) return;
			const afterToken = closeDecoration || close;
			if (value.loc.end.line !== afterToken.loc.start.line) return;
			if (requireSpace) {
				if (value.range[1] < afterToken.range[0]) return;
				context.report({
					loc: {
						start: value.loc.end,
						end: afterToken.loc.start
					},
					messageId: closeDecoration ? "expectedBeforeExceptionBlock" : "expectedBeforeHTMLCommentOpen",
					fix: closeDecoration ? void 0 : (fixer) => fixer.insertTextBefore(afterToken, " ")
				});
			} else {
				if (closeDecoration) return;
				if (value.range[1] === afterToken.range[0]) return;
				context.report({
					loc: {
						start: value.loc.end,
						end: afterToken.loc.start
					},
					messageId: "unexpectedBeforeHTMLCommentOpen",
					fix: (fixer) => fixer.removeRange([value.range[1], afterToken.range[0]])
				});
			}
		}
	}
};

//#endregion
exports.default = html_comment_content_spacing_default;