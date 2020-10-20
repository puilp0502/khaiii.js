#!/bin/bash

DIR="$( cd "$( dirname "$0")" >/dev/null 2>&1 && pwd )"
ROOT="$( cd "$( dirname "$0")/../" >/dev/null 2>&1 && pwd )"
mkdir -p $ROOT/bin

if [ "$KHAIII_DEBUG" == "0" ] || [ -z "$KHAIII_DEBUG" ]; then
	BUILDSCRIPT=$DIR/_libkhaiiijsbuilder-release.sh
else
	BUILDSCRIPT=$DIR/_libkhaiiijsbuilder-debug.sh
fi
echo "Using buildscript $BUILDSCRIPT"
docker run \
	--user $(id -u):$(id -g) \
	-v $ROOT/bin:/host \
	-v $BUILDSCRIPT:/builder.sh \
	-it \
	emscripten/emsdk:2.0.6 bash /builder.sh


