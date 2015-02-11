FROM ubuntu:14.04
RUN apt-get update -q
RUN apt-get install -qy npm
RUN command -v node >/dev/null 2>&1 || { ln -s /usr/bin/nodejs /usr/bin/node; }
RUN npm install smartdc -g
RUN npm install manta -g
RUN npm install json -g
RUN npm install bunyan -g
ADD ./bin /usr/local/sbin
CMD simple-container-benchmarks