#!/bin/bash -e
VER=$1
URL=$2

echo VER is $VER
echo URL is $URL

cd /usr/src/
if [ ! -e bro-${VER}.tar.gz ] ; then
    wget -c $URL
fi
if [ ! -d bro-${VER} ]; then
    tar xvzf bro-${VER}.tar.gz
fi
mv bro-${VER} zeek-${VER}
cd zeek-${VER}
./configure  \
  --prefix=/usr/local/zeek-${VER} \
  --build-type=MinSizeRel \
  --disable-broker-tests \
  --disable-broctl \
  --disable-auxtools \
  --disable-python

make -j4 install

strip -s /usr/local/zeek-${VER}/bin/bro
