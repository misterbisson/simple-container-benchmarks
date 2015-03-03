FROM ubuntu:14.04
RUN apt-get update -q
RUN apt-get install -qy npm ssh htop
RUN command -v node >/dev/null 2>&1 || { ln -s /usr/bin/nodejs /usr/bin/node; }
RUN npm install manta shelljs -g
ADD ./sbin /usr/local/sbin
ADD ./server /server
RUN cd /server && npm install shelljs
CMD simple-container-benchmarks
