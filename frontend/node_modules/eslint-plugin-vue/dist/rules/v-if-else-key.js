const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/v-if-else-key.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* Checks if a given node has sibling nodes of the same type that are also conditionally rendered.
* This is used to determine if multiple instances of the same component are being conditionally
* rendered within the same parent scope.
*
* @param node - The Vue component node to check for conditional rendering siblings.
* @param componentName - The name of the component to check for sibling instances.
* @returns True if there are sibling nodes of the same type and conditionally rendered, false otherwise.
*/
const hasConditionalRenderedSiblings = (node, componentName) => {
	if (!node.parent || node.parent.type !== "VElement") return false;
	return node.parent.children.some((sibling) => sibling !== node && sibling.type === "VElement" && sibling.rawName === componentName && hasConditionalDirective(sibling));
};
/**
* Checks for the presence of a 'key' attribute in the given node. If the 'key' attribute is missing
* and the node is part of a conditional family a report is generated.
* The fix proposed adds a unique key based on the component's name and count,
* following the format '${kebabCase(componentName)}-${componentCount}', e.g., 'some-component-2'.
*
* @param node - The Vue component node to check for a 'key' attribute.
* @param context - The rule's context object, used for reporting.
* @param componentName - Name of the component.
* @param uniqueKey - A unique key for the repeated component, used for the fix.
* @param conditionalFamilies - Map of conditionally rendered components and their respective conditional directives.
*/
const checkForKey = (node, context, componentName, uniqueKey, conditionalFamilies) => {
	if (!node.parent || node.parent.type !== "VElement" || !hasConditionalRenderedSiblings(node, componentName)) return;
	const conditionalFamily = conditionalFamilies.get(node.parent);
	if (!conditionalFamily || import_utils.default.hasAttribute(node, "key")) return;
	if (conditionalFamily.if === node || conditionalFamily.else === node || conditionalFamily.elseIf.includes(node)) context.report({
		node: node.startTag,
		loc: node.startTag.loc,
		messageId: "requireKey",
		data: { componentName },
		fix(fixer) {
			const afterComponentNamePosition = node.startTag.range[0] + componentName.length + 1;
			return fixer.insertTextBeforeRange([afterComponentNamePosition, afterComponentNamePosition], ` key="${uniqueKey}"`);
		}
	});
};
/**
* Checks for the presence of conditional directives in the given node.
*
* @param node - The node to check for conditional directives.
* @returns Returns true if a conditional directive is found in the node or its parents,
*   false otherwise.
*/
const hasConditionalDirective = (node) => import_utils.default.hasDirective(node, "if") || import_utils.default.hasDirective(node, "else-if") || import_utils.default.hasDirective(node, "else");
var v_if_else_key_default = {
	meta: {
		type: "problem",
		docs: {
			description: "require key attribute for conditionally rendered repeated components",
			categories: null,
			url: "https://eslint.vuejs.org/rules/v-if-else-key.html"
		},
		fixable: "code",
		schema: [],
		messages: { requireKey: "Conditionally rendered repeated component '{{componentName}}' expected to have a 'key' attribute." }
	},
	create(context) {
		/**
		* Map to store conditionally rendered components and their respective conditional directives.
		*
		* @type {Map<VElement, ConditionalFamily>}
		*/
		const conditionalFamilies = /* @__PURE__ */ new Map();
		/**
		* Array of Maps to keep track of components and their usage counts along with the first
		* node instance. Each Map represents a different scope level, and maps a component name to
		* an object containing the count and a reference to the first node.
		*/
		/** @type {Map<string, { count: number; firstNode: any }>[]} */
		const componentUsageStack = [/* @__PURE__ */ new Map()];
		/**
		* Checks if a given node represents a custom component without any conditional directives.
		*
		* @returns True if the node represents a custom component without any conditional directives, false otherwise.
		*/
		const isCustomComponentWithoutCondition = (node) => node.type === "VElement" && import_utils.default.isCustomComponent(node) && !hasConditionalDirective(node);
		/** Set of built-in Vue components that are exempt from the rule. */
		const exemptTags = new Set([
			"component",
			"slot",
			"template"
		]);
		/** Set to keep track of nodes we've pushed to the stack. */
		const pushedNodes = /* @__PURE__ */ new Set();
		/**
		* Creates and returns an object representing a conditional family.
		*
		* @param ifNode - The VElement associated with the 'v-if' directive.
		*/
		const createConditionalFamily = (ifNode) => ({
			if: ifNode,
			elseIf: [],
			else: null
		});
		return import_utils.default.defineTemplateBodyVisitor(context, {
			VElement(node) {
				if (exemptTags.has(node.rawName)) return;
				const condition = import_utils.default.getDirective(node, "if") || import_utils.default.getDirective(node, "else-if") || import_utils.default.getDirective(node, "else");
				if (condition) {
					const conditionType = condition.key.name.name;
					if (node.parent && node.parent.type === "VElement") {
						let conditionalFamily = conditionalFamilies.get(node.parent);
						if (!conditionalFamily) {
							conditionalFamily = createConditionalFamily(node);
							conditionalFamilies.set(node.parent, conditionalFamily);
						}
						if (conditionalFamily) switch (conditionType) {
							case "if":
								conditionalFamily = createConditionalFamily(node);
								conditionalFamilies.set(node.parent, conditionalFamily);
								break;
							case "else-if":
								conditionalFamily.elseIf.push(node);
								break;
							case "else":
								conditionalFamily.else = node;
								break;
						}
					}
				}
				if (isCustomComponentWithoutCondition(node)) {
					componentUsageStack.push(/* @__PURE__ */ new Map());
					return;
				}
				if (!import_utils.default.isCustomComponent(node)) return;
				const componentName = node.rawName;
				const currentScope = componentUsageStack.at(-1);
				const usageInfo = currentScope?.get(componentName) ?? {
					count: 0,
					firstNode: null
				};
				if (hasConditionalDirective(node)) {
					if (usageInfo.count === 0) usageInfo.firstNode = node;
					if (usageInfo.count > 0) {
						checkForKey(node, context, componentName, `${require_casing.kebabCase(componentName)}-${usageInfo.count + 1}`, conditionalFamilies);
						if (usageInfo.count === 1) {
							const uniqueKeyForFirstInstance = `${require_casing.kebabCase(componentName)}-1`;
							checkForKey(usageInfo.firstNode, context, componentName, uniqueKeyForFirstInstance, conditionalFamilies);
						}
					}
					usageInfo.count += 1;
					currentScope?.set(componentName, usageInfo);
				}
				componentUsageStack.push(/* @__PURE__ */ new Map());
				pushedNodes.add(node);
			},
			"VElement:exit"(node) {
				if (exemptTags.has(node.rawName)) return;
				if (isCustomComponentWithoutCondition(node)) {
					componentUsageStack.pop();
					return;
				}
				if (!import_utils.default.isCustomComponent(node)) return;
				if (pushedNodes.has(node)) {
					componentUsageStack.pop();
					pushedNodes.delete(node);
				}
			}
		});
	}
};

//#endregion
exports.default = v_if_else_key_default;