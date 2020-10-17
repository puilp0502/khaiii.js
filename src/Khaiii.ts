import { LibkhaiiiModule } from "libkhaiii";
import { makeStruct } from "./struct";

type Pointer = number;

export const khaiii_morph_t_ = makeStruct([
  ["lex", "*"],
  ["tag", "*"],
  ["begin", "i32"],
  ["length", "i32"],
  ["reserved", "i8", 8],
  ["next", "*"],
]);
export const khaiii_word_t_ = makeStruct([
  ["begin", "i32"],
  ["length", "i32"],
  ["reserved", "i8", 8],
  ["morphs", "*"],
  ["next", "*"],
]);

type KhaiiiMorph = {
  lex: string;
  tag: string;
  begin: number;
  length: number;
};

type KhaiiiWord = {
  word: string;
  begin: number;
  length: number;
  morphs: KhaiiiMorph[];
};

export class Khaiii {
  _Module: LibkhaiiiModule;
  handle: number;

  // Function mapping
  _khaiii_version() {
    return this._Module.ccall("khaiii_version", "string", [], []);
  }
  _khaiii_open(rsc_dir: string, opt_str: string): number {
    return this._Module.ccall(
      "khaiii_open",
      "number",
      ["string", "string"],
      [rsc_dir, opt_str]
    );
  }
  _khaiii_analyze(handle: number, input: string, opt_str: string): Pointer {
    return this._Module.ccall(
      "khaiii_analyze",
      "number",
      ["number", "string", "string"],
      [handle, input, opt_str]
    );
  }
  _khaiii_free_results(handle: number, results: Pointer) {
    return this._Module.ccall(
      "khaiii_free_results",
      null,
      ["number", "number"],
      [handle, results]
    );
  }
  _khaiii_close(handle: number): void {
    return this._Module.ccall("khaiii_close", null, ["number"], [handle]);
  }
  _khaiii_last_error(handle: number): string {
    return this._Module.ccall(
      "khaiii_last_error",
      "string",
      ["number"],
      [handle]
    );
  }

  static _UTF8Alignment(str: string) {
    let alignment = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i); // This returns UTF-16 code unit (not codepoint!)
      let length = 0;
      if (0x0000 <= code && code <= 0x007f) {
        length = 1;
      } else if (0x0080 <= code && code <= 0x07ff) {
        length = 2;
      } else if (0x0800 <= code && code <= 0xd7ff) {
        length = 3;
      } else if (0xd800 <= code && code <= 0xdfff) {
        /**
         * Strictly, these code points does not correspond to Unicode characters;
         * Rather, these are surrogate pairs, which means two successive code units
         * describe one Unicode codepoint in Supplementary Plane (0x10000 ~ 0x10FFFF).
         * These codepoints are invalid in UTF-8, so we can't map these values directly
         * to UTF-8.
         * However, since all we're trying to do is align UTF-8 data with UTF-16 data,
         * we can just say that each of these values occupy 2 byte in UTF-8 encoding
         * (since Supplementary Plane codepoints occupy 4 bytes in UTF-8).
         */
        length = 2;
      } else if (0xe000 <= code && code <= 0xffff) {
        length = 3;
      }
      for (let j = 0; j < length; j++) alignment.push(i);
    }
    return alignment;
  }
  static _makeMorphs(
    ptr: Pointer,
    alignment: number[],
    Module: LibkhaiiiModule
  ) {
    let morphs: KhaiiiMorph[] = [];
    let morph_t_ = new khaiii_morph_t_(ptr, Module);
    while (morph_t_.ptr !== 0) {
      const begin = alignment[morph_t_.begin];
      const end = alignment[morph_t_.begin + morph_t_.length - 1];
      morphs.push({
        lex: Module.UTF8ToString(morph_t_.lex),
        tag: Module.UTF8ToString(morph_t_.tag),
        begin: begin,
        length: end - begin + 1,
      });
      morph_t_.ptr = morph_t_.next;
    }
    return morphs;
  }
  static _makeWords(
    ptr: Pointer,
    input: string,
    alignment: number[],
    Module: LibkhaiiiModule
  ) {
    let words: KhaiiiWord[] = [];
    let word_t_ = new khaiii_word_t_(ptr, Module);
    while (word_t_.ptr !== 0) {
      const begin = alignment[word_t_.begin];
      const end = alignment[word_t_.begin + word_t_.length - 1];
      words.push({
        word: input.substring(begin, end + 1),
        begin: begin,
        length: end - begin + 1,
        morphs: Khaiii._makeMorphs(word_t_.morphs, alignment, Module),
      });
      word_t_.ptr = word_t_.next;
    }
    return words;
  }

  analyze(input: string, option: unknown) {
    let ptr = this._khaiii_analyze(
      this.handle,
      input,
      JSON.stringify(option || {})
    );
    if (ptr === 0) {
      throw new Error(
        `Internal Khaiii Error: ${this._khaiii_last_error(this.handle)}`
      );
    }
    const alignment = Khaiii._UTF8Alignment(input);
    const words = Khaiii._makeWords(ptr, input, alignment, this._Module);
    this._khaiii_free_results(this.handle, ptr);
    return words;
  }

  constructor(Module: LibkhaiiiModule, resourceDir: string, option: unknown) {
    this._Module = Module;

    this.handle = this._khaiii_open(resourceDir, JSON.stringify(option));
    if (this.handle === -1) {
      throw new Error(
        `Internal Khaiii Error: ${this._khaiii_last_error(this.handle)}`
      );
    }
  }
}
