const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_index$1 = require('../utils/style-variables/index.js');
let _eslint_community_eslint_utils = require("@eslint-community/eslint-utils");

//#region lib/rules/no-extra-parens.ts
/**
* @author Yosuke Ota
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var no_extra_parens_default = import_utils.default.wrapStylisticOrCoreRule("no-extra-parens", {
	skipDynamicArguments: true,
	applyDocument: true,
	create: createForVueSyntax
});
/**
* Check whether the given token is a left parenthesis.
*/
function isLeftParen(token) {
	return token.type === "Punctuator" && token.value === "(";
}
/**
* Check whether the given token is a right parenthesis.
*/
function isRightParen(token) {
	return token.type === "Punctuator" && token.value === ")";
}
/**
* Check whether the given token is a left brace.
*/
function isLeftBrace(token) {
	return token.type === "Punctuator" && token.value === "{";
}
/**
* Check whether the given token is a right brace.
*/
function isRightBrace(token) {
	return token.type === "Punctuator" && token.value === "}";
}
/**
* Check whether the given token is a left bracket.
*/
function isLeftBracket(token) {
	return token.type === "Punctuator" && token.value === "[";
}
/**
* Check whether the given token is a right bracket.
*/
function isRightBracket(token) {
	return token.type === "Punctuator" && token.value === "]";
}
/**
* Determines if a given expression node is an IIFE
*/
function isIIFE(node) {
	return node.type === "CallExpression" && node.callee.type === "FunctionExpression";
}
function createForVueSyntax(context) {
	const sourceCode = context.sourceCode;
	if (!sourceCode.parserServices.getTemplateBodyTokenStore) return {};
	const tokenStore = sourceCode.parserServices.getTemplateBodyTokenStore();
	/**
	* Checks if the given node turns into a filter when unwraped.
	*/
	function isUnwrapChangeToFilter(expression) {
		let parenStack = null;
		for (const token of tokenStore.getTokens(expression)) {
			if (parenStack) {
				if (parenStack.isUpToken(token)) {
					parenStack = parenStack.upper;
					continue;
				}
			} else if (token.value === "|") return true;
			if (isLeftParen(token)) parenStack = {
				isUpToken: isRightParen,
				upper: parenStack
			};
			else if (isLeftBracket(token)) parenStack = {
				isUpToken: isRightBracket,
				upper: parenStack
			};
			else if (isLeftBrace(token)) parenStack = {
				isUpToken: isRightBrace,
				upper: parenStack
			};
		}
		return false;
	}
	/**
	* Checks if the given node is CSS v-bind() without quote.
	*/
	function isStyleVariableWithoutQuote(node, expression) {
		const styleVars = require_index$1.getStyleVariablesContext(context);
		if (!styleVars || !styleVars.vBinds.includes(node)) return false;
		const vBindToken = tokenStore.getFirstToken(node);
		return tokenStore.getTokensBetween(vBindToken, expression).every(isLeftParen);
	}
	function verify(node) {
		if (!node.expression) return;
		const expression = node.expression.type === "VFilterSequenceExpression" ? node.expression.expression : node.expression;
		if (!(0, _eslint_community_eslint_utils.isParenthesized)(expression, tokenStore)) return;
		if (!(0, _eslint_community_eslint_utils.isParenthesized)(2, expression, tokenStore)) {
			if (isIIFE(expression) && !(0, _eslint_community_eslint_utils.isParenthesized)(expression.callee, tokenStore)) return;
			if (isUnwrapChangeToFilter(expression)) return;
			if (isStyleVariableWithoutQuote(node, expression)) return;
		}
		report(expression);
	}
	/**
	* Report the node
	*/
	function report(node) {
		const sourceCode = context.sourceCode;
		const leftParenToken = tokenStore.getTokenBefore(node);
		const rightParenToken = tokenStore.getTokenAfter(node);
		context.report({
			node,
			loc: leftParenToken.loc,
			messageId: "unexpected",
			fix(fixer) {
				const parenthesizedSource = sourceCode.text.slice(leftParenToken.range[1], rightParenToken.range[0]);
				return fixer.replaceTextRange([leftParenToken.range[0], rightParenToken.range[1]], parenthesizedSource);
			}
		});
	}
	return {
		"VAttribute[directive=true][key.name.name='bind'] > VExpressionContainer": verify,
		"VElement > VExpressionContainer": verify
	};
}

//#endregion
exports.default = no_extra_parens_default;