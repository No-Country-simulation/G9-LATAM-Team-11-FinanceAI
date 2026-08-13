const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/slot-name-casing.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* Checks whether the given string is a single word.
*/
function isSingleWord(str) {
	return /^[a-z]+$/u.test(str);
}
const allowedCaseOptions = [
	"camelCase",
	"kebab-case",
	"singleword"
];
var slot_name_casing_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "enforce specific casing for slot names",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/slot-name-casing.html"
		},
		fixable: null,
		schema: [{ enum: allowedCaseOptions }],
		messages: { invalidCase: "Slot name \"{{name}}\" is not {{caseType}}." }
	},
	create(context) {
		const option = context.options[0];
		const caseType = allowedCaseOptions.includes(option) ? option : "camelCase";
		const checker = caseType === "singleword" ? isSingleWord : require_casing.getChecker(caseType);
		function processSlotNode(node) {
			const name = node.value?.value;
			if (name && !checker(name)) context.report({
				node,
				loc: node.loc,
				messageId: "invalidCase",
				data: {
					name,
					caseType
				}
			});
		}
		return import_utils.default.defineTemplateBodyVisitor(context, { "VElement[name='slot']"(node) {
			const slotName = import_utils.default.getAttribute(node, "name");
			if (slotName) processSlotNode(slotName);
		} });
	}
};

//#endregion
exports.default = slot_name_casing_default;