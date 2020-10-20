#!/bin/sh

# Actual script run by the emsdk container to build libkhaiii.js.
# Do not run this file on the host directly.
# Instead, use build-libkhaiii.sh.

set -e

BUILDROOT=/host
mkdir -p $BUILDROOT/buildcache

cd $BUILDROOT/buildcache

mkdir -p $BUILDROOT/buildcache/.hunter/
export HUNTER_ROOT=$BUILDROOT/buildcache/.hunter/

[ ! -d "$BUILDROOT/buildcache/khaiii" ] && git clone https://github.com/puilp0502/khaiii.git
cd khaiii
rm -rf build
mkdir -p build
cd build

emcmake cmake .. 

emmake make -j$(nproc)
make resource

echo "Building WASM module.."
emcc libkhaiii.a -O3  \
	-s "EXPORTED_FUNCTIONS=['_khaiii_version', '_khaiii_open', '_khaiii_analyze', '_khaiii_free_results', '_khaiii_close', '_khaiii_last_error']" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap', 'FS', 'getValue', 'UTF8ToString']" \
	-s "EXPORT_NAME='createModule'" \
	-s DISABLE_EXCEPTION_CATCHING=0 \
	-s MODULARIZE=1 \
	-lnodefs.js \
	-o libkhaiii.js
echo "Done."

cp libkhaiii.js libkhaiii.wasm $BUILDROOT
cp -rT share/khaiii/ $BUILDROOT/resources


