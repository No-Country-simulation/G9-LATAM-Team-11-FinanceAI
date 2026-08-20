export default function runTask(task: string, options: RunTaskOptions): AbortableRunTaskPromise;
export type ColorMode = "auto" | "none" | "16" | "256";
export type LabelState = PrefixState & {
    enabled: boolean;
    width: number;
};
export type RunTaskOptions = {
    stdin: Readable | null;
    stdout: Writable | null;
    stderr: Writable | null;
    prefixOptions: string[];
    labelState: LabelState;
    printName: boolean;
    packageInfo: PackageInfo | null;
    npmPath?: string | null | undefined;
    nodeRun?: boolean;
    colorMode?: ColorMode;
};
export type RunTaskResult = {
    task: string;
    code: number | null;
    signal: NodeJS.Signals | null;
};
export type AbortableRunTaskPromise = Promise<RunTaskResult> & {
    abort: () => void;
};
import type { PrefixState } from './create-prefix-transform-stream.js';
import type { Readable } from 'node:stream';
import type { Writable } from 'node:stream';
import type { PackageInfo } from './index.js';
//# sourceMappingURL=run-task.d.ts.map