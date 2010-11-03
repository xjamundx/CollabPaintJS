(function() {

	var ctx, touchdown, receive, send, drawCircle, socket, move;

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
	
	receive = function(msg) {
		if ('coords' in msg) {
			drawCircle("blue", msg.coords);
		}
	};
	
	send = function(coords) {
		socket.send(coords);
	};

	move = function(e, iphone) {
		var coords;
		iphone = iphone || false;
		if (touchdown) {
			coords = {
				x:e.clientX - e.target.offsetLeft + window.scrollX,
				y:e.clientY - e.target.offsetTop + window.scrollY
			};
			drawCircle("red", coords);
			send(coords);
		} else if (iphone) {
			for (var i=0; i<e.targetTouches.length; i++) {
				coords = {
					x: e.targetTouches[i].clientX,
					y: e.targetTouches[i].clientY
				};			
				drawCircle("red", coords);
				send(coords);
			}
		}
	};
		
	drawCircle = function(color, coords) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(coords.x,coords.y);
		ctx.arc(coords.x, coords.y, 5, 0,  Math.PI*2, true);
		ctx.fill();
		ctx.closePath();
	};
		
	window.onload = function() {
	
		var body, canvas;

		body = document.querySelector("body");
		canvas = document.querySelector('canvas');
		ctx = canvas.getContext('2d');
	
		// hide the toolbar in iOS
		setTimeout(function() { window.scrollTo(0, 1); }, 100);

		// prevents dragging the page in iOS	
		body.ontouchmove = function(e) {
			e.preventDefault();
		};
	
		// iOS alternative to mouse move
		canvas.ontouchmove = function(e) {
			move(e, true);
		};
		
		// typical draw evemt for desktop 
		canvas.onmousemove = function(e) {
			move(e);	
		};
	
	};

	window.onmouseup = function(e) {
		touchdown = false;
	};
		
	window.onmousedown = function(e) {
		touchdown = true;
	};
	
})();
