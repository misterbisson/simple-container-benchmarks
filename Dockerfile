FROM ubuntu:14.04

# install node and some other items
RUN apt-get update -q
RUN apt-get install -qy npm ssh htop
RUN command -v node >/dev/null 2>&1 || { ln -s /usr/bin/nodejs /usr/bin/node; }

# put the shell scripts in place
ADD ./sbin /usr/local/sbin

# our node server app
ADD ./server /server
RUN cd /server && npm install

# expose port 80 for the node server
EXPOSE 80

CMD ['node', '/server/server.js']