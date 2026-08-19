const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-bare-strings-in-template.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const DEFAULT_ALLOWLIST = [
	"(",
	")",
	",",
	".",
	"&",
	"+",
	"-",
	"=",
	"*",
	"/",
	"#",
	"%",
	"!",
	"?",
	":",
	"[",
	"]",
	"{",
	"}",
	"<",
	">",
	"·",
	"•",
	"‐",
	"–",
	"—",
	"−",
	"|"
];
const DEFAULT_ATTRIBUTES = {
	"/.+/": [
		"title",
		"aria-label",
		"aria-placeholder",
		"aria-roledescription",
		"aria-valuetext"
	],
	input: ["placeholder"],
	img: ["alt"]
};
const DEFAULT_DIRECTIVES = ["v-text"];
/**
* Parse attributes option
*/
function parseTargetAttrs(options) {
	const result = {
		names: {},
		regexps: [],
		cache: {}
	};
	for (const tagName of Object.keys(options)) {
		const attrs = new Set(options[tagName]);
		if (require_regexp.isRegExp(tagName)) result.regexps.push({
			name: require_regexp.toRegExp(tagName),
			attrs
		});
		else result.names[tagName] = attrs;
	}
	return result;
}
/**
* Get a string from given expression container node
*/
function getStringValue(value) {
	const expression = value.expression;
	if (!expression) return null;
	if (expression.type !== "Literal") return null;
	if (typeof expression.value === "string") return expression.value;
	return null;
}
var no_bare_strings_in_template_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow the use of bare strings in `<template>`",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-bare-strings-in-template.html"
		},
		schema: [{
			type: "object",
			properties: {
				allowlist: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true
				},
				attributes: {
					type: "object",
					patternProperties: { "^(?:\\S+|/.*/[a-z]*)$": {
						type: "array",
						items: { type: "string" },
						uniqueItems: true
					} },
					additionalProperties: false
				},
				directives: {
					type: "array",
					items: {
						type: "string",
						pattern: "^v-"
					},
					uniqueItems: true
				}
			},
			additionalProperties: false
		}],
		messages: {
			unexpected: "Unexpected non-translated string used.",
			unexpectedInAttr: "Unexpected non-translated string used in `{{attr}}`."
		}
	},
	create(context) {
		const opts = context.options[0] || {};
		const rawAllowlist = opts.allowlist || DEFAULT_ALLOWLIST;
		const attributes = parseTargetAttrs(opts.attributes || DEFAULT_ATTRIBUTES);
		const directives = opts.directives || DEFAULT_DIRECTIVES;
		const stringAllowlist = [];
		const regexAllowlist = [];
		for (const item of rawAllowlist) if (require_regexp.isRegExp(item)) regexAllowlist.push(require_regexp.toRegExp(item));
		else stringAllowlist.push(item);
		const allowlistRe = stringAllowlist.length > 0 ? new RegExp(stringAllowlist.map((w) => require_regexp.escape(w)).sort((a, b) => b.length - a.length).join("|"), "gu") : null;
		let elementStack = null;
		/**
		* Gets the bare string from given string
		*/
		function getBareString(str) {
			let result = str.trim();
			if (allowlistRe) result = result.replace(allowlistRe, "");
			for (const regex of regexAllowlist) {
				const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
				const globalRegex = new RegExp(regex.source, flags);
				result = result.replace(globalRegex, "");
			}
			return result.trim();
		}
		/**
		* Get the attribute to be verified from the element name.
		*/
		function getTargetAttrs(tagName) {
			if (attributes.cache[tagName]) return attributes.cache[tagName];
			const result = [];
			if (attributes.names[tagName]) result.push(...attributes.names[tagName]);
			for (const { name, attrs } of attributes.regexps) {
				name.lastIndex = 0;
				if (name.test(tagName)) result.push(...attrs);
			}
			if (require_casing.isKebabCase(tagName)) result.push(...getTargetAttrs(require_casing.pascalCase(tagName)));
			return attributes.cache[tagName] = new Set(result);
		}
		return import_utils.default.defineTemplateBodyVisitor(context, {
			VText(node) {
				if (getBareString(node.value)) context.report({
					node,
					messageId: "unexpected"
				});
			},
			VElement(node) {
				elementStack = {
					upper: elementStack,
					name: node.rawName,
					attrs: getTargetAttrs(node.rawName)
				};
			},
			"VElement:exit"() {
				elementStack = elementStack && elementStack.upper;
			},
			VAttribute(node) {
				if (!node.value || !elementStack) return;
				if (node.directive === false) {
					if (!elementStack.attrs.has(node.key.rawName)) return;
					if (getBareString(node.value.value)) context.report({
						node: node.value,
						messageId: "unexpectedInAttr",
						data: { attr: node.key.rawName }
					});
				} else {
					const directive = `v-${node.key.name.name}`;
					if (!directives.includes(directive)) return;
					const str = getStringValue(node.value);
					if (str && getBareString(str)) context.report({
						node: node.value,
						messageId: "unexpectedInAttr",
						data: { attr: directive }
					});
				}
			}
		});
	}
};

//#endregion
exports.default = no_bare_strings_in_template_default;