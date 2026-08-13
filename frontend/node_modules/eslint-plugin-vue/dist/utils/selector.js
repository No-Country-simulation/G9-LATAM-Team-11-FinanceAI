const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('./index.js');
let postcss_selector_parser = require("postcss-selector-parser");
postcss_selector_parser = require_runtime.__toESM(postcss_selector_parser);
let nth_check = require("nth-check");
nth_check = require_runtime.__toESM(nth_check);

//#region lib/utils/selector.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* Parses CSS selectors and returns an object with a function that tests VElement.
*/
function parseSelector(selector, context) {
	let astSelector;
	try {
		astSelector = (0, postcss_selector_parser.default)().astSync(selector);
	} catch {
		context.report({
			loc: {
				line: 0,
				column: 0
			},
			message: `Cannot parse selector: ${selector}.`
		});
		return { test: () => false };
	}
	try {
		const test = selectorsToVElementMatcher(astSelector.nodes);
		return { test(element) {
			return test(element, null);
		} };
	} catch (error) {
		if (error instanceof SelectorError) {
			context.report({
				loc: {
					line: 0,
					column: 0
				},
				message: error.message
			});
			return { test: () => false };
		}
		throw error;
	}
}
var SelectorError = class extends Error {};
/**
* Convert nodes to VElementMatcher
*/
function selectorsToVElementMatcher(selectorNodes) {
	const selectors = selectorNodes.map((n) => selectorToVElementMatcher(cleanSelectorChildren(n)));
	return (element, subject) => selectors.some((sel) => sel(element, subject));
}
function isDescendantCombinator(node) {
	return Boolean(node && node.type === "combinator" && !node.value.trim());
}
/**
* Clean and get the selector child nodes.
*/
function cleanSelectorChildren(selector) {
	const nodes = [];
	let last = null;
	for (const node of selector.nodes) {
		if (node.type === "root") throw new SelectorError("Unexpected state type=root");
		if (node.type === "comment") continue;
		if ((last == null || last.type === "combinator") && isDescendantCombinator(node)) continue;
		if (isDescendantCombinator(last) && node.type === "combinator") nodes.pop();
		nodes.push(node);
		last = node;
	}
	if (isDescendantCombinator(last)) nodes.pop();
	return nodes;
}
/**
* Convert Selector child nodes to VElementMatcher
*/
function selectorToVElementMatcher(selectorChildren) {
	const nodes = [...selectorChildren];
	let node = nodes.shift();
	let result = null;
	while (node) {
		if (node.type === "combinator") {
			const combinator = node.value;
			node = nodes.shift();
			if (!node) throw new SelectorError(`Expected selector after '${combinator}'.`);
			if (node.type === "combinator") throw new SelectorError(`Unexpected combinator '${node.value}'.`);
			const right = nodeToVElementMatcher(node);
			result = combination(result || ((element, subject) => element === subject), combinator, right);
		} else {
			const sel = nodeToVElementMatcher(node);
			result = result ? compound(result, sel) : sel;
		}
		node = nodes.shift();
	}
	if (!result) throw new SelectorError(`Unexpected empty selector.`);
	return result;
}
function combination(left, combinator, right) {
	switch (combinator.trim()) {
		case "": return (element, subject) => {
			if (right(element, null)) {
				let parent = element.parent;
				while (parent.type === "VElement") {
					if (left(parent, subject)) return true;
					parent = parent.parent;
				}
			}
			return false;
		};
		case ">": return (element, subject) => {
			if (right(element, null)) {
				const parent = element.parent;
				if (parent.type === "VElement") return left(parent, subject);
			}
			return false;
		};
		case "+": return (element, subject) => {
			if (right(element, null)) {
				const before = getBeforeElement(element);
				if (before) return left(before, subject);
			}
			return false;
		};
		case "~": return (element, subject) => {
			if (right(element, null)) {
				for (const before of getBeforeElements(element)) if (left(before, subject)) return true;
			}
			return false;
		};
		default: throw new SelectorError(`Unknown combinator: ${combinator}.`);
	}
}
/**
* Convert node to VElementMatcher
*/
function nodeToVElementMatcher(selector) {
	switch (selector.type) {
		case "attribute": return attributeNodeToVElementMatcher(selector);
		case "class": return classNameNodeToVElementMatcher(selector);
		case "id": return identifierNodeToVElementMatcher(selector);
		case "tag": return tagNodeToVElementMatcher(selector);
		case "universal": return universalNodeToVElementMatcher(selector);
		case "pseudo": return pseudoNodeToVElementMatcher(selector);
		case "nesting": throw new SelectorError("Unsupported nesting selector.");
		case "string": throw new SelectorError(`Unknown selector: ${selector.value}.`);
		default: throw new SelectorError(`Unknown selector: ${selector.value}.`);
	}
}
/**
* Convert Attribute node to VElementMatcher
*/
function attributeNodeToVElementMatcher(selector) {
	const key = selector.attribute;
	if (!selector.operator) return (element) => getAttributeValue(element, key) != null;
	const value = selector.value || "";
	switch (selector.operator) {
		case "=": return buildVElementMatcher(value, (attr, val) => attr === val);
		case "~=": return buildVElementMatcher(value, (attr, val) => attr.split(/\s+/gu).includes(val));
		case "|=": return buildVElementMatcher(value, (attr, val) => attr === val || attr.startsWith(`${val}-`));
		case "^=": return buildVElementMatcher(value, (attr, val) => attr.startsWith(val));
		case "$=": return buildVElementMatcher(value, (attr, val) => attr.endsWith(val));
		case "*=": return buildVElementMatcher(value, (attr, val) => attr.includes(val));
		default: throw new SelectorError(`Unsupported operator: ${selector.operator}.`);
	}
	function buildVElementMatcher(selectorValue, test) {
		const val = selector.insensitive ? selectorValue.toLowerCase() : selectorValue;
		return (element) => {
			const attrValue = getAttributeValue(element, key);
			if (attrValue == null) return false;
			return test(selector.insensitive ? attrValue.toLowerCase() : attrValue, val);
		};
	}
}
/**
* Convert ClassName node to VElementMatcher
*/
function classNameNodeToVElementMatcher(selector) {
	const className = selector.value;
	return (element) => {
		const attrValue = getAttributeValue(element, "class");
		if (attrValue == null) return false;
		return attrValue.split(/\s+/gu).includes(className);
	};
}
/**
* Convert Identifier node to VElementMatcher
*/
function identifierNodeToVElementMatcher(selector) {
	const id = selector.value;
	return (element) => {
		const attrValue = getAttributeValue(element, "id");
		if (attrValue == null) return false;
		return attrValue === id;
	};
}
/**
* Convert Tag node to VElementMatcher
*/
function tagNodeToVElementMatcher(selector) {
	const name = selector.value;
	return (element) => element.rawName === name;
}
/**
* Convert Universal node to VElementMatcher
*/
function universalNodeToVElementMatcher(_selector) {
	return () => true;
}
/**
* Convert Pseudo node to VElementMatcher
*/
function pseudoNodeToVElementMatcher(selector) {
	const pseudo = selector.value;
	switch (pseudo) {
		case ":not": {
			const selectors = selectorsToVElementMatcher(selector.nodes);
			return (element, subject) => !selectors(element, subject);
		}
		case ":is":
		case ":where": return selectorsToVElementMatcher(selector.nodes);
		case ":has": return pseudoHasSelectorsToVElementMatcher(selector.nodes);
		case ":empty": return (element) => element.children.every((child) => child.type === "VText" && !child.value.trim());
		case ":nth-child": return buildPseudoNthVElementMatcher(parseNth(selector));
		case ":nth-last-child": {
			const nth = parseNth(selector);
			return buildPseudoNthVElementMatcher((index, length) => nth(length - index - 1));
		}
		case ":first-child": return buildPseudoNthVElementMatcher((index) => index === 0);
		case ":last-child": return buildPseudoNthVElementMatcher((index, length) => index === length - 1);
		case ":only-child": return buildPseudoNthVElementMatcher((index, length) => index === 0 && length === 1);
		case ":nth-of-type": return buildPseudoNthOfTypeVElementMatcher(parseNth(selector));
		case ":nth-last-of-type": {
			const nth = parseNth(selector);
			return buildPseudoNthOfTypeVElementMatcher((index, length) => nth(length - index - 1));
		}
		case ":first-of-type": return buildPseudoNthOfTypeVElementMatcher((index) => index === 0);
		case ":last-of-type": return buildPseudoNthOfTypeVElementMatcher((index, length) => index === length - 1);
		case ":only-of-type": return buildPseudoNthOfTypeVElementMatcher((index, length) => index === 0 && length === 1);
		default: throw new SelectorError(`Unsupported pseudo selector: ${pseudo}.`);
	}
}
/**
* Convert :has() selector nodes to VElementMatcher
*/
function pseudoHasSelectorsToVElementMatcher(selectorNodes) {
	const selectors = selectorNodes.map((n) => pseudoHasSelectorToVElementMatcher(n));
	return (element, subject) => selectors.some((sel) => sel(element, subject));
}
/**
* Convert :has() selector node to VElementMatcher
*/
function pseudoHasSelectorToVElementMatcher(selector) {
	const nodes = cleanSelectorChildren(selector);
	const selectors = selectorToVElementMatcher(nodes);
	const firstNode = nodes[0];
	if (firstNode.type === "combinator" && (firstNode.value === "+" || firstNode.value === "~")) return buildVElementMatcher(selectors, (element) => getAfterElements(element));
	return buildVElementMatcher(selectors, (element) => element.children.filter(import_utils.default.isVElement));
}
function buildVElementMatcher(selectors, getStartElements) {
	return (element) => {
		const elements = [...getStartElements(element)];
		let curr;
		while (curr = elements.shift()) {
			const el = curr;
			if (selectors(el, element)) return true;
			elements.push(...el.children.filter(import_utils.default.isVElement));
		}
		return false;
	};
}
/**
* Parse <nth>
*/
function parseNth(pseudoNode) {
	const argumentsText = pseudoNode.toString().slice(pseudoNode.value.length).toLowerCase();
	const openParenIndex = argumentsText.indexOf("(");
	const closeParenIndex = argumentsText.lastIndexOf(")");
	if (openParenIndex === -1 || closeParenIndex === -1) throw new SelectorError(`Cannot parse An+B micro syntax (:nth-xxx() argument): ${argumentsText}.`);
	const argument = argumentsText.slice(openParenIndex + 1, closeParenIndex).trim();
	try {
		return (0, nth_check.default)(argument);
	} catch {
		throw new SelectorError(`Cannot parse An+B micro syntax (:nth-xxx() argument): '${argument}'.`);
	}
}
/**
* Build VElementMatcher for :nth-xxx()
*/
function buildPseudoNthVElementMatcher(testIndex) {
	return (element) => {
		const elements = element.parent.children.filter(import_utils.default.isVElement);
		return testIndex(elements.indexOf(element), elements.length);
	};
}
/**
* Build VElementMatcher for :nth-xxx-of-type()
*/
function buildPseudoNthOfTypeVElementMatcher(testIndex) {
	return (element) => {
		const elements = element.parent.children.filter((e) => import_utils.default.isVElement(e) && e.rawName === element.rawName);
		return testIndex(elements.indexOf(element), elements.length);
	};
}
function getBeforeElement(element) {
	return getBeforeElements(element).pop() || null;
}
function getBeforeElements(element) {
	const parent = element.parent;
	const index = parent.children.indexOf(element);
	return parent.children.slice(0, index).filter(import_utils.default.isVElement);
}
function getAfterElements(element) {
	const parent = element.parent;
	const index = parent.children.indexOf(element);
	return parent.children.slice(index + 1).filter(import_utils.default.isVElement);
}
function compound(a, b) {
	return (element, subject) => a(element, subject) && b(element, subject);
}
/**
* Get attribute value from given element.
*/
function getAttributeValue(element, attribute) {
	const attr = import_utils.default.getAttribute(element, attribute);
	if (attr) return attr.value && attr.value.value || "";
	return null;
}

//#endregion
exports.parseSelector = parseSelector;