
//#region lib/utils/casing.ts
/**
* Capitalize a string.
*/
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
* Checks whether the given string has symbols.
*/
function hasSymbols(str) {
	return /[!"#%&'()*+,./:;<=>?@[\\\]^`{|}]/u.exec(str) != null;
}
/**
* Checks whether the given string has uppercase.
*/
function hasUpper(str) {
	return /[A-Z]/u.exec(str) != null;
}
/**
* Convert text to kebab-case
*/
function kebabCase(str) {
	return str.replaceAll("_", "-").replaceAll(/\B([A-Z])/gu, "-$1").toLowerCase();
}
/**
* Checks whether the given string is kebab-case.
*/
function isKebabCase(str) {
	return !hasUpper(str) && !hasSymbols(str) && !str.startsWith("-") && !/_|--|\s/u.test(str);
}
/**
* Convert text to snake_case
*/
function snakeCase(str) {
	return str.replaceAll(/\B([A-Z])/gu, "_$1").replaceAll("-", "_").toLowerCase();
}
/**
* Checks whether the given string is snake_case.
*/
function isSnakeCase(str) {
	return !hasUpper(str) && !hasSymbols(str) && !/-|__|\s/u.test(str);
}
/**
* Convert text to camelCase
*/
function camelCase(str) {
	if (isPascalCase(str)) return str.charAt(0).toLowerCase() + str.slice(1);
	return str.replaceAll(/[-_](\w)/gu, (_, c) => c ? c.toUpperCase() : "");
}
/**
* Checks whether the given string is camelCase.
*/
function isCamelCase(str) {
	return !hasSymbols(str) && !/^[A-Z]/u.test(str) && !/-|_|\s/u.test(str);
}
/**
* Convert text to PascalCase
*/
function pascalCase(str) {
	return capitalize(camelCase(str));
}
/**
* Checks whether the given string is PascalCase.
*/
function isPascalCase(str) {
	return !hasSymbols(str) && !/^[a-z]/u.test(str) && !/-|_|\s/u.test(str);
}
const convertersMap = {
	"kebab-case": kebabCase,
	snake_case: snakeCase,
	camelCase,
	PascalCase: pascalCase
};
const checkersMap = {
	"kebab-case": isKebabCase,
	snake_case: isSnakeCase,
	camelCase: isCamelCase,
	PascalCase: isPascalCase
};
/**
* Return case checker
*/
function getChecker(name) {
	return checkersMap[name] || isPascalCase;
}
/**
* Return case converter
*/
function getConverter(name) {
	return convertersMap[name] || pascalCase;
}
/**
* Return case exact converter.
* If the converted result is not in correct case, the original value is returned.
*/
function getExactConverter(name) {
	const converter = getConverter(name);
	const checker = getChecker(name);
	return (str) => {
		const result = converter(str);
		return checker(result) ? result : str;
	};
}
const allowedCaseOptions = [
	"camelCase",
	"kebab-case",
	"PascalCase"
];

//#endregion
exports.allowedCaseOptions = allowedCaseOptions;
exports.camelCase = camelCase;
exports.capitalize = capitalize;
exports.getChecker = getChecker;
exports.getConverter = getConverter;
exports.getExactConverter = getExactConverter;
exports.isCamelCase = isCamelCase;
exports.isKebabCase = isKebabCase;
exports.isPascalCase = isPascalCase;
exports.kebabCase = kebabCase;
exports.pascalCase = pascalCase;