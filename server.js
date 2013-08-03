// requires
var express = require('express');
var app = express();
var io = require('socket.io');
var port = process.argv[2] || 8888;
var server = require('http').createServer(app);
var socket = io.listen(server);

// setup static files directory
app.use(express.static(__dirname + '/public'));

// start server listening
server.listen(port);

// state
var buffer = [];
var count = 0;


socket.on('connection', function(client) {
	
	count++;

    // each time a new person connects, send them the old stuff
	client.emit('message', {
		buffer: buffer,
		count: count
	});

    // send a welcome
	client.broadcast.emit('message', {count: count, sessionId: client.sessionId})
			
	// message
	client.on('paint', function(data) {
		
		var msg = {
			circle: data,
			session_id: data.sessionId
		}

		buffer.push(msg)

		if (buffer.length > 1024) buffer.shift();

		client.broadcast.emit('paint', msg);

	});

    client.on('reset', function() {
        client.broadcast.emit('reset');
    });

    client.on('clear', function() {
        buffer = [];
        client.broadcast.emit('clear');
    });
	
	client.on('disconnect', function(){
		count--;
        client.broadcast.emit('message', {count: count, sessionId: client.sessionId});
    });
    
});
