var express = require('express')
    , app = express.createServer()
	, io = require('socket.io')
	, port = process.argv[2] || 80
	, buffer = []
	, socket

app.use(express.static(__dirname + '/public'))
app.listen(port)

socket = io.listen(app)

socket.on('connection', function(client) {

	// send the buffer
	client.broadcast({
		buffer: buffer,
		session_id: client.sessionId
	});
		
	// message
	client.on('message', function(circle) {
		var msg = {
			circle: circle,
			session_id: client.sessionId
		}

		if (circle.clear) {
			msg.clear = true;
			delete msg.circle;
		}

		buffer.push(msg)
		client.broadcast(msg);
	});
});
