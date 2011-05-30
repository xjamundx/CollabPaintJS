var express = require('express')
    , app = express.createServer()
	, io = require('socket.io')
	, port = process.argv[2] || 80
	, buffer = []
	, count = 0
	, socket

app.use(express.static(__dirname + '/public'))
app.listen(port)

socket = io.listen(app)

socket.on('connection', function(client) {
	
	count++;
	
	client.send({
		buffer: buffer,
		count: count
	});

	client.broadcast({count:count, session_id: client.sessionId})
			
	// message
	client.on('message', function(circle) {
		
		var msg = {
			circle: circle,
			session_id: client.sessionId
		}

		buffer.push(msg)

		if (buffer.length > 1024) buffer.shift();

		if (circle.clear) {
			msg.clear = true;
			msg.reset = true;
			buffer = [];
			delete msg.circle;
		}

		if (circle.reset) {
			msg.reset = true;
			delete msg.circle;
		}

		client.broadcast(msg);

	});
	
	client.on('disconnect', function(){
		count--;
        client.broadcast({count: count, session_id: client.sessionId});
    });
    
});
