var restify = require('restify');
var server = restify.createServer();
var exec = require('shelljs').exec;

server.get('/disk', disk);
function disk(req, res, next) {
	console.log('/disk request');
	var thing = exec("(dd bs=1M count=1024 if=/dev/zero of=/simple-container-benchmarks-writetest conv=fdatasync) 2>&1 | tail -1 | sed -e 's/^ *//' -e 's/ *$//'", {silent:true}).output;
	exec("rm /simple-container-benchmarks-writetest", {silent:true}).output;

	console.log(thing);

	res.setHeader('content-type', 'text/plain');
	res.send(thing);
	next();
}

server.get('/cpu', cpu);
function cpu(req, res, next) {
	console.log('/cpu request');
	var thing = exec("(dd if=/dev/urandom bs=1M count=256 | md5sum) 2>&1 >/dev/null | tail -1 | sed -e 's/^ *//' -e 's/ *$//'", {silent:true}).output;

	console.log(thing);

	res.setHeader('content-type', 'text/plain');
	res.send(thing);
	next();
}

server.get('/info', info);
function info(req, res, next) {
	console.log('/info request');

	var mem = exec("free | head -2", {silent:true}).output;
	var cpu = exec("lscpu", {silent:true}).output;

	console.log(mem + cpu);

	res.setHeader('content-type', 'text/plain');
	res.send(mem + cpu);
	next();
}

server.listen(80, function() {
	console.log('%s listening at %s', server.name, server.url);
});
