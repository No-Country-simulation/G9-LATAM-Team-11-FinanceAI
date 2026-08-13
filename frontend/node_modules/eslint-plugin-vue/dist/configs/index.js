const require_configs_base = require('./base.js');
const require_configs_vue2_essential = require('./vue2-essential.js');
const require_configs_vue2_strongly_recommended = require('./vue2-strongly-recommended.js');
const require_configs_vue2_strongly_recommended_error = require('./vue2-strongly-recommended-error.js');
const require_configs_vue2_recommended = require('./vue2-recommended.js');
const require_configs_vue2_recommended_error = require('./vue2-recommended-error.js');
const require_configs_vue3_essential = require('./vue3-essential.js');
const require_configs_vue3_strongly_recommended = require('./vue3-strongly-recommended.js');
const require_configs_vue3_strongly_recommended_error = require('./vue3-strongly-recommended-error.js');
const require_configs_vue3_recommended = require('./vue3-recommended.js');
const require_configs_vue3_recommended_error = require('./vue3-recommended-error.js');
const require_configs_flat_base = require('./flat/base.js');
const require_configs_flat_vue2_essential = require('./flat/vue2-essential.js');
const require_configs_flat_vue2_strongly_recommended = require('./flat/vue2-strongly-recommended.js');
const require_configs_flat_vue2_strongly_recommended_error = require('./flat/vue2-strongly-recommended-error.js');
const require_configs_flat_vue2_recommended = require('./flat/vue2-recommended.js');
const require_configs_flat_vue2_recommended_error = require('./flat/vue2-recommended-error.js');
const require_configs_flat_vue3_essential = require('./flat/vue3-essential.js');
const require_configs_flat_vue3_strongly_recommended = require('./flat/vue3-strongly-recommended.js');
const require_configs_flat_vue3_strongly_recommended_error = require('./flat/vue3-strongly-recommended-error.js');
const require_configs_flat_vue3_recommended = require('./flat/vue3-recommended.js');
const require_configs_flat_vue3_recommended_error = require('./flat/vue3-recommended-error.js');
const require_configs_no_layout_rules = require('./no-layout-rules.js');

//#region lib/configs/index.ts
const configs = {
	base: require_configs_base,
	"vue2-essential": require_configs_vue2_essential,
	"vue2-strongly-recommended": require_configs_vue2_strongly_recommended,
	"vue2-strongly-recommended-error": require_configs_vue2_strongly_recommended_error,
	"vue2-recommended": require_configs_vue2_recommended,
	"vue2-recommended-error": require_configs_vue2_recommended_error,
	essential: require_configs_vue3_essential,
	"strongly-recommended": require_configs_vue3_strongly_recommended,
	"strongly-recommended-error": require_configs_vue3_strongly_recommended_error,
	recommended: require_configs_vue3_recommended,
	"recommended-error": require_configs_vue3_recommended_error,
	"flat/base": require_configs_flat_base,
	"flat/vue2-essential": require_configs_flat_vue2_essential,
	"flat/vue2-strongly-recommended": require_configs_flat_vue2_strongly_recommended,
	"flat/vue2-strongly-recommended-error": require_configs_flat_vue2_strongly_recommended_error,
	"flat/vue2-recommended": require_configs_flat_vue2_recommended,
	"flat/vue2-recommended-error": require_configs_flat_vue2_recommended_error,
	"flat/essential": require_configs_flat_vue3_essential,
	"flat/strongly-recommended": require_configs_flat_vue3_strongly_recommended,
	"flat/strongly-recommended-error": require_configs_flat_vue3_strongly_recommended_error,
	"flat/recommended": require_configs_flat_vue3_recommended,
	"flat/recommended-error": require_configs_flat_vue3_recommended_error,
	"no-layout-rules": require_configs_no_layout_rules
};

//#endregion
module.exports = configs;