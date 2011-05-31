(function() {

	var ctx, touchdown, socket, i, last = [], color, size, width, height;

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
		socket.send({clear:true});
		touchdown = false
		clearLast()
	}, false)

	window.onmouseup = function(e) {
		touchdown = false
		clearLast()
	};
		
	window.onmousedown = function(e) {
		touchdown = true;
	};
	
	// iOS

	// hide the toolbar in iOS
	setTimeout(function() { window.scrollTo(0, 1); }, 100);

	// prevents dragging the page in iOS	
	body.ontouchmove = function(e) {
		e.preventDefault();
	};
	
	$canvas.ontouchstart = function(e) {
		touchdown = false
		clearLast()
	}

	// iOS alternative to mouse move
	$canvas.ontouchmove = function(e) {
		move(e);
	};
	
	function receive(msg) {

		if (msg.buffer) {
			msg.buffer.forEach(receive);
		}
		
		if (msg.reset) {
			delete last[msg.session_id]
		}

		if (msg.clear) {
			clearScreen()
		}
		
		if (msg.circle) {
			drawCircle(msg.circle, msg.session_id)
		}		
		
		if (msg.count) {
			$count.innerHTML = "Current Users: " + msg.count
		}
	};
	
	function clearScreen() {
		ctx.clearRect(0,0,width,height)
	}
	
	function clearLast() {
		delete last["me"]
		socket.send({reset:true});
	}

	function move(e) {

		var x, y

		if (!touchdown && !e.targetTouches) return

		if (touchdown) {
			x = e.clientX + window.scrollX
			y = e.clientY + window.scrollY
		} else {
			x = e.targetTouches[0].clientX
			y = e.targetTouches[0].clientY
		}

		x -= $game.offsetLeft
		y -= $game.offsetTop

		circle = {
			x: x,
			y: y,
			color: color,
			size: size	
		}
		
		drawCircle(circle)
		socket.send(circle);

	};
		
	function drawCircle(circle, session_id) {

		session_id = session_id || "me"

		ctx.strokeStyle = circle.color
		ctx.fillStyle = circle.color;
		ctx.lineWidth = circle.size;
 		ctx.lineCap = "round"

		ctx.beginPath()
		if (last[session_id]) {
	 		ctx.moveTo(last[session_id].x, last[session_id].y)
	 		ctx.lineTo(circle.x, circle.y)
	 		ctx.stroke()
		} else {	
			ctx.moveTo(circle.x, circle.y);
			ctx.arc(circle.x, circle.y, circle.size / 2, 0,  Math.PI*2, true);
			ctx.fill();
		}
		ctx.closePath()

		last[session_id] = circle		

	};
			
})();
