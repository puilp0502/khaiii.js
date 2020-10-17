// console.log(__non_webpack_require__);

// const fs = __non_webpack_require__('fs');

// Emscripten assigns resulting factory function to module.exports, so we're stuck with require for now
const libkhaiii = require("../bin/libkhaiii");

import { ensureSlash, mkdirP } from "./fs/util";
import { initNodeFS } from "./fs/nodefs";
import { fetchFromWeb } from "./fs/webfs";
import { Khaiii, khaiii_morph_t_, khaiii_word_t_ } from "./Khaiii";

type KhaiiiConfig = {
  resourceProvider: "webfs" | "nodefs";
  resourceRoot: string;
  KhaiiiOption?: any;
};

const RESOURCE_DIR = "/khaiii";

async function initialize(config: KhaiiiConfig) {
  const Module = await libkhaiii();
  mkdirP(RESOURCE_DIR, Module.FS);

  switch (config.resourceProvider) {
    case "webfs":
      console.log(config.resourceRoot);
      await fetchFromWeb(config.resourceRoot, RESOURCE_DIR, Module.FS);
      break;
    case "nodefs":
      initNodeFS(config.resourceRoot, RESOURCE_DIR, Module.FS);
      break;
    default:
      throw `Invalid resource provider specified: ${config.resourceProvider}. Valid providers are: 'webfs', 'nodefs'`;
  }

  const khaiii = new Khaiii(Module, RESOURCE_DIR, config.KhaiiiOption || {});
  return khaiii;
}
export { initialize, khaiii_morph_t_, khaiii_word_t_, Khaiii };
