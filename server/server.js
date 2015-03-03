var restify = require('restify');
var server = restify.createServer();
var exec = require('shelljs').exec;

server.get('/disk', disk);
function disk(req, res, next) {
	var thing = exec("$((dd bs=1M count=1024 if=/dev/zero of=~/simple-container-benchmarks-writetest conv=fdatasync) 2>&1 | tail -1 | sed -e 's/^ *//' -e 's/ *$//')", {silent:true}).output;

	res.send(thing);
	next();
}

server.get('/cpu', cpu);
function cpu(req, res, next) {
	var thing = exec("$((dd if=/dev/urandom bs=1M count=256 | md5sum) 2>&1 >/dev/null | tail -1 | sed -e 's/^ *//' -e 's/ *$//')", {silent:true}).output;

	res.send(thing);
	next();
}

server.get('/info', info);
function info(req, res, next) {
	var mem = exec("free | head -2", {silent:true}).output;
	var cpu = exec("lscpu", {silent:true}).output;

	res.send(mem + cpu);
	next();
}

server.listen(80, function() {
	console.log('%s listening at %s', server.name, server.url);
});
