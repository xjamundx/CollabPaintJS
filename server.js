var http = require('http'),
	WIDTH = 320,
	HEIGHT = 430,
	url = require('url'),
	fs = require('fs'),
	io = require('socket.io'), 
	spawn = require('child_process').spawn,
	sys = require('sys'),
	querystring = require('querystring'),
	server = http.createServer(function(req, res) {
		var uri = url.parse(req.url),
			path = uri.pathname,
			args = {},
			len,
			num,
			soundFile,
			freq,
			sox,
			soxCmd = '/Users/jamund/Downloads/sox-14.3.1/sox',
			soxArgs;
		
		// if there are arguments, get them
		if (uri.query) {
			args = querystring.parse(uri.query);
		}
		
		// check if they're going to /sound
		if (/\/sound/.test(path)) {
			num = Math.random() * 4000;
			len = args.x / WIDTH + .25;
			freq = Math.floor(args.y / HEIGHT * 2000) + 300;
			soundFile = __dirname + '/sine-' + num + '.wav';
			soxArgs = ['-t', 'null', '/dev/null', soundFile, 'synth', len, 'sine', freq];
		    sox = spawn(soxCmd, soxArgs);
			sox.on('exit', function (code) {
				
				fs.readFile(soundFile, function(err, data) {
					if (!err) {
						res.writeHead(200, {'Content-Type':'audio/x-wav'})
						res.write(data, 'binary');
						res.end();
						fs.unlink(soundFile, function(err) {
							if (err) {
								console.log('could not delete ' + soundFile);
								console.log(err);
							} else {
								console.log('successfully deleted ' + soundFile);
							}
	  					});
	  				} else {
	  					console.log("error reading " + soundFile);
	  					console.log(err);
	  				}
				});
				
				if (code !== 0) {
				    console.log('ps process exited with code ' + code);
				}
				
				num++;
				
			});

			return;
		}	
		
		// force any unknown request to collabsound.html
		if (path !== "/json.js" && path !== "/collabsound.js" && path !== "/collabsound.html") {
			path = "/collabsound.html";
		}

		fs.readFile(__dirname + path, function(err, data) {
			if (!err) {
				res.writeHead(200, {'Content-Type': /\.js$/.test(path) ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			} else {
				console.log("error reading " + path);
				console.log(err);
			}
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
