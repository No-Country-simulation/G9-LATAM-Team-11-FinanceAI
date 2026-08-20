export default class NpmRunAllError extends Error {
    constructor(causeResult: {
        name: string;
        task?: string;
        code: number;
    }, allResults: Array<{
        name: string;
        code: (number | undefined);
    }>);
    code: number;
    results: Array<{
        name: string;
        code: (number | undefined);
    }>;
}
//# sourceMappingURL=npm-run-all-error.d.ts.map