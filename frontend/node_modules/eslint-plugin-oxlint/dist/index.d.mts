import { Linter } from "eslint";

//#region src/config-helper.d.ts
type FlatConfig = {
  name?: string;
  rules?: Record<string, 'off'>;
  ignores?: string[];
};
type SplittedFlatConfig<C extends FlatConfig> = [C] | [C, FlatConfig];
//#endregion
//#region src/build-from-oxlint-config/types.d.ts
declare const oxlintConfigMeta: unique symbol;
type BuildFromOxlintConfigOptions = {
  withNursery?: boolean;
  typeAware?: boolean;
};
type OxlintConfigExtendsPath = string;
type OxlintConfigExtendsResolved = OxlintConfig;
type OxlintConfigExtends = (OxlintConfigExtendsPath | OxlintConfigExtendsResolved)[];
type OxlintConfigPlugins = string[];
type OxlintConfigCategories = Record<string, unknown>;
type OxlintConfigRules = Record<string, unknown>;
type OxlintConfigIgnorePatterns = string[];
type OxlintOptions = {
  typeAware?: boolean;
  typeCheck?: boolean;
};
type EslintPluginOxlintConfig = Linter.Config<Record<string, 'off'>>;
type OxlintConfig = {
  [key: string]: unknown;
  extends?: OxlintConfigExtends;
  plugins?: OxlintConfigPlugins;
  categories?: OxlintConfigCategories;
  rules?: OxlintConfigRules;
  ignorePatterns?: OxlintConfigIgnorePatterns;
  options?: OxlintOptions;
  [oxlintConfigMeta]?: {
    filePath: string;
  };
};
//#endregion
//#region src/index.d.ts
declare const _default: {
  configs: {
    readonly 'flat/pedantic': SplittedFlatConfig<{
      readonly name: "oxlint/pedantic";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/style': SplittedFlatConfig<{
      readonly name: "oxlint/style";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/suspicious': SplittedFlatConfig<{
      readonly name: "oxlint/suspicious";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/restriction': SplittedFlatConfig<{
      readonly name: "oxlint/restriction";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/correctness': SplittedFlatConfig<{
      readonly name: "oxlint/correctness";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/perf': SplittedFlatConfig<{
      readonly name: "oxlint/perf";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/nursery': SplittedFlatConfig<{
      readonly name: "oxlint/nursery";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/eslint': SplittedFlatConfig<{
      readonly name: "oxlint/eslint";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/import': SplittedFlatConfig<{
      readonly name: "oxlint/import";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/jest': SplittedFlatConfig<{
      readonly name: "oxlint/jest";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/jsdoc': SplittedFlatConfig<{
      readonly name: "oxlint/jsdoc";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/jsx-a11y': SplittedFlatConfig<{
      readonly name: "oxlint/jsx-a11y";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/nextjs': SplittedFlatConfig<{
      readonly name: "oxlint/nextjs";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/node': SplittedFlatConfig<{
      readonly name: "oxlint/node";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/promise': SplittedFlatConfig<{
      readonly name: "oxlint/promise";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/react': SplittedFlatConfig<{
      readonly name: "oxlint/react";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/react-hooks': SplittedFlatConfig<{
      readonly name: "oxlint/react-hooks";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/react-perf': SplittedFlatConfig<{
      readonly name: "oxlint/react-perf";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/typescript': SplittedFlatConfig<{
      readonly name: "oxlint/typescript";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/unicorn': SplittedFlatConfig<{
      readonly name: "oxlint/unicorn";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/vitest': SplittedFlatConfig<{
      readonly name: "oxlint/vitest";
      readonly rules: Record<string, "off">;
    }>;
    readonly 'flat/vue': SplittedFlatConfig<{
      readonly name: "oxlint/vue";
      readonly rules: Record<string, "off">;
    }>;
    readonly recommended: {
      plugins: string[];
      rules: Record<string, "off">;
    };
    readonly all: {
      plugins: string[];
      rules: Record<string, "off">;
    };
    readonly 'flat/all': SplittedFlatConfig<{
      name: string;
      rules: Record<string, "off">;
    }>;
    readonly 'flat/recommended': SplittedFlatConfig<{
      name: string;
      rules: Record<string, "off">;
    }>;
  };
  buildFromOxlintConfig: (config: OxlintConfig, options?: BuildFromOxlintConfigOptions) => EslintPluginOxlintConfig[];
  buildFromOxlintConfigFile: (oxlintConfigFile: string, options?: BuildFromOxlintConfigOptions) => EslintPluginOxlintConfig[];
};
//#endregion
export { _default as default };