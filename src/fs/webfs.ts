import { ModuleFS } from "libkhaiii";
import { ensureSlash } from "./util";

const files = [
  "errpatch.len",
  "conv.5.fil",
  "restore.one",
  "errpatch.tri",
  "conv.2.fil",
  "conv.3.fil",
  "conv.4.fil",
  "restore.key",
  "cnv2hdn.lin",
  "errpatch.val",
  "embed.bin",
  "preanal.tri",
  "config.json",
  "preanal.val",
  "restore.val",
  "hdn2tag.lin",
];

export async function fetchFromWeb(
  resourceRoot: string,
  fsRoot: string,
  FS: ModuleFS
) {
  resourceRoot = ensureSlash(resourceRoot, true);
  fsRoot = ensureSlash(fsRoot, true);
  const fetches = files.map((fname) =>
    fetch(resourceRoot + fname)
      .then((resp) => resp.arrayBuffer())
      .then((buf) => [fname, buf])
  );
  return await Promise.all(fetches)
    .then(function (results) {
      results.map((result: [string, ArrayBuffer]) => {
        const [fname, arrayBuffer] = result;
        return FS.writeFile(fsRoot + fname, new Uint8Array(arrayBuffer));
      });
    })
    .catch((e) => {
      console.error(`[webfs] Error while mounting ${resourceRoot}:`, e);
    });
}
