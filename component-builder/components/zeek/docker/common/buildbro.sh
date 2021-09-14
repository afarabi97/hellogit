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
  --prefix=/usr/local/zeek-${VER} \
  --build-type=MinSizeRel \
  --disable-broker-tests \
  --disable-zeekctl \
  --disable-auxtools \
  --disable-python

make -j4 install

strip -s /usr/local/zeek-${VER}/bin/zeek
