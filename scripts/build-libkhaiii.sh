#!/bin/bash

DIR="$( cd "$( dirname "$0")" >/dev/null 2>&1 && pwd )"
ROOT="$( cd "$( dirname "$0")/../" >/dev/null 2>&1 && pwd )"
mkdir -p $ROOT/bin

docker run \
	--user $(id -u):$(id -g) \
	-v $ROOT/bin:/host \
	-v $DIR/_libkhaiiijsbuilder.sh:/builder.sh \
	-it \
	emscripten/emsdk:2.0.6 bash /builder.sh


