#!/bin/bash -e
VER=$1
URL=$2

echo VER is $VER
echo URL is $URL

cd /usr/src/
if [ ! -e zeek-${VER}.tar.gz ] ; then
    wget -c $URL
fi
if [ ! -d zeek-${VER} ]; then
    tar xvzf zeek-${VER}.tar.gz
fi
cd zeek-${VER}
./configure  \
  --prefix=/opt/zeek \
  --build-type=MinSizeRel

make -j4 install

strip -s /opt/zeek/bin/zeek
