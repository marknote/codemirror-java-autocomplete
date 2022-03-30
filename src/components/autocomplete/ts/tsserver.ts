import { createSystem, createVirtualTypeScriptEnvironment, VirtualTypeScriptEnvironment } from '@typescript/vfs';
import ts, { CompilerOptions, CompletionInfo, WithMetadata } from 'typescript';
import { FS_MAP } from  './fs-map';

const ENTRY_POINT = 'index.ts';

export default class TsServer {

    private readonly _env: VirtualTypeScriptEnvironment;

    constructor() {
        const compilerOpts: CompilerOptions = {
            target: ts.ScriptTarget.ES2021,
            //module: ts.ScriptTarget.ES2020,
            lib: [
                'es2020',
                'dom',
                'webworker'
            ],
            esModuleInterop: true,
        };
        const initialText = 'const array=[];';

        const mapObj = JSON.parse(FS_MAP);
        const fsMap = new Map<string, string>(Object.entries(mapObj));

        fsMap.set(ENTRY_POINT, initialText);
        const system = createSystem(fsMap);
        this._env = createVirtualTypeScriptEnvironment(system, [ENTRY_POINT], ts, compilerOpts);
        this._env.createFile(ENTRY_POINT, initialText);
    }

    onCompleteRequest(text: string, pos: number): WithMetadata<CompletionInfo> | undefined {
        this._env.updateFile(ENTRY_POINT, text || '   ');
        return this._env.languageService.getCompletionsAtPosition(ENTRY_POINT, pos, {});
    }

}
