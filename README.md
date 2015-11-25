# Simple Container Benchmarks

[![DockerPulls](https://img.shields.io/docker/pulls/misterbisson/simple-container-benchmarks.svg)](https://registry.hub.docker.com/u/misterbisson/simple-container-benchmarks/)
[![DockerStars](https://img.shields.io/docker/stars/misterbisson/simple-container-benchmarks.svg)](https://registry.hub.docker.com/u/misterbisson/simple-container-benchmarks/)

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

### Where are the benchmarks?

Check `docker logs $container_id`.

### Run

Start the server container:

```
docker run -d \
-p 80:80 \
-p 5001:5001 \
--name=simple-container-benchmarks-server \
misterbisson/simple-container-benchmarks
```

Start the client container to read from the server we just started:

```
docker run -d \
--name=simple-container-benchmarks-client \
-e "DOCKER_HOST=$DOCKER_HOST" \
-e "TARGET=$(docker inspect --format='{{.NetworkSettings.IPAddress}}' simple-container-benchmarks-server)" \
misterbisson/simple-container-benchmarks
```

Note that I'm sending some additional environment vars there, including the docker host and the IP of the server container. I could use the `--link` argument, but my init script in the container is looking specifically for the `$TARGET` environment var.

Note: I'm also using Docker as the discovery directory here. Watch how that gets more interesting as we run more containers...

Running this takes a few minutes. You can check `docker logs $CONTAINERID` on the server to see some progress, and when the client container quits you can check the full log there.

### Run it a lot

One pass through isn't nearly as fun as three, or 30.

Let's loop it to start the server and client three at a time:

```
i=0; while [ $i -lt 3 ]; \
do docker run -d  -p 80:80 -p 5001:5001 --name=simple-container-benchmarks-server-$i misterbisson/simple-container-benchmarks && \
docker run -d -e "DOCKER_HOST=$DOCKER_HOST" -e "TARGET=$(docker inspect --format='{{.NetworkSettings.IPAddress}}' simple-container-benchmarks-server-$i)" --name=simple-container-benchmarks-client-$i misterbisson/simple-container-benchmarks; \
i=$[$i+1]; sleep 1; done
```

Oh, snap, maybe you got the following error?

```
FATA[0000] Error response from daemon: Cannot start container 8bfd697de55c09f0313d6d9ce546adbc0e187351858bb064a07007a2624da442: Bind for 0.0.0.0:80 failed: port is already allocated 
```

That error only makes sense if you don't expect the Docker API host to assign a unique IP for each container. You might even be used to that behavior, but that doesn't make it right.

Try the same thing on Joyent's elastic Docker host. Heck, why not start 30?

```
i=0; while [ $i -lt 30 ]; \
do docker run -d  -p 80:80 -p 5001:5001 --name=simple-container-benchmarks-server-$i misterbisson/simple-container-benchmarks && \
docker run -d -e "DOCKER_HOST=$DOCKER_HOST" -e "TARGET=$(docker inspect --format='{{.NetworkSettings.IPAddress}}' simple-container-benchmarks-server-$i)" --name=simple-container-benchmarks-client-$i misterbisson/simple-container-benchmarks; \
i=$[$i+1]; sleep 1; done
```

Each iteration through the loop spins up a server container, and if that goes successfully, it will spin up a client container as well. Take note of `-e "TARGET=$(docker inspect --format='{{.NetworkSettings.IPAddress}}' simple-container-benchmarks-server-$i)"` in the command to spin up the client container. That checks the Docker API for a container named `simple-container-benchmarks-server-$i`, gets the IP address for it, and inserts that IP in the `$TARGET` environment variable.

Using the Docker API as the directory for service discovery works well if the containers are named predictably (a "good" container name would probably be `$app-$version-$service`, or similar) _and_ if the Docker API can be trusted to know about _all_ the containers. That's exactly how it works on Joyent's elastic Docker host: the entire data center is a single host, and the API reports on all the containers running across all the physical compute nodes.

### Build

```
docker build -t misterbisson/simple-container-benchmarks .
```
