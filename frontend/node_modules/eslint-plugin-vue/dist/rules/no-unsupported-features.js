const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_slot_scope_attribute$1 = require('./syntaxes/slot-scope-attribute.js');
const require_v_is$1 = require('./syntaxes/v-is.js');
const require_dynamic_directive_arguments$1 = require('./syntaxes/dynamic-directive-arguments.js');
const require_v_slot$1 = require('./syntaxes/v-slot.js');
const require_script_setup$1 = require('./syntaxes/script-setup.js');
const require_style_css_vars_injection = require('./syntaxes/style-css-vars-injection.js');
const require_v_model_argument$1 = require('./syntaxes/v-model-argument.js');
const require_v_model_custom_modifiers$1 = require('./syntaxes/v-model-custom-modifiers.js');
const require_is_attribute_with_vue_prefix$1 = require('./syntaxes/is-attribute-with-vue-prefix.js');
const require_v_memo$1 = require('./syntaxes/v-memo.js');
const require_v_bind_prop_modifier_shorthand$1 = require('./syntaxes/v-bind-prop-modifier-shorthand.js');
const require_v_bind_attr_modifier$1 = require('./syntaxes/v-bind-attr-modifier.js');
const require_define_options$1 = require('./syntaxes/define-options.js');
const require_define_slots$1 = require('./syntaxes/define-slots.js');
const require_define_model$1 = require('./syntaxes/define-model.js');
const require_v_bind_same_name_shorthand$1 = require('./syntaxes/v-bind-same-name-shorthand.js');
let semver = require("semver");
semver = require_runtime.__toESM(semver);

//#region lib/rules/no-unsupported-features.ts
/**
* @author Yosuke Ota
* See LICENSE file in root directory for full license.
*/
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var import_slot_scope_attribute = /* @__PURE__ */ require_runtime.__toESM(require_slot_scope_attribute$1.default);
var import_dynamic_directive_arguments = /* @__PURE__ */ require_runtime.__toESM(require_dynamic_directive_arguments$1.default);
var import_v_slot = /* @__PURE__ */ require_runtime.__toESM(require_v_slot$1.default);
var import_script_setup = /* @__PURE__ */ require_runtime.__toESM(require_script_setup$1.default);
var import_v_model_argument = /* @__PURE__ */ require_runtime.__toESM(require_v_model_argument$1.default);
var import_v_model_custom_modifiers = /* @__PURE__ */ require_runtime.__toESM(require_v_model_custom_modifiers$1.default);
var import_v_is = /* @__PURE__ */ require_runtime.__toESM(require_v_is$1.default);
var import_is_attribute_with_vue_prefix = /* @__PURE__ */ require_runtime.__toESM(require_is_attribute_with_vue_prefix$1.default);
var import_v_memo = /* @__PURE__ */ require_runtime.__toESM(require_v_memo$1.default);
var import_v_bind_prop_modifier_shorthand = /* @__PURE__ */ require_runtime.__toESM(require_v_bind_prop_modifier_shorthand$1.default);
var import_v_bind_attr_modifier = /* @__PURE__ */ require_runtime.__toESM(require_v_bind_attr_modifier$1.default);
var import_define_options = /* @__PURE__ */ require_runtime.__toESM(require_define_options$1.default);
var import_define_slots = /* @__PURE__ */ require_runtime.__toESM(require_define_slots$1.default);
var import_define_model = /* @__PURE__ */ require_runtime.__toESM(require_define_model$1.default);
var import_v_bind_same_name_shorthand = /* @__PURE__ */ require_runtime.__toESM(require_v_bind_same_name_shorthand$1.default);
const FEATURES = {
	"slot-scope-attribute": import_slot_scope_attribute.default,
	"dynamic-directive-arguments": import_dynamic_directive_arguments.default,
	"v-slot": import_v_slot.default,
	"script-setup": import_script_setup.default,
	"style-css-vars-injection": require_style_css_vars_injection.default,
	"v-model-argument": import_v_model_argument.default,
	"v-model-custom-modifiers": import_v_model_custom_modifiers.default,
	"v-is": import_v_is.default,
	"is-attribute-with-vue-prefix": import_is_attribute_with_vue_prefix.default,
	"v-memo": import_v_memo.default,
	"v-bind-prop-modifier-shorthand": import_v_bind_prop_modifier_shorthand.default,
	"v-bind-attr-modifier": import_v_bind_attr_modifier.default,
	"define-options": import_define_options.default,
	"define-slots": import_define_slots.default,
	"define-model": import_define_model.default,
	"v-bind-same-name-shorthand": import_v_bind_same_name_shorthand.default
};
const SYNTAX_NAMES = Object.keys(FEATURES);
const cache = /* @__PURE__ */ new Map();
/**
* Get the `semver.Range` object of a given range text.
* It's null if the `x` is not a valid range text.
*/
function getSemverRange(x) {
	const s = String(x);
	let ret = cache.get(s) || null;
	if (!ret) {
		try {
			ret = new semver.default.Range(s);
		} catch {}
		cache.set(s, ret);
	}
	return ret;
}
var no_unsupported_features_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "disallow unsupported Vue.js syntax on the specified version",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-unsupported-features.html"
		},
		fixable: "code",
		schema: [{
			type: "object",
			properties: {
				version: { type: "string" },
				ignores: {
					type: "array",
					items: { enum: SYNTAX_NAMES },
					uniqueItems: true
				}
			},
			additionalProperties: false
		}],
		messages: {
			forbiddenSlotScopeAttribute: "`slot-scope` are not supported except Vue.js \">=2.5.0 <3.0.0\".",
			forbiddenDynamicDirectiveArguments: "Dynamic arguments are not supported until Vue.js \"2.6.0\".",
			forbiddenVSlot: "`v-slot` are not supported until Vue.js \"2.6.0\".",
			forbiddenScriptSetup: "`<script setup>` is not supported until Vue.js \"2.7.0\".",
			forbiddenStyleCssVarsInjection: "SFC CSS variable injection is not supported until Vue.js \">=3.0.3 || >=2.7.0 <3.0.0\".",
			forbiddenVModelArgument: "Argument on `v-model` is not supported until Vue.js \"3.0.0\".",
			forbiddenVModelCustomModifiers: "Custom modifiers on `v-model` are not supported until Vue.js \"3.0.0\".",
			forbiddenVIs: "`v-is` are not supported until Vue.js \"3.0.0\".",
			forbiddenIsAttributeWithVuePrefix: "`is=\"vue:\"` are not supported until Vue.js \"3.1.0\".",
			forbiddenVMemo: "`v-memo` are not supported until Vue.js \"3.2.0\".",
			forbiddenVBindPropModifierShorthand: "`.prop` shorthand are not supported until Vue.js \"3.2.0\".",
			forbiddenVBindAttrModifier: "`.attr` modifiers on `v-bind` are not supported until Vue.js \"3.2.0\".",
			forbiddenDefineOptions: "`defineOptions()` macros are not supported until Vue.js \"3.3.0\".",
			forbiddenDefineSlots: "`defineSlots()` macros are not supported until Vue.js \"3.3.0\".",
			forbiddenDefineModel: "`defineModel()` macros are not supported until Vue.js \"3.4.0\".",
			forbiddenVBindSameNameShorthand: "`v-bind` same-name shorthand is not supported until Vue.js \"3.4.0\"."
		}
	},
	create(context) {
		const { version, ignores } = Object.assign({
			version: null,
			ignores: []
		}, context.options[0] || {});
		if (!version) return {};
		const versionRange = getSemverRange(version);
		/**
		* Check whether a given case object is full-supported on the configured node version.
		*/
		function isNotSupportingVersion(aCase) {
			return !semver.default.subset(versionRange, getSemverRange(aCase.supported));
		}
		let templateBodyVisitor = {};
		let scriptVisitor = {};
		for (const syntaxName of SYNTAX_NAMES) {
			const syntax = FEATURES[syntaxName];
			if (ignores.includes(syntaxName) || !isNotSupportingVersion(syntax)) continue;
			if (syntax.createTemplateBodyVisitor) {
				const visitor = syntax.createTemplateBodyVisitor(context);
				templateBodyVisitor = import_utils.default.compositingVisitors(templateBodyVisitor, visitor);
			}
			if (syntax.createScriptVisitor) {
				const visitor = syntax.createScriptVisitor(context);
				scriptVisitor = import_utils.default.compositingVisitors(scriptVisitor, visitor);
			}
		}
		return import_utils.default.defineTemplateBodyVisitor(context, templateBodyVisitor, scriptVisitor);
	}
};

//#endregion
exports.default = no_unsupported_features_default;