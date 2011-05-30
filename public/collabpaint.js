(function() {

	var ctx, touchdown, drawCircle, socket, i, last, color, size, width, height;

	socket = new io.Socket()
	socket.connect()
	
	socket.on('message', receive);

	// locals
	var body = document.querySelector("body")
		, $canvas = document.getElementById("canvas")
		, $size = document.getElementById("size")
		, $color = document.getElementById("color")
		, $clear = document.getElementById("clear")
		, $game = document.getElementById("game")
		, $count = document.getElementById("count")
	
	// globals
	ctx = $canvas.getContext('2d');
	width = $canvas.getAttribute("width");
	height = $canvas.getAttribute("height");

	// get the starting size
	size = $size.options[$size.selectedIndex].value
	color = $color.options[$color.selectedIndex].value.toLowerCase()
	
	// hide the toolbar in iOS
	setTimeout(function() { window.scrollTo(0, 1); }, 100);

	// prevents dragging the page in iOS	
	body.ontouchmove = function(e) {
		e.preventDefault();
	};

	// iOS alternative to mouse move
	$canvas.ontouchmove = function(e) {
		move(e, true);
	};
	
	// typical draw evemt for desktop 
	$canvas.onmousemove = function(e) {
		move(e);	
	};

	$size.addEventListener('change', function(e) {
		size = $size.options[$size.selectedIndex].value
		touchdown = false
	}, false)

	$color.addEventListener('change', function(e) {
		color = $color.options[$color.selectedIndex].value.toLowerCase()
		touchdown = false
	}, false)
	
	$clear.addEventListener('click', function(e) {
		clearScreen()
		touchdown = false
		socket.send({clear:true})
	}, false)

	window.onmouseup = function(e) {
		touchdown = false;
	};
		
	window.onmousedown = function(e) {
		touchdown = true;
	};
	
	function receive(msg) {

		if (msg.buffer) {
			msg.buffer.forEach(function(message) {
				receive(message)
			});
		}

		if (msg.clear) {
			clearScreen()
		}
		
		if (msg.circle) {
			drawCircle(msg.circle)
		}		
		
		if (msg.count) {
			$count.innerHTML = "Current Users: " + msg.count
		}
	};
	
	function clearScreen() {
		ctx.clearRect(0,0,width,height)
	}
	
	function move(e, iphone) {

		var cx, circle, x, y, i, iphone = iphone || false;

		if (!touchdown && !iphone) return

		if (touchdown) {
			x = e.clientX - $game.offsetLeft + window.scrollX
			y = e.clientY - $game.offsetTop + window.scrollY
		} else if (iphone) {
			for (i = 0; i < e.targetTouches.length; i++) {
				x = e.targetTouches[i].clientX
				y = e.targetTouches[i].clientY
			}
		}

		circle = {
			x: x,
			y: y,
			color: color,
			size: size	
		}
		
		drawCircle(circle)
		socket.send(circle);

	};
		
	function drawCircle(circle) {
		ctx.strokeStyle = circle.color
		ctx.lineWidth = circle.size;
		ctx.beginPath()
		if (last) {
	 		ctx.moveTo(last.x, last.y)
	 		ctx.lineTo(circle.x, circle.y)
	 		ctx.stroke()
			ctx.closePath()
		} else {	
			ctx.fillStyle = circle.color;
			ctx.beginPath();
			ctx.moveTo(circle.x, circle.y);
			ctx.arc(circle.x, circle.y, size, 0,  Math.PI*2, true);
			ctx.fill();
			ctx.closePath();	
		}

		last = circle
	};
			
})();
