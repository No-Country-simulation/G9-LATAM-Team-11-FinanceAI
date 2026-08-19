const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_regexp = require('../utils/regexp.js');

//#region lib/rules/no-restricted-block.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
function parseOption(option) {
	if (typeof option === "string") {
		const matcher = require_regexp.toRegExp(option, { remove: "g" });
		return { test(block) {
			return matcher.test(block.rawName);
		} };
	}
	const parsed = parseOption(option.element);
	parsed.message = option.message;
	return parsed;
}
function defaultMessage(block) {
	return `Using \`<${block.rawName}>\` is not allowed.`;
}
var no_restricted_block_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow specific block",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-restricted-block.html"
		},
		fixable: null,
		schema: {
			type: "array",
			items: { oneOf: [{ type: "string" }, {
				type: "object",
				properties: {
					element: { type: "string" },
					message: {
						type: "string",
						minLength: 1
					}
				},
				required: ["element"],
				additionalProperties: false
			}] },
			uniqueItems: true,
			minItems: 0
		},
		messages: { restrictedBlock: "{{message}}" }
	},
	create(context) {
		const options = context.options.map(parseOption);
		const sourceCode = context.sourceCode;
		const documentFragment = sourceCode.parserServices.getDocumentFragment && sourceCode.parserServices.getDocumentFragment();
		function getTopLevelHTMLElements() {
			if (documentFragment) return documentFragment.children.filter(import_utils.default.isVElement);
			return [];
		}
		return { Program(node) {
			if (import_utils.default.hasInvalidEOF(node)) return;
			for (const block of getTopLevelHTMLElements()) for (const option of options) if (option.test(block)) {
				const message = option.message || defaultMessage(block);
				context.report({
					node: block.startTag,
					messageId: "restrictedBlock",
					data: { message }
				});
				break;
			}
		} };
	}
};

//#endregion
exports.default = no_restricted_block_default;