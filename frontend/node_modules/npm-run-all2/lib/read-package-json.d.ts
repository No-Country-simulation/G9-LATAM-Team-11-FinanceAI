export default function readPackageJson(): Promise<ReadPackageJsonResult>;
export type ReadPackageJsonResult = {
    taskList: string[];
    packageInfo: PackageInfo;
};
import type { PackageInfo } from './index.js';
//# sourceMappingURL=read-package-json.d.ts.map