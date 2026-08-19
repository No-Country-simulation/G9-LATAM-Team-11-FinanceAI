export default function matchTasks(taskList: string[], patterns: string[]): string[];
export type TaskFilter = {
    match: (candidate: string) => boolean;
    task: string;
    args: string;
    isGlob: boolean;
};
//# sourceMappingURL=match-tasks.d.ts.map