import "@types/emscripten";

// export as namespace createModule;
declare module "libkhaiii" {
  class ErrnoError {
    constructor(errno: number, node: FS.FSNode);
    errno: number;
    node: FS.FSNode;
  }
  interface ModuleFS {
    mount: typeof FS.mount;
    mkdir: typeof FS.mkdir;
    writeFile: typeof FS.writeFile;
    ErrnoError: typeof ErrnoError;
    filesystems: {
      NODEFS: typeof NODEFS;
    };
  }
  interface LibkhaiiiModule extends EmscriptenModule {
    ccall: typeof ccall;
    getValue: typeof getValue;
    UTF8ToString: typeof UTF8ToString;
    FS: ModuleFS;
  }

  export default function <T extends LibkhaiiiModule = LibkhaiiiModule>(
    modulesOverride?: Partial<T>
  ): Promise<T>;
}
