var express = require('express')
    , app = express.createServer()
	, io = require('socket.io')
	, port = process.argv[2] || 80
	, socket

app.use(express.static(__dirname + '/public'))
app.listen(port)

socket = io.listen(app)

console.log(socket)
socket.on('connection', function(client) {
	console.log(client)
	client.on('message', function(coords) {
		client.broadcast({
			coords: coords,
			session_id: client.sessionId
		});
	});
});
