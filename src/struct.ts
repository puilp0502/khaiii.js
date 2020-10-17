type IRPrimitives = "i8" | "i16" | "i32" | "i64" | "float" | "double" | "*";
type SingularField = [string, IRPrimitives];
type ArrayField = [string, IRPrimitives, number];
type Field = SingularField | ArrayField;

interface EmscriptenModule {
  getValue: typeof getValue;
}

const PrimitiveSize: { [P in IRPrimitives]: number } = {
  i8: 1,
  i16: 2,
  i32: 4,
  i64: 8,
  float: 4,
  double: 8,
  "*": 4,
};

export function makeStruct(fields: Field[]) {
  const offsetTable: { [key: string]: number } = {};
  let offset = 0;
  for (const field of fields) {
    if (field.length === 2) {
      const [name, type] = field;
      offsetTable[name] = offset;
      offset += PrimitiveSize[type];
    } else if (field.length === 3) {
      const [name, type, length] = field;
      offsetTable[name] = offset;
      offset += PrimitiveSize[type] * length;
    }
  }
  class Struct {
    ptr: number;
    Module: EmscriptenModule;
    [key: string]: any;
    constructor(ptr: number, Module: EmscriptenModule) {
      this.ptr = ptr;
      this.Module = Module;
      for (const field of fields) {
        if (field.length === 2) {
          const [name, type] = field;
          Object.defineProperty(this, name, {
            get: () => this.Module.getValue(this.ptr + offsetTable[name], type),
          });
        } else if (field.length === 3) {
          const [name, type, length] = field;
          Object.defineProperty(this, name, {
            get: () =>
              Array.from({ length: length }, (_, i) =>
                this.Module.getValue(
                  this.ptr + offsetTable[name] + i * PrimitiveSize[type],
                  type
                )
              ),
          });
        }
      }
    }
  }

  return Struct;
}
