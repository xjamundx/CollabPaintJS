;(function() {

	var canvas, ctx, touchdown, receive, send, drawCircle, socket, drawMove, iphone = false;

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

		setTimeout(function() { window.scrollTo(0, 1) }, 100);

		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
	
		canvas.onmousedown = function(e) {
			touchdown = true;
		};
	
		canvas.ontouchmove = function(e) {
			iphone=true;
			drawMove(e);
			e.preventDefault();
		}
	
		document.querySelector("body").ontouchmove = function(e) {
			drawMove(e);
			e.preventDefault();
		}


		canvas.onmousemove = function(e) {
			drawMove(e);	
		};
	

		window.onmouseup = function(e) {
			touchdown = false;
		};
		
	};

	var drawMove = function(e) {
		var coords;
		if (touchdown) {
			coords = {
				x:e.clientX - e.target.offsetLeft + window.scrollX,
				y:e.clientY - e.target.offsetTop + window.scrollY
			};
			drawCircle("red", coords);
			send(coords);
		} else if (iphone) {
			coords = {
				x: e.targetTouches[0].clientX,
				y: e.targetTouches[0].clientY
			};			
			drawCircle("red", coords);
			send(coords);
		}
	};
})();
