export default function npmRunAll(patternOrPatterns: string | string[], options?: NpmRunAllOptions): Promise<null | NpmRunAllResult[]>;
export type ConfigValue = string | number | boolean | null | undefined;
export type ConfigMap = Record<string, ConfigValue>;
export type PackageConfigMap = Record<string, ConfigMap>;
export type PackageInfo = {
    path: string;
    body: PackageJson;
};
export type NpmRunAllOptions = {
    parallel?: boolean;
    stdin?: Readable | null;
    stdout?: Writable | null;
    stderr?: Writable | null;
    taskList?: string[] | null;
    config?: ConfigMap | null;
    packageConfig?: PackageConfigMap | null;
    arguments?: string[];
    silent?: boolean;
    continueOnError?: boolean;
    printLabel?: boolean;
    printName?: boolean;
    maxParallel?: number;
    npmPath?: string | null;
    race?: boolean;
    aggregateOutput?: boolean;
    nodeRun?: boolean;
    colorMode?: ColorMode;
};
export type NpmRunAllResult = {
    name: string;
    code: number | undefined;
};
export type PackageJsonConfig = {
    nodeRun?: boolean;
};
import type { PackageJson } from 'read-package-json-fast';
import type { Readable } from 'node:stream';
import type { Writable } from 'node:stream';
import type { ColorMode } from './run-task.js';
//# sourceMappingURL=index.d.ts.map