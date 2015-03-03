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

server.get('/ips', ips);
function ips(req, res, next) {
	console.log('/ips request');

	var output = "";

	// the host from the request + what the server thinks its hostname is
	output += "host: " + req.headers.host + " " + exec("hostname", {silent:true}).output;

	// the ethernet interface IPs
	// stolen from http://stackoverflow.com/a/8440736
	var os = require('os');
	var ifaces = os.networkInterfaces();

	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;

		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}

			if (alias >= 1) {
				// this single interface has multiple ipv4 addresses
				output += ifname + ':' + alias + ': ' + iface.address + "\n";
			} else {
				// this interface has only one ipv4 adress
				output += ifname + ': ' + iface.address + "\n";
			}
		});
	});

	console.log(output);

	res.setHeader('content-type', 'text/plain');
	res.send(output);
	next();
}

server.listen(80, function() {
	console.log('%s listening at %s', server.name, server.url);
});
