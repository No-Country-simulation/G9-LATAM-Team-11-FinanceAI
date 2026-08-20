
//#region lib/utils/indent-utils.ts
/**
* Check whether the given token is a wildcard.
*/
function isWildcard(token) {
	return token != null && token.type === "Punctuator" && token.value === "*";
}
/**
* Check whether the given token is an extends keyword.
*/
function isExtendsKeyword(token) {
	return token != null && token.type === "Keyword" && token.value === "extends";
}
/**
* Check whether the given token is a whitespace.
*/
function isNotWhitespace(token) {
	return token != null && token.type !== "HTMLWhitespace" && (token.type !== "JSXText" || !!token.value.trim());
}
/**
* Check whether the given token is a comment.
*/
function isComment(token) {
	return token != null && (token.type === "Block" || token.type === "Line" || token.type === "Shebang" || typeof token.type === "string" && token.type.endsWith("Comment"));
}
/**
* Check whether the given token is a comment.
*/
function isNotComment(token) {
	return token != null && token.type !== "Block" && token.type !== "Line" && token.type !== "Shebang" && !(typeof token.type === "string" && token.type.endsWith("Comment"));
}
/**
* Check whether the given node is not an empty text node.
*/
function isNotEmptyTextNode(node) {
	return !(node.type === "VText" && node.value.trim() === "");
}
/**
* Check whether the given token is a pipe operator.
*/
function isPipeOperator(token) {
	return token != null && token.type === "Punctuator" && token.value === "|";
}
/**
* Get the last element.
*/
function last(xs) {
	return xs.length === 0 ? void 0 : xs.at(-1);
}

//#endregion
exports.isComment = isComment;
exports.isExtendsKeyword = isExtendsKeyword;
exports.isNotComment = isNotComment;
exports.isNotEmptyTextNode = isNotEmptyTextNode;
exports.isNotWhitespace = isNotWhitespace;
exports.isPipeOperator = isPipeOperator;
exports.isWildcard = isWildcard;
exports.last = last;