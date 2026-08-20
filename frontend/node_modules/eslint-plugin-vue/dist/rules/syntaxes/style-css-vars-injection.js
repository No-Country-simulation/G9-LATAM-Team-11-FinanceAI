const require_index = require('../../utils/style-variables/index.js');

//#region lib/rules/syntaxes/style-css-vars-injection.ts
/**
* @author Yosuke Ota
* See LICENSE file in root directory for full license.
*/
var style_css_vars_injection_default = {
	supported: ">=3.0.3 || >=2.7.0 <3.0.0",
	createScriptVisitor(context) {
		const styleVars = require_index.getStyleVariablesContext(context);
		if (!styleVars) return {};
		return { Program() {
			for (const vBind of styleVars.vBinds) context.report({
				node: vBind,
				messageId: "forbiddenStyleCssVarsInjection"
			});
		} };
	}
};

//#endregion
exports.default = style_css_vars_injection_default;