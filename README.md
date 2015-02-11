# Simple Container Benchmarks

Run some simple benchmarks on computational filesystem write performance. The benchmarks are simplistic and probably don't represent workloads in your app.

### How the tests work

This depends on `dd` to exercise both storage and CPU. 

To get write performance, it pipes a gigabyte of zeros to a file on the filesystem:

```
dd bs=1M count=1024 if=/dev/zero of=~/simple-container-benchmarks-writetest conv=fdatasync
```

To test CPU performance, it fetches random numbers and md5 hashes them:

```
dd if=/dev/urandom bs=1M count=256 | md5sum
```

There are many valid criticisms of these methods of testing performance. I use them because they can be easily run on any unix-like system with no software to install.

### What else is going on?

The tests results are uploaded to a [Manta](https://www.joyent.com/object-storage) object store account defined at `docker run`. These results include some identifying details about the container and host, including memory and the results of `lscpu`.

The environment variables and SSH key needed to connect Manta are passed in the `docker run`. The example command below is set to read these vars and the SSH key from the environment from which the `docker run` is executed. Be sure to modify these for the correct location of your ssh key, or if you want to send the benchmarks to different account.

### Build

```
sudo docker build -t misterbisson/simple-container-benchmarks .
```

### Run

```
sudo docker run -d \
-e "MANTA_URL=$MANTA_URL" \
-e "MANTA_USER=$MANTA_USER" \
-e "MANTA_SUBUSER=$MANTA_SUBUSER" \
-e "MANTA_KEY_ID=$MANTA_KEY_ID" \
-e "SKEY=`cat ~/.ssh/id_rsa`" \
-e "SKEYPUB=`cat ~/.ssh/id_rsa.pub`" \
-e "DOCKER_HOST=INSERT_IP_HERE" \
misterbisson/simple-container-benchmarks
```