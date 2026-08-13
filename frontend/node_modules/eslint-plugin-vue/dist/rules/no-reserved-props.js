const require_runtime = require('../_virtual/_rolldown/runtime.js');
const require_index = require('../utils/index.js');
const require_casing = require('../utils/casing.js');

//#region lib/rules/no-reserved-props.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
const RESERVED = {
	3: ["key", "ref"],
	2: [
		"key",
		"ref",
		"is",
		"slot",
		"slot-scope",
		"slotScope",
		"class",
		"style"
	]
};
var no_reserved_props_default = {
	meta: {
		type: "problem",
		docs: {
			description: "disallow reserved names in props",
			categories: ["vue3-essential", "vue2-essential"],
			url: "https://eslint.vuejs.org/rules/no-reserved-props.html",
			defaultOptions: { vue2: [{ vueVersion: 2 }] }
		},
		fixable: null,
		schema: [{
			type: "object",
			properties: { vueVersion: { enum: [2, 3] } },
			additionalProperties: false
		}],
		messages: { reserved: "'{{propName}}' is a reserved attribute and cannot be used as props." }
	},
	create(context) {
		const vueVersion = (context.options[0] || {}).vueVersion || 3;
		const reserved = new Set(RESERVED[vueVersion]);
		function processProps(props) {
			for (const prop of props) if (prop.propName != null && reserved.has(prop.propName)) context.report({
				node: prop.node,
				messageId: `reserved`,
				data: { propName: require_casing.kebabCase(prop.propName) }
			});
		}
		return import_utils.default.compositingVisitors(import_utils.default.defineScriptSetupVisitor(context, { onDefinePropsEnter(_node, props) {
			processProps(props);
		} }), import_utils.default.executeOnVue(context, (obj) => {
			processProps(import_utils.default.getComponentPropsFromOptions(obj));
		}));
	}
};

//#endregion
exports.default = no_reserved_props_default;