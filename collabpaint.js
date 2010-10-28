;(function() {

	var canvas, ctx, touchdown, receive, send, drawCircle, socket;
	
	receive = function(msg) {
		if ('coords' in msg) {
			drawCircle("blue", msg.coords);
		}
	};
	
	send = function(coords) {
		socket.send(coords);
	};
	
	drawCircle = function(color, coords) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(coords.x,coords.y);
		ctx.arc(coords.x, coords.y, 5, 0,  Math.PI*2, true);
		ctx.fill();
		ctx.closePath();
	};
	
	socket = new io.Socket(null, {port: 8080});
	socket.connect();
	socket.on('message', function(msg) {
		if ('buffer' in msg) {
			for (var i=0;i<msg.buffer.length;i++) {				
				receive(msg.buffer[i]);
			}
		} else {
			receive(msg);
		}
	});
	
	window.onload = function() {
	
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
	
		window.onmousedown = function() {
			touchdown = true;
		};
	
		canvas.onmousemove = function(e) {
			var coords;
			if (touchdown) {
				coords = {
					x:e.clientX - e.target.offsetLeft + window.scrollX,
					y:e.clientY - e.target.offsetTop + window.scrollY
				};
				drawCircle("red", coords);
				send(coords);
			}
	
		};
	
		window.onmouseup = function() {
			touchdown = false;
		};
		
	};
})();