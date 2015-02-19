FROM ubuntu:14.04
RUN apt-get update -q
RUN apt-get install -qy npm ssh htop
RUN command -v node >/dev/null 2>&1 || { ln -s /usr/bin/nodejs /usr/bin/node; }
RUN npm install manta -g
ADD ./bin /usr/local/sbin
CMD simple-container-benchmarks