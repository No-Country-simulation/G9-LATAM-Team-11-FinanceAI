const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_index = require('../index.js');

//#region lib/utils/style-variables/index.ts
var import_utils = /* @__PURE__ */ require_runtime.__toESM(require_index.default);
var StyleVariablesContext = class {
	context;
	styles;
	references = [];
	vBinds = [];
	constructor(context, styles) {
		this.context = context;
		this.styles = styles;
		for (const style of styles) for (const node of style.children) if (node.type === "VExpressionContainer") {
			this.vBinds.push(node);
			for (const ref of node.references.filter((ref) => ref.variable == null)) this.references.push(ref);
		}
	}
};
const cache = /* @__PURE__ */ new WeakMap();
/**
* Get the style vars context
*/
function getStyleVariablesContext(context) {
	const sourceCode = context.sourceCode;
	const df = sourceCode.parserServices.getDocumentFragment && sourceCode.parserServices.getDocumentFragment();
	if (!df) return null;
	const styles = df.children.filter((e) => import_utils.default.isVElement(e) && e.name === "style");
	if (styles.length === 0) return null;
	let ctx = cache.get(styles[0]);
	if (ctx) return ctx;
	ctx = new StyleVariablesContext(context, styles);
	cache.set(styles[0], ctx);
	return ctx;
}

//#endregion
exports.getStyleVariablesContext = getStyleVariablesContext;