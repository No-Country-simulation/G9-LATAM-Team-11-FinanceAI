export default function createPrefixTransform(prefix: string, state: PrefixState): stream.Transform;
export type PrefixState = {
    lastPrefix: string | null;
    lastIsLinebreak: boolean;
};
import stream from 'node:stream';
//# sourceMappingURL=create-prefix-transform-stream.d.ts.map