var http = require('http'),
	url = require('url'),
	fs = require('fs'),
	io = require('socket.io'), 
	sys = require('sys'),
	server = http.createServer(function(req, res) {
		
		// force any unknown request to collabpaint.html
		var path = url.parse(req.url).pathname;
		if (path !== "/json.js" && path !== "/collabpaint.js" && path !== "/collabpaint.html") {
			path = "/collabpaint.html";
		}

		fs.readFile(__dirname + path, function(err, data) {
			res.writeHead(200, {'Content-Type': /\.js$/.test(path) ? 'text/javascript' : 'text/html'})
			res.write(data, 'utf8');
			res.end();
		});

	});
	
server.listen(8080);

var io = io.listen(server);

io.on('connection', function(client) {
	client.on('message', function(coords) {
		client.broadcast({
			coords: coords,
			session_id: client.sessionId
		});
	});
});
