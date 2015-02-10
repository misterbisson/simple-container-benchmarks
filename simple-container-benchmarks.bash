#!/bin/bash 

# create the necessary key files based on env vars provided in the docker run command
echo $SKEY > ~/.ssh/id_rsa
echo $SKEYPUB > ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/id_rsa*

# prep the file where we save our output
touch ./output.txt # create it if it doesn't exist
cat /dev/null > ./output.txt # truncate it, if the file has previous content in it

# system identification
echo '------------------------------' >> output.txt
echo 'Performance benchmarks' >> output.txt
echo '------------------------------' >> output.txt
echo 'hostname: '$(hostname) >> output.txt
echo "dockerhost: DOCKER_HOST" >> output.txt
echo 'date: '$(date) >> output.txt


# get disk performance stats
echo '' >> output.txt
echo '------------------------------' >> output.txt
echo 'FS write performance' >> output.txt
echo '------------------------------' >> output.txt
prefix='disk: '
COUNTER=0
while [  $COUNTER -lt 10 ]; do
#    value=$((dd bs=1M count=1024 if=/dev/zero of=test1 conv=fdatasync) 2>&1 | tail -1 | cut -f 3 -d ',' | sed -e 's/^ *//' -e 's/ *$//')
    value=$((dd bs=1M count=1024 if=/dev/zero of=test1 conv=fdatasync) 2>&1 | tail -1 | sed -e 's/^ *//' -e 's/ *$//')
    echo $prefix$value >> output.txt
    let COUNTER=COUNTER+1 
done

# get processor performance stats
echo '' >> output.txt
echo '------------------------------' >> output.txt
echo 'CPU performance' >> output.txt
echo '------------------------------' >> output.txt
prefix='proc: '
COUNTER=0
while [  $COUNTER -lt 10 ]; do
#    value=$((dd if=/dev/urandom bs=1M count=256 | md5sum) 2>&1 >/dev/null | tail -1 | cut -f 2 -d ',' | sed -e 's/^ *//' -e 's/ *$//')
    value=$((dd if=/dev/urandom bs=1M count=256 | md5sum) 2>&1 >/dev/null | tail -1 | sed -e 's/^ *//' -e 's/ *$//')
    echo $prefix$value >> output.txt
    let COUNTER=COUNTER+1 
done

# get system info
echo '' >> output.txt
echo '------------------------------' >> output.txt
echo 'System info' >> output.txt
echo '------------------------------' >> output.txt
#mem=$(free | awk '/^Mem:/{print $2}')
free | head -2 >> output.txt
lscpu >> output.txt

# get the name for the file when we upload to Manta
destfilesuffix='.txt'
destfile=$(echo $(date)$(hostname) | md5sum)$destfilesuffix

# move the file to Manta
mmkdir ~~/stor/simple-bench
mput ./output.txt ~~/stor/simple-bench/$destfile

# report
echo ./output.txt