export default function runTasks(tasks: string[], options: RunTasksOptions): Promise<NpmRunAllResult[]>;
export type RunTasksOptions = RunTaskOptions & {
    continueOnError: boolean;
    race: boolean;
    maxParallel: number;
    aggregateOutput: boolean;
    stdout: Writable | null;
};
import type { NpmRunAllResult } from './index.js';
import type { RunTaskOptions } from './run-task.js';
import type { Writable } from 'node:stream';
//# sourceMappingURL=run-tasks.d.ts.map