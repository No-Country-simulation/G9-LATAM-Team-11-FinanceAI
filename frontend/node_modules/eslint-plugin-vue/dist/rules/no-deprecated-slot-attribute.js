const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_slot_attribute = require('./syntaxes/slot-attribute.js');

//#region lib/rules/no-deprecated-slot-attribute.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var no_deprecated_slot_attribute_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow deprecated `slot` attribute (in Vue.js 2.6.0+)",
			categories: ["vue3-essential"],
			url: "https://eslint.vuejs.org/rules/no-deprecated-slot-attribute.html"
		},
		fixable: "code",
		schema: [{
			type: "object",
			properties: {
				ignore: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true
				},
				ignoreParents: {
					type: "array",
					items: { type: "string" },
					uniqueItems: true
				}
			},
			additionalProperties: false
		}],
		messages: { forbiddenSlotAttribute: "`slot` attributes are deprecated." }
	},
	create(context) {
		const templateBodyVisitor = require_slot_attribute.default.createTemplateBodyVisitor(context);
		return import_utils.default.defineTemplateBodyVisitor(context, templateBodyVisitor);
	}
};

//#endregion
exports.default = no_deprecated_slot_attribute_default;