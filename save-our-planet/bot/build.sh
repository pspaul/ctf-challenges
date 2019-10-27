#!/bin/sh
set -e

# create XPI file
cd ../extension/
zip -Z deflate -r -FS ../bot/save-our-planet.xpi *
cd ../bot/

# build container
docker build -t pspaul/firefuxss .
