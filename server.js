var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('socket.io'),
		sys = require('sys'),
		
		server = http.createServer(function(req, res){
			// your normal server code
			var path = url.parse(req.url).pathname;
			switch (path){
				case '/json.js':
				case '/collabpaint.js':
				case '/collabpaint.html':
					sendFile(path, req, res);
					break;
				default:
					sendFile('/collabpaint.html', req, res);
			}
		});

function sendFile(path, req, res) {
	fs.readFile(__dirname + path, function(err, data){
		if (err) return send404(res);
		res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
		res.write(data, 'utf8');
		res.end();
	});
}
		

server.listen(8080);
		
// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server),
buffer = [];
		
io.on('connection', function(client){
	
	client.send({ buffer: buffer });

	client.broadcast({ announcement: client.sessionId + ' connected' });

	client.on('message', function(coords) {
		var msg = { coords: coords, session_id: client.sessionId };
		buffer.push(msg);
		if (buffer.length > 200) {
			buffer.shift();
		}
		client.broadcast(msg);
	});

	client.on('disconnect', function(){
		client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});
