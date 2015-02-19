# Simple Container Benchmarks

Run some simple benchmarks on computational and filesystem write performance. The benchmarks are simplistic and probably don't represent workloads in your app.

It's likely that all benchmarking tools suffer fundamental flaws, this is no exception. Consider the following:

> Benchmarking is treacherous and confusing, and often done poorly - which means that you need to take any benchmark results with a large grain of salt.

> If you've spent less than a week studying a benchmark result, it's probably wrong.

If that caught your attention, read the Summary near the end of [Brendan's blog post](http://www.brendangregg.com/ActiveBenchmarking/bonnie++.html#summary), then read the reast. The quotes come from that post, and Brendan explains them in much more detail there.

The best way to benchmark a system is to run your app on it, since no other code will behave quite the same way.

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

### Where are the benchmarks?

They're in Manta and in the `docker logs $container_id`.

### Run

Start the container with these args to send the Manta environment vars and SSH key:

```
sudo docker run -d --restart=no \
-e "MANTA_URL=$MANTA_URL" \
-e "MANTA_USER=$MANTA_USER" \
-e "MANTA_SUBUSER=$MANTA_SUBUSER" \
-e "MANTA_KEY_ID=$MANTA_KEY_ID" \
-e "SKEY=`cat ~/.ssh/id_rsa`" \
-e "SKEYPUB=`cat ~/.ssh/id_rsa.pub`" \
-e "DOCKER_HOST=$DOCKER_HOST" \
misterbisson/simple-container-benchmarks
```

Use `printenv` to inspect the value of the environment variables the above `docker run` command args will send to the container.

You can loop it to start three at a time:

```
i=0; while [ $i -lt 3 ]; do sudo docker run -d --restart=no \
-e "MANTA_URL=$MANTA_URL" \
-e "MANTA_USER=$MANTA_USER" \
-e "MANTA_SUBUSER=$MANTA_SUBUSER" \
-e "MANTA_KEY_ID=$MANTA_KEY_ID" \
-e "SKEY=`cat ~/.ssh/id_rsa`" \
-e "SKEYPUB=`cat ~/.ssh/id_rsa.pub`" \
-e "DOCKER_HOST=$DOCKER_HOST" \
misterbisson/simple-container-benchmarks; \
i=$[$i+1]; sleep 1; done
```

Or, why not start 30?

```
i=0; while [ $i -lt 30 ]; do sudo docker run -d --restart=no \
-e "MANTA_URL=$MANTA_URL" \
-e "MANTA_USER=$MANTA_USER" \
-e "MANTA_SUBUSER=$MANTA_SUBUSER" \
-e "MANTA_KEY_ID=$MANTA_KEY_ID" \
-e "SKEY=`cat ~/.ssh/id_rsa`" \
-e "SKEYPUB=`cat ~/.ssh/id_rsa.pub`" \
-e "DOCKER_HOST=$DOCKER_HOST" \
misterbisson/simple-container-benchmarks; \
i=$[$i+1]; sleep 1; done
```

### Build

```
sudo docker build -t misterbisson/simple-container-benchmarks .
```
