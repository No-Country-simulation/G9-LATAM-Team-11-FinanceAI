import { eslintRules, importRules, jestRules, jsdocRules, jsxA11yRules, nextjsRules, nodeRules, promiseRules, reactHooksRules, reactPerfRules, reactRules, t as rules_by_scope_exports, typescriptRules, unicornRules, vitestRules, vueRules } from "./generated/rules-by-scope.mjs";
import { correctnessRules, nurseryRules, pedanticRules, perfRules, restrictionRules, styleRules, suspiciousRules, t as rules_by_category_exports } from "./generated/rules-by-category.mjs";
import fs from "node:fs";
import { parse } from "jsonc-parser";
import path from "node:path";
//#region src/generated/configs-by-scope.ts
const configByScope = {
	"flat/eslint": {
		name: "oxlint/eslint",
		rules: eslintRules
	},
	"flat/import": {
		name: "oxlint/import",
		rules: importRules
	},
	"flat/jest": {
		name: "oxlint/jest",
		rules: jestRules
	},
	"flat/jsdoc": {
		name: "oxlint/jsdoc",
		rules: jsdocRules
	},
	"flat/jsx-a11y": {
		name: "oxlint/jsx-a11y",
		rules: jsxA11yRules
	},
	"flat/nextjs": {
		name: "oxlint/nextjs",
		rules: nextjsRules
	},
	"flat/node": {
		name: "oxlint/node",
		rules: nodeRules
	},
	"flat/promise": {
		name: "oxlint/promise",
		rules: promiseRules
	},
	"flat/react": {
		name: "oxlint/react",
		rules: reactRules
	},
	"flat/react-hooks": {
		name: "oxlint/react-hooks",
		rules: reactHooksRules
	},
	"flat/react-perf": {
		name: "oxlint/react-perf",
		rules: reactPerfRules
	},
	"flat/typescript": {
		name: "oxlint/typescript",
		rules: typescriptRules
	},
	"flat/unicorn": {
		name: "oxlint/unicorn",
		rules: unicornRules
	},
	"flat/vitest": {
		name: "oxlint/vitest",
		rules: vitestRules
	},
	"flat/vue": {
		name: "oxlint/vue",
		rules: vueRules
	}
};
//#endregion
//#region src/generated/configs-by-category.ts
const configByCategory = {
	"flat/pedantic": {
		name: "oxlint/pedantic",
		rules: pedanticRules
	},
	"flat/style": {
		name: "oxlint/style",
		rules: styleRules
	},
	"flat/suspicious": {
		name: "oxlint/suspicious",
		rules: suspiciousRules
	},
	"flat/restriction": {
		name: "oxlint/restriction",
		rules: restrictionRules
	},
	"flat/correctness": {
		name: "oxlint/correctness",
		rules: correctnessRules
	},
	"flat/perf": {
		name: "oxlint/perf",
		rules: perfRules
	},
	"flat/nursery": {
		name: "oxlint/nursery",
		rules: nurseryRules
	}
};
//#endregion
//#region src/constants.ts
const aliasPluginNames = {
	eslint: "",
	typescript: "@typescript-eslint",
	nextjs: "@next/next",
	node: "n",
	react_perf: "react-perf",
	jsx_a11y: "jsx-a11y",
	"import-x": "import"
};
const typescriptRulesExtendEslintRules = [
	"class-methods-use-this",
	"default-param-last",
	"init-declarations",
	"max-params",
	"no-array-constructor",
	"no-dupe-class-members",
	"no-empty-function",
	"no-invalid-this",
	"no-loop-func",
	"no-loss-of-precision",
	"no-magic-numbers",
	"no-redeclare",
	"no-restricted-imports",
	"no-shadow",
	"no-unused-expressions",
	"no-unused-vars",
	"no-use-before-define",
	"no-useless-constructor"
];
const reactHookRulesInsideReactScope = ["rules-of-hooks", "exhaustive-deps"];
const rulesDisabledForVueAstroAndSvelteFiles = [
	"no-unused-vars",
	"@typescript-eslint/no-unused-vars",
	"@typescript-eslint/consistent-type-imports",
	"react-hooks/rules-of-hooks"
];
//#endregion
//#region src/config-helper.ts
const overrideDisabledRulesForVueAndSvelteFiles = (config) => {
	const foundRules = Object.keys(config.rules).filter((rule) => rulesDisabledForVueAstroAndSvelteFiles.includes(rule));
	if (foundRules.length === 0) return config;
	const newConfig = structuredClone(config);
	newConfig.overrides = [{
		files: ["*.*"],
		excludedFiles: [
			"*.vue",
			"*.svelte",
			"*.astro"
		],
		rules: {}
	}];
	for (const rule of foundRules) {
		delete newConfig.rules[rule];
		newConfig.overrides[0].rules[rule] = "off";
	}
	return newConfig;
};
const splitDisabledRulesForVueAstroAndSvelteFiles = (config) => {
	const foundRules = Object.keys(config.rules).filter((rule) => rulesDisabledForVueAstroAndSvelteFiles.includes(rule));
	if (foundRules.length === 0) return [config];
	const oldConfig = structuredClone(config);
	const newConfig = {
		name: "oxlint/vue-svelte-astro-exceptions",
		ignores: [
			"**/*.vue",
			"**/*.svelte",
			"**/*.astro"
		],
		rules: {}
	};
	for (const rule of foundRules) {
		delete oldConfig.rules[rule];
		newConfig.rules[rule] = "off";
	}
	return [oldConfig, newConfig];
};
const splitDisabledRulesForVueAstroAndSvelteFilesDeep = (config) => {
	const result = {};
	for (const name in config) result[name] = splitDisabledRulesForVueAstroAndSvelteFiles(config[name]);
	return result;
};
//#endregion
//#region src/configs.ts
const allRulesIncludingNursery = Object.assign({}, ...Object.values(rules_by_scope_exports));
const allRules$1 = Object.fromEntries(Object.entries(allRulesIncludingNursery).filter(([ruleName]) => !(ruleName in nurseryRules)));
var configs_default = {
	recommended: overrideDisabledRulesForVueAndSvelteFiles({
		plugins: ["oxlint"],
		rules: correctnessRules
	}),
	all: overrideDisabledRulesForVueAndSvelteFiles({
		plugins: ["oxlint"],
		rules: allRules$1
	}),
	"flat/all": splitDisabledRulesForVueAstroAndSvelteFiles({
		name: "oxlint/all",
		rules: allRules$1
	}),
	"flat/recommended": splitDisabledRulesForVueAstroAndSvelteFiles({
		name: "oxlint/recommended",
		rules: correctnessRules
	}),
	...splitDisabledRulesForVueAstroAndSvelteFilesDeep(configByScope),
	...splitDisabledRulesForVueAstroAndSvelteFilesDeep(configByCategory)
};
//#endregion
//#region src/build-from-oxlint-config/types.ts
const oxlintConfigMeta = Symbol("eslint-plugin-oxlint config metadata");
//#endregion
//#region src/build-from-oxlint-config/utilities.ts
/**
* Detects it the value is an object
*/
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
/**
* tries to read the oxlint config file and returning its JSON content.
* if the file is not found or could not be parsed, undefined is returned.
* And an error message will be emitted to `console.error`
*/
const getConfigContent = (oxlintConfigFile) => {
	try {
		const content = fs.readFileSync(oxlintConfigFile, "utf8");
		try {
			const configContent = parse(content);
			if (!isObject(configContent)) throw new TypeError("not an valid config file");
			return configContent;
		} catch {
			console.error(`eslint-plugin-oxlint: could not parse oxlint config file: ${oxlintConfigFile}`);
			return;
		}
	} catch {
		console.error(`eslint-plugin-oxlint: could not find oxlint config file: ${oxlintConfigFile}`);
		return;
	}
};
//#endregion
//#region src/build-from-oxlint-config/rules.ts
const allRules = Object.values(rules_by_category_exports).flatMap((rulesObject) => Object.keys(rulesObject));
const typeAwareRules = new Set(Object.entries(rules_by_category_exports).filter(([key]) => key.endsWith("TypeAwareRules")).flatMap(([, rulesObject]) => Object.keys(rulesObject)));
const getEsLintRuleName = (rule, options = {}) => {
	if (!rule.includes("/")) {
		const found = allRules.find((search) => search.endsWith(`/${rule}`) || search === rule);
		if (!found) return;
		if (!options.withNursery && found in nurseryRules) return;
		if (!options.typeAware && typeAwareRules.has(found)) return;
		return found;
	}
	const match = rule.match(/(^.*)\/(.*)/);
	if (match === null) return;
	const pluginName = match[1];
	const ruleName = match[2];
	let esPluginName = pluginName in aliasPluginNames ? aliasPluginNames[pluginName] : pluginName;
	if (esPluginName === "react" && reactHookRulesInsideReactScope.includes(ruleName)) esPluginName = "react-hooks";
	if (esPluginName === "react" && ruleName == "only-export-components") esPluginName = "react-refresh";
	const expectedRule = esPluginName === "" ? ruleName : `${esPluginName}/${ruleName}`;
	const found = allRules.find((rule) => rule === expectedRule);
	if (!found) return;
	if (!options.withNursery && found in nurseryRules) return;
	if (!options.typeAware && typeAwareRules.has(found)) return;
	return found;
};
/**
* checks if value is validSet, or if validSet is an array, check if value is first value of it
*/
const isValueInSet = (value, validSet) => validSet.includes(value) || Array.isArray(value) && validSet.includes(value[0]);
/**
* check if the value is "off", 0, ["off", ...], or [0, ...]
*/
const isDeactivateValue = (value) => isValueInSet(value, ["off", 0]);
/**
* check if the value is "error", "warn", 1, 2, ["error", ...], ["warn", ...], [1, ...], or [2, ...]
*/
const isActiveValue = (value) => isValueInSet(value, [
	"error",
	"warn",
	1,
	2
]);
/**
* checks if the oxlint rule is activated/deactivated and append/remove it.
*/
const handleRulesScope = (oxlintRules, rules, options = {}) => {
	for (const rule in oxlintRules) {
		const eslintName = getEsLintRuleName(rule, options);
		if (eslintName === void 0) continue;
		if (isActiveValue(oxlintRules[rule])) {
			rules[eslintName] = "off";
			if (!eslintName.includes("/") && typescriptRulesExtendEslintRules.includes(eslintName)) {
				const tsAlias = `@typescript-eslint/${eslintName}`;
				if (allRules.includes(tsAlias)) rules[tsAlias] = "off";
			}
			if (eslintName.startsWith("@typescript-eslint/")) {
				const baseRule = eslintName.replace("@typescript-eslint/", "");
				if (typescriptRulesExtendEslintRules.includes(baseRule) && allRules.includes(baseRule)) rules[baseRule] = "off";
			}
		} else if (rule in rules && isDeactivateValue(oxlintRules[rule])) {
			delete rules[eslintName];
			if (!eslintName.includes("/") && typescriptRulesExtendEslintRules.includes(eslintName)) {
				const tsAlias = `@typescript-eslint/${eslintName}`;
				if (tsAlias in rules) delete rules[tsAlias];
			}
			if (eslintName.startsWith("@typescript-eslint/")) {
				const baseRule = eslintName.replace("@typescript-eslint/", "");
				if (baseRule in rules) delete rules[baseRule];
			}
		}
	}
};
/**
* tries to return the "rules" section from the config.
* it returns `undefined` when not found or invalid.
*/
const readRulesFromConfig = (config) => {
	return "rules" in config && isObject(config.rules) ? config.rules : void 0;
};
//#endregion
//#region src/build-from-oxlint-config/categories.ts
const defaultCategories = { correctness: "warn" };
/**
* appends all rules which are enabled by a plugin and falls into a specific category
*/
const handleCategoriesScope = (plugins, categories, rules, options = {}) => {
	for (const category in categories) {
		const configName = `${category}Rules`;
		if (category === "nursery" && !options.withNursery) continue;
		if (categories[category] === "off" || !(configName in rules_by_category_exports)) continue;
		const possibleRules = [];
		const typeAwareConfigName = `${category}TypeAwareRules`;
		if (options.typeAware && typeAwareConfigName in rules_by_category_exports) possibleRules.push(...Object.keys(rules_by_category_exports[typeAwareConfigName]));
		possibleRules.push(...Object.keys(rules_by_category_exports[configName]));
		for (const rule of possibleRules) for (const plugin of plugins) {
			const pluginPrefix = plugin in aliasPluginNames ? aliasPluginNames[plugin] : plugin;
			if (pluginPrefix === "" && !rule.includes("/")) rules[rule] = "off";
			else if (rule.startsWith(`${pluginPrefix}/`)) rules[rule] = "off";
		}
	}
};
/**
* tries to return the "categories" section from the config.
* it returns `undefined` when not found or invalid.
*/
const readCategoriesFromConfig = (config) => {
	return "categories" in config && isObject(config.categories) ? config.categories : void 0;
};
//#endregion
//#region src/build-from-oxlint-config/plugins.ts
const defaultPlugins = ["unicorn", "typescript"];
/**
* tries to return the "plugins" section from the config.
* it returns `undefined` when not found or invalid.
*/
const readPluginsFromConfig = (config) => {
	return "plugins" in config && Array.isArray(config.plugins) ? config.plugins : void 0;
};
//#endregion
//#region src/build-from-oxlint-config/ignore-patterns.ts
/**
* adds the ignore patterns to the config
*/
const handleIgnorePatternsScope = (ignorePatterns, config) => {
	config.ignores = ignorePatterns;
};
/**
* tries to return the "ignorePattern" section from the config.
* it returns `undefined` when not found or invalid.
*/
const readIgnorePatternsFromConfig = (config) => {
	return "ignorePatterns" in config && Array.isArray(config.ignorePatterns) ? config.ignorePatterns : void 0;
};
//#endregion
//#region src/build-from-oxlint-config/overrides.ts
const handleOverridesScope = (overrides, configs, baseCategories, options = {}) => {
	for (const [overrideIndex, override] of overrides.entries()) {
		const eslintRules = {};
		const eslintConfig = {
			name: `oxlint/from-oxlint-config-override-${overrideIndex}`,
			files: override.files
		};
		const plugins = readPluginsFromConfig(override);
		if (baseCategories !== void 0 && plugins !== void 0) handleCategoriesScope(plugins, baseCategories, eslintRules, options);
		const rules = readRulesFromConfig(override);
		if (rules !== void 0) handleRulesScope(rules, eslintRules, options);
		eslintConfig.rules = eslintRules;
		configs.push(eslintConfig);
	}
};
const readOverridesFromConfig = (config) => {
	return "overrides" in config && Array.isArray(config.overrides) ? config.overrides : void 0;
};
//#endregion
//#region src/build-from-oxlint-config/extends.ts
/**
* tries to return the "extends" section from the config.
* it returns `undefined` when not found or invalid.
*/
const readExtendsFromConfig = (config) => {
	return "extends" in config && Array.isArray(config.extends) ? config.extends : void 0;
};
/**
* Resolves the paths of the "extends" section relative to the given config file.
*/
const resolveRelativeExtendsPaths = (config) => {
	if (!config[oxlintConfigMeta]?.filePath) return;
	const extendsFiles = readExtendsFromConfig(config);
	if (!extendsFiles?.length) return;
	const configFileDirectory = path.dirname(config[oxlintConfigMeta].filePath);
	config.extends = extendsFiles.map((extendFile) => {
		if (typeof extendFile === "string") return path.resolve(configFileDirectory, extendFile);
		return extendFile;
	});
};
/**
* Appends plugins, rules and overrides from the extends configs files to the given config.
*/
const handleExtendsScope = (extendsConfigs, config) => {
	let rules = readRulesFromConfig(config) ?? {};
	const plugins = readPluginsFromConfig(config) ?? [];
	const overrides = readOverridesFromConfig(config) ?? [];
	for (const extendConfig of extendsConfigs) {
		plugins.unshift(...readPluginsFromConfig(extendConfig) ?? defaultPlugins);
		rules = {
			...readRulesFromConfig(extendConfig),
			...rules
		};
		overrides.unshift(...readOverridesFromConfig(extendConfig) ?? []);
	}
	if (plugins.length > 0) config.plugins = [...new Set(plugins)];
	if (Object.keys(rules).length > 0) config.rules = rules;
	if (overrides.length > 0) config.overrides = overrides;
};
/**
* tries to return the content of the chain "extends" section from the config.
*/
const readExtendsConfigsFromConfig = (config) => {
	const extendsFiles = readExtendsFromConfig(config);
	if (!extendsFiles?.length) return [];
	const extendsConfigs = [];
	for (const file of extendsFiles) {
		if (typeof file !== "string") {
			const extended = readExtendsConfigsFromConfig(file);
			delete file.extends;
			extendsConfigs.push(file, ...extended);
			continue;
		}
		const extendConfig = getConfigContent(file);
		if (!extendConfig) continue;
		extendConfig[oxlintConfigMeta] = { filePath: file };
		resolveRelativeExtendsPaths(extendConfig);
		const extended = readExtendsConfigsFromConfig(extendConfig);
		delete extendConfig.extends;
		extendsConfigs.push(extendConfig, ...extended);
	}
	return extendsConfigs;
};
//#endregion
//#region src/build-from-oxlint-config/index.ts
/**
* builds turned off rules, which are supported by oxlint.
* It accepts an object similar to the .oxlintrc.json file.
*/
const buildFromOxlintConfig = (config, options = {}) => {
	if (config.options?.typeAware === true && options.typeAware === void 0) options.typeAware = true;
	resolveRelativeExtendsPaths(config);
	const extendConfigs = readExtendsConfigsFromConfig(config);
	if (extendConfigs.length > 0) handleExtendsScope(extendConfigs, config);
	const rules = {};
	const plugins = readPluginsFromConfig(config) ?? defaultPlugins;
	const categories = readCategoriesFromConfig(config) ?? defaultCategories;
	plugins.push("eslint");
	if (plugins.includes("react")) plugins.push("react-hooks");
	handleCategoriesScope(plugins, categories, rules, options);
	const configRules = readRulesFromConfig(config);
	if (configRules !== void 0) handleRulesScope(configRules, rules, options);
	const baseConfig = {
		name: "oxlint/from-oxlint-config",
		rules
	};
	const overrides = readOverridesFromConfig(config);
	const configs = splitDisabledRulesForVueAstroAndSvelteFiles(baseConfig);
	if (overrides !== void 0) handleOverridesScope(overrides, configs, categories, options);
	const ignorePatterns = readIgnorePatternsFromConfig(config);
	if (ignorePatterns === void 0) return configs;
	else {
		const ignoreConfig = { name: "oxlint/oxlint-config-ignore-patterns" };
		handleIgnorePatternsScope(ignorePatterns, ignoreConfig);
		return [ignoreConfig, ...configs];
	}
};
/**
* builds turned off rules, which are supported by oxlint.
* It accepts an filepath to the .oxlintrc.json file.
*
* It the .oxlintrc.json file could not be found or parsed,
* no rules will be deactivated and an error to `console.error` will be emitted
*/
const buildFromOxlintConfigFile = (oxlintConfigFile, options = {}) => {
	const config = getConfigContent(oxlintConfigFile);
	if (config === void 0) return [];
	config[oxlintConfigMeta] = { filePath: path.resolve(oxlintConfigFile) };
	return buildFromOxlintConfig(config, options);
};
//#endregion
//#region src/index.ts
var src_default = {
	configs: configs_default,
	buildFromOxlintConfig,
	buildFromOxlintConfigFile
};
//#endregion
export { src_default as default };
