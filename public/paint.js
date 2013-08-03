(function() {

	var last = [];
    var ctx, touchdown, socket, i, color, size, width, height;

	socket = new io.connect();
    socket.on('paint', paint);
    socket.on('message', message);
    socket.on('reset', reset);
    socket.on('clear', clearScreen);

	// locals
	var body = document.body
		, $canvas = document.getElementById('canvas')
		, $size = document.getElementById('size')
		, $color = document.getElementById('color')
		, $clear = document.getElementById('clear')
		, $game = document.getElementById('game')
		, $count = document.getElementById('count');
	
	// globals
	ctx = $canvas.getContext('2d');
	width = $canvas.getAttribute('width');
	height = $canvas.getAttribute('height');

	// get the starting size
	size = $size.options[$size.selectedIndex].value;
	color = $color.options[$color.selectedIndex].value.toLowerCase();
	
	// typical draw event for desktop
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
		socket.emit('clear');
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
	setTimeout(function() {
        window.scrollTo(0, 1);
    }, 100);

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
	
	function paint(msg) {
        drawCircle(msg.circle, msg.sessionId);
    }

    function message(msg) {

		if (msg.buffer) {
			msg.buffer.forEach(paint);
		}

		if (msg.count) {
			$count.innerHTML = 'Current Users: ' + msg.count
		}
	};
	
    function reset(msg) {
        delete last[msg.sessionId];
    }

	function clearScreen() {
		ctx.clearRect(0,0,width,height)
	}
	
	function clearLast() {
		delete last['me']
		socket.emit('reset');
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
		socket.emit('paint', circle);

	};
		
	function drawCircle(circle, sessionId) {

        sessionId = sessionId || 'me';

		ctx.strokeStyle = circle.color
		ctx.fillStyle = circle.color;
		ctx.lineWidth = circle.size;
 		ctx.lineCap = 'round';

		ctx.beginPath()
		if (last[sessionId]) {
	 		ctx.moveTo(last[sessionId].x, last[sessionId].y)
	 		ctx.lineTo(circle.x, circle.y)
	 		ctx.stroke()
		} else {	
			ctx.moveTo(circle.x, circle.y);
			ctx.arc(circle.x, circle.y, circle.size / 2, 0,  Math.PI*2, true);
			ctx.fill();
		}
		ctx.closePath();

		last[sessionId] = circle;

	};
			
})();
