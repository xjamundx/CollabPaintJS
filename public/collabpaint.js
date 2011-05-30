(function() {

	var ctx, touchdown, receive, send, drawCircle, socket, move, i;

	socket = new io.Socket();
	socket.connect();
	socket.on('message', function(msg) {
		var i = 0;
		if ('buffer' in msg) {
			for (i; i < msg.buffer.length; i++) {				
				receive(msg.buffer[i]);
			}
		} else {
			receive(msg);
		}
	});

	window.onload = function() {

		var body = document.querySelector("body");
		var canvas = document.querySelector('canvas');
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
	function receive(msg) {
		if ('coords' in msg) {
			drawCircle("blue", msg.coords);
		}
	};
	
	function send(coords) {
		socket.send(coords);
	};

	function move(e, iphone) {
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
		
	function drawCircle(color, coords) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(coords.x,coords.y);
		ctx.arc(coords.x, coords.y, 5, 0,  Math.PI*2, true);
		ctx.fill();
		ctx.closePath();
	};
			
})();
