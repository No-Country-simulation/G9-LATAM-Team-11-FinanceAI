
//#region lib/utils/comments.ts
const isJSDocComment = (node) => node.type === "Block" && node.value.charAt(0) === "*" && node.value.charAt(1) !== "*";
const isBlockComment = (node) => node.type === "Block" && (node.value.charAt(0) !== "*" || node.value.charAt(1) === "*");

//#endregion
exports.isBlockComment = isBlockComment;
exports.isJSDocComment = isJSDocComment;