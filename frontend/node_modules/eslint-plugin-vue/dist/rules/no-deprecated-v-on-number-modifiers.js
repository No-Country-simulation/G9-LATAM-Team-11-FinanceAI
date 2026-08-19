const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_keycode_to_key = require('../utils/keycode-to-key.js');

//#region lib/rules/no-deprecated-v-on-number-modifiers.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var no_deprecated_v_on_number_modifiers_default = {
	meta: {
		type: "problem",
		docs: {
			description: "disallow using deprecated number (keycode) modifiers (in Vue.js 3.0.0+)",
			categories: ["vue3-essential"],
			url: "https://eslint.vuejs.org/rules/no-deprecated-v-on-number-modifiers.html"
		},
		fixable: "code",
		schema: [],
		messages: { numberModifierIsDeprecated: "'KeyboardEvent.keyCode' modifier on 'v-on' directive is deprecated. Using 'KeyboardEvent.key' instead." }
	},
	create(context) {
		return import_utils.default.defineTemplateBodyVisitor(context, { "VAttribute[directive=true][key.name.name='on'] > VDirectiveKey"(node) {
			const modifier = node.modifiers.find((mod) => Number.isInteger(Number.parseInt(mod.name, 10)));
			if (!modifier) return;
			const keyCodes = Number.parseInt(modifier.name, 10);
			if (keyCodes > 9 || keyCodes < 0) context.report({
				node: modifier,
				messageId: "numberModifierIsDeprecated",
				fix(fixer) {
					const key = require_keycode_to_key.default[keyCodes];
					if (!key) return null;
					return fixer.replaceText(modifier, `${key}`);
				}
			});
		} });
	}
};

//#endregion
exports.default = no_deprecated_v_on_number_modifiers_default;