import { ModuleFS } from "libkhaiii";
import { ensureSlash } from "./util";

export function initNodeFS(resourceRoot: string, fsRoot: string, FS: ModuleFS) {
  if (!resourceRoot) {
    resourceRoot = __dirname + '/resources/';
  }
  resourceRoot = ensureSlash(resourceRoot, true);
  fsRoot = ensureSlash(fsRoot, true);
  try {
    FS.mount(FS.filesystems.NODEFS, { root: resourceRoot }, fsRoot);
  } catch (e) {
    console.error(`[nodefs] Error while mounting ${resourceRoot}:`, e);
    throw e;
  }
}
