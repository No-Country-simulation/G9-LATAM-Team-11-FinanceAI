const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_comments = require('../utils/comments.js');

//#region lib/rules/require-prop-comment.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var require_prop_comment_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "require props to have a comment",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/require-prop-comment.html"
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { type: { enum: [
				"JSDoc",
				"line",
				"block",
				"any"
			] } },
			additionalProperties: false
		}],
		messages: {
			requireAnyComment: "The \"{{name}}\" property should have a comment.",
			requireLineComment: "The \"{{name}}\" property should have a line comment.",
			requireBlockComment: "The \"{{name}}\" property should have a block comment.",
			requireJSDocComment: "The \"{{name}}\" property should have a JSDoc comment."
		}
	},
	create(context) {
		const schema = context.options[0];
		const type = schema && schema.type || "JSDoc";
		const sourceCode = context.sourceCode;
		const verifyBlock = (comment) => comment && require_comments.isBlockComment(comment) ? void 0 : "requireBlockComment";
		const verifyLine = (comment) => comment && comment.type === "Line" ? void 0 : "requireLineComment";
		const verifyAny = (comment) => comment ? void 0 : "requireAnyComment";
		const verifyJSDoc = (comment) => comment && require_comments.isJSDocComment(comment) ? void 0 : "requireJSDocComment";
		function verifyProps(props) {
			for (const prop of props) {
				if (!prop.propName || prop.type === "infer-type") continue;
				const lastPrecedingComment = sourceCode.getCommentsBefore(prop.node).at(-1);
				let messageId;
				switch (type) {
					case "block":
						messageId = verifyBlock(lastPrecedingComment);
						break;
					case "line":
						messageId = verifyLine(lastPrecedingComment);
						break;
					case "any":
						messageId = verifyAny(lastPrecedingComment);
						break;
					default:
						messageId = verifyJSDoc(lastPrecedingComment);
						break;
				}
				if (!messageId) continue;
				context.report({
					node: prop.node,
					messageId,
					data: { name: prop.propName }
				});
			}
		}
		return import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, { onDefinePropsEnter(_node, props) {
			verifyProps(props);
		} }), import_utils.default.defineVueVisitor(context, { onVueObjectEnter(node) {
			verifyProps(import_utils.default.getComponentPropsFromOptions(node));
		} }));
	}
};

//#endregion
exports.default = require_prop_comment_default;