import type { ModuleFS } from "libkhaiii";

const ENOENT = 44;
const EEXIST = 20;

export function ensureSlash(inputPath: string, needsSlash: boolean) {
  const hasSlash = inputPath.endsWith("/");
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}

export function mkdirP(path: string, FS: ModuleFS) {
  const directories = path.split("/");
  let currentDir = "";
  for (const directory of directories) {
    currentDir += directory + "/";
    try {
      FS.mkdir(currentDir);
    } catch (e) {
      if (e instanceof FS.ErrnoError) {
        if (e.errno === EEXIST) continue;
      }
      throw e;
    }
  }
}
