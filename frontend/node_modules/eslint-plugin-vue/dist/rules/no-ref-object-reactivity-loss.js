const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_ref_object_references = require('../utils/ref-object-references.js');

//#region lib/rules/no-ref-object-reactivity-loss.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
/**
* Checks whether writing assigns a value to the given pattern.
*/
function isUpdate(node) {
	const parent = node.parent;
	if (parent.type === "UpdateExpression" && parent.argument === node) return true;
	if (parent.type === "AssignmentExpression" && parent.left === node) return true;
	if (parent.type === "Property" && parent.value === node || parent.type === "ArrayPattern" || parent.type === "ObjectPattern" && parent.properties.includes(node) || parent.type === "AssignmentPattern" && parent.left === node || parent.type === "RestElement" || parent.type === "MemberExpression" && parent.object === node) return isUpdate(parent);
	return false;
}
var no_ref_object_reactivity_loss_default = {
	meta: {
		type: "problem",
		docs: {
			description: "disallow usages of ref objects that can lead to loss of reactivity",
			categories: void 0,
			url: "https://eslint.vuejs.org/rules/no-ref-object-reactivity-loss.html"
		},
		fixable: null,
		schema: [],
		messages: {
			getValueInSameScope: "Getting a value from the ref object in the same scope will cause the value to lose reactivity.",
			getReactiveVariableInSameScope: "Getting a reactive variable in the same scope will cause the value to lose reactivity."
		}
	},
	create(context) {
		let scopeStack = {
			upper: null,
			node: context.sourceCode.ast
		};
		const scopes = /* @__PURE__ */ new Map();
		const refObjectReferences = require_ref_object_references.extractRefObjectReferences(context);
		const reactiveVariableReferences = require_ref_object_references.extractReactiveVariableReferences(context);
		/**
		* Verify the given ref object value. `refObj = ref(); refObj.value;`
		*/
		function verifyRefObjectValue(node) {
			const ref = refObjectReferences.get(node);
			if (!ref) return;
			if (scopes.get(ref.define) !== scopeStack) return;
			context.report({
				node,
				messageId: "getValueInSameScope"
			});
		}
		/**
		* Verify the given reactive variable. `refVal = $ref(); refVal;`
		*/
		function verifyReactiveVariable(node) {
			const ref = reactiveVariableReferences.get(node);
			if (!ref || ref.escape) return;
			if (scopes.get(ref.define) !== scopeStack) return;
			context.report({
				node,
				messageId: "getReactiveVariableInSameScope"
			});
		}
		return {
			":function"(node) {
				scopeStack = {
					upper: scopeStack,
					node
				};
			},
			":function:exit"() {
				scopeStack = scopeStack.upper || scopeStack;
			},
			CallExpression(node) {
				scopes.set(node, scopeStack);
			},
			"MemberExpression:exit"(node) {
				if (isUpdate(node)) return;
				if (import_utils.default.getStaticPropertyName(node) !== "value") return;
				verifyRefObjectValue(node.object);
			},
			"ObjectPattern:exit"(node) {
				if (!import_utils.default.findAssignmentProperty(node, "value")) return;
				verifyRefObjectValue(node);
			},
			"Identifier:exit"(node) {
				if (isUpdate(node)) return;
				verifyReactiveVariable(node);
			}
		};
	}
};

//#endregion
exports.default = no_ref_object_reactivity_loss_default;