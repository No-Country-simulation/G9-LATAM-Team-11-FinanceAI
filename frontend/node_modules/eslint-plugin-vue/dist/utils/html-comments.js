const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('./index.js');

//#region lib/utils/html-comments.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const COMMENT_DIRECTIVE = /^\s*eslint-(?:en|dis)able/;
const IE_CONDITIONAL_IF = /^\[if\s+/;
const IE_CONDITIONAL_ENDIF = /\[endif]$/;
const TYPE_HTML_COMMENT_OPEN = "HTMLCommentOpen";
const TYPE_HTML_COMMENT_OPEN_DECORATION = "HTMLCommentOpenDecoration";
const TYPE_HTML_COMMENT_VALUE = "HTMLCommentValue";
const TYPE_HTML_COMMENT_CLOSE = "HTMLCommentClose";
const TYPE_HTML_COMMENT_CLOSE_DECORATION = "HTMLCommentCloseDecoration";
function isCommentDirective(comment) {
	return COMMENT_DIRECTIVE.test(comment.value);
}
function isIEConditionalComment(comment) {
	return IE_CONDITIONAL_IF.test(comment.value) || IE_CONDITIONAL_ENDIF.test(comment.value);
}
/**
* Define HTML comment parser
*/
function defineParser(sourceCode, config) {
	config = config || {};
	const exceptions = config.exceptions || [];
	/**
	* Get a open decoration string from comment contents.
	*/
	function getOpenDecoration(contents) {
		let decoration = "";
		for (const exception of exceptions) {
			const length = exception.length;
			let index = 0;
			while (contents.startsWith(exception, index)) index += length;
			const exceptionLength = index;
			if (decoration.length < exceptionLength) decoration = contents.slice(0, exceptionLength);
		}
		return decoration;
	}
	/**
	* Get a close decoration string from comment contents.
	*/
	function getCloseDecoration(contents) {
		let decoration = "";
		for (const exception of exceptions) {
			const length = exception.length;
			let index = contents.length;
			while (contents.endsWith(exception, index)) index -= length;
			const exceptionLength = contents.length - index;
			if (decoration.length < exceptionLength) decoration = contents.slice(index);
		}
		return decoration;
	}
	/**
	* Parse HTMLComment.
	*/
	return function parseHTMLComment(node) {
		if (node.type !== "HTMLComment") return null;
		const htmlCommentText = sourceCode.getText(node);
		if (!htmlCommentText.startsWith("<!--") || !htmlCommentText.endsWith("-->")) return null;
		let valueText = htmlCommentText.slice(4, -3);
		const openDecorationText = getOpenDecoration(valueText);
		valueText = valueText.slice(openDecorationText.length);
		const firstCharIndex = valueText.search(/\S/);
		const beforeSpace = firstCharIndex >= 0 ? valueText.slice(0, firstCharIndex) : valueText;
		valueText = valueText.slice(beforeSpace.length);
		const closeDecorationText = getCloseDecoration(valueText);
		if (closeDecorationText) valueText = valueText.slice(0, -closeDecorationText.length);
		const lastCharIndex = valueText.search(/\S\s*$/);
		const afterSpace = lastCharIndex >= 0 ? valueText.slice(lastCharIndex + 1) : valueText;
		if (afterSpace) valueText = valueText.slice(0, -afterSpace.length);
		let tokenIndex = node.range[0];
		const createToken = (type, value) => {
			const range = [tokenIndex, tokenIndex + value.length];
			tokenIndex = range[1];
			let loc;
			return {
				type,
				value,
				range,
				get loc() {
					if (loc) return loc;
					return loc = {
						start: sourceCode.getLocFromIndex(range[0]),
						end: sourceCode.getLocFromIndex(range[1])
					};
				}
			};
		};
		const open = createToken(TYPE_HTML_COMMENT_OPEN, "<!--");
		const openDecoration = openDecorationText ? createToken(TYPE_HTML_COMMENT_OPEN_DECORATION, openDecorationText) : null;
		tokenIndex += beforeSpace.length;
		const value = valueText ? createToken(TYPE_HTML_COMMENT_VALUE, valueText) : null;
		tokenIndex += afterSpace.length;
		return {
			open,
			openDecoration,
			value,
			closeDecoration: closeDecorationText ? createToken(TYPE_HTML_COMMENT_CLOSE_DECORATION, closeDecorationText) : null,
			close: createToken(TYPE_HTML_COMMENT_CLOSE, "-->")
		};
	};
}
/**
* Define HTML comment visitor
*/
function defineVisitor(context, config, visitHTMLComment, visitorOption) {
	return { Program(node) {
		visitorOption = visitorOption || {};
		if (import_utils.default.hasInvalidEOF(node)) return;
		if (!node.templateBody) return;
		const parse = defineParser(context.sourceCode, config);
		for (const comment of node.templateBody.comments) {
			if (comment.type !== "HTMLComment") continue;
			if (!visitorOption.includeDirectives && isCommentDirective(comment)) continue;
			if (isIEConditionalComment(comment)) continue;
			const tokens = parse(comment);
			if (tokens) visitHTMLComment(tokens);
		}
	} };
}

//#endregion
exports.defineVisitor = defineVisitor;