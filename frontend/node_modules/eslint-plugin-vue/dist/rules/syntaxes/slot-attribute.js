const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_index = require('../../utils/index.js');
const require_casing = require('../../utils/casing.js');
const require_regexp = require('../../utils/regexp.js');
const require_can_convert_to_v_slot$1 = require('./utils/can-convert-to-v-slot.js');

//#region lib/rules/syntaxes/slot-attribute.ts
var import_can_convert_to_v_slot = /* @__PURE__ */ require_runtime.__toESM(require_can_convert_to_v_slot$1.default);
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var slot_attribute_default = {
	deprecated: "2.6.0",
	supported: "<3.0.0",
	createTemplateBodyVisitor(context) {
		const { ignore = [], ignoreParents = [] } = context.options[0] || {};
		const isAnyIgnored = require_regexp.toRegExpGroupMatcher(ignore);
		const isParentIgnored = require_regexp.toRegExpGroupMatcher(ignoreParents);
		const sourceCode = context.sourceCode;
		const tokenStore = sourceCode.parserServices.getTemplateBodyTokenStore && sourceCode.parserServices.getTemplateBodyTokenStore();
		/**
		* Checks whether the given node can convert to the `v-slot`.
		*/
		function canConvertFromSlotToVSlot(slotAttr) {
			if (!(0, import_can_convert_to_v_slot.default)(slotAttr.parent.parent, sourceCode, tokenStore)) return false;
			if (!slotAttr.value) return true;
			const slotName = slotAttr.value.value;
			return !/[^\w\-]/u.test(slotName);
		}
		/**
		* Checks whether the given node can convert to the `v-slot`.
		*/
		function canConvertFromVBindSlotToVSlot(slotAttr) {
			if (!(0, import_can_convert_to_v_slot.default)(slotAttr.parent.parent, sourceCode, tokenStore)) return false;
			if (!slotAttr.value) return true;
			if (!slotAttr.value.expression) return false;
			return slotAttr.value.expression.type === "Identifier";
		}
		/**
		* Convert to `v-slot`.
		*/
		function* fixSlotToVSlot(fixer, slotAttr, slotName, isVBind) {
			const startTag = slotAttr.parent;
			const scopeAttr = startTag.attributes.find((attr) => attr.directive === true && attr.key.name && (attr.key.name.name === "slot-scope" || attr.key.name.name === "scope"));
			let nameArgument = "";
			if (slotName) nameArgument = isVBind ? `:[${slotName}]` : `:${slotName}`;
			const scopeValue = scopeAttr && scopeAttr.value ? `=${sourceCode.getText(scopeAttr.value)}` : "";
			const replaceText = `v-slot${nameArgument}${scopeValue}`;
			const element = startTag.parent;
			if (element.name === "template") {
				yield fixer.replaceText(slotAttr || scopeAttr, replaceText);
				if (slotAttr && scopeAttr) yield fixer.remove(scopeAttr);
			} else {
				yield fixer.remove(slotAttr || scopeAttr);
				if (slotAttr && scopeAttr) yield fixer.remove(scopeAttr);
				const vFor = startTag.attributes.find((attr) => attr.directive && attr.key.name.name === "for");
				const vForText = vFor ? `${sourceCode.getText(vFor)} ` : "";
				if (vFor) yield fixer.remove(vFor);
				yield fixer.insertTextBefore(element, `<template ${vForText}${replaceText}>\n`);
				yield fixer.insertTextAfter(element, `\n</template>`);
			}
		}
		/**
		* Reports `slot` node
		*/
		function reportSlot(slotAttr) {
			const component = slotAttr.parent.parent;
			const componentName = component.rawName;
			if (isAnyIgnored(componentName, require_casing.pascalCase(componentName), require_casing.kebabCase(componentName))) return;
			const parent = component.parent;
			const parentName = import_utils.default.isVElement(parent) ? parent.rawName : null;
			if (parentName && isParentIgnored(parentName)) return;
			context.report({
				node: slotAttr.key,
				messageId: "forbiddenSlotAttribute",
				*fix(fixer) {
					if (!canConvertFromSlotToVSlot(slotAttr)) return;
					yield* fixSlotToVSlot(fixer, slotAttr, slotAttr.value && slotAttr.value.value, false);
				}
			});
		}
		/**
		* Reports `v-bind:slot` node
		*/
		function reportVBindSlot(slotAttr) {
			context.report({
				node: slotAttr.key,
				messageId: "forbiddenSlotAttribute",
				*fix(fixer) {
					if (!canConvertFromVBindSlotToVSlot(slotAttr)) return;
					yield* fixSlotToVSlot(fixer, slotAttr, slotAttr.value && slotAttr.value.expression && sourceCode.getText(slotAttr.value.expression).trim(), true);
				}
			});
		}
		return {
			"VAttribute[directive=false][key.name='slot']": reportSlot,
			"VAttribute[directive=true][key.name.name='bind'][key.argument.name='slot']": reportVBindSlot
		};
	}
};

//#endregion
exports.default = slot_attribute_default;