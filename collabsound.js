(function() {

	var ctx, touchdown, send, Pen, pen, socket, move, audio, date, playSound, body, canvas, HOST = "localhost", PORT = 8080;

	// create the socket.io object
	socket = new io.Socket(null, {port: 8080});
	socket.connect();
	socket.on('message', function(msg) {
		var receive = function(msg) {
			if ('coords' in msg) {
				pen.draw(msg.coords, true);
				playSound(msg.coords);
			}
		};
		if ('buffer' in msg) {
			for (var i=0;i<msg.buffer.length;i++) {				
				receive(msg.buffer[i]);
			}
		} else {
			receive(msg);
		}
	});
	
	
	// a really basic object that handles drawing
	var Pen = function (ctx) {
		this.ctx = ctx;
	} 
	
	Pen.prototype = {
	
		// generic drawing function
		draw: function() {
			this.drawFadingRainbow.apply(this, arguments);
		},
		// draws a circle
		drawCircle: function(coords, color) {
			color = color || "red";
			this.ctx.fillStyle = color;
			this.ctx.beginPath();
			this.ctx.moveTo(coords.x,coords.y);
			this.ctx.arc(coords.x, coords.y, 5, 0,  Math.PI*2, true);
			this.ctx.fill();
			this.ctx.closePath();
		},
		// draws a fading circle
		drawFadingRainbow: function(coords, reverse, alpha) {
			alpha = alpha || 1;
			reverse = reverse || false;
			var r = Math.floor(coords.x / this.ctx.canvas.width * 255),
				g = 50,
				b = Math.floor(coords.y / this.ctx.canvas.height * 255);
			if (reverse) {
				r = 255 - r;
				b = 255 - b;			
			}
			this.ctx.clearRect(coords.x - 10, coords.y - 10, 20, 20);
			this.ctx.save();
			this.ctx.globalAlpha = alpha;
			this.ctx.fillStyle = "rgb("+r+","+g+","+b+")";
			this.ctx.beginPath();
			this.ctx.moveTo(coords.x,coords.y);
			this.ctx.arc(coords.x, coords.y, 10, 0,  Math.PI*2, true);
			this.ctx.fill();
			this.ctx.closePath();
			this.ctx.restore();
			if (alpha > .1) {
				var myPen = this;
				setTimeout(function() {
					myPen.drawFadingRainbow(coords, reverse, alpha - .05);		
				}, 150);
			}
		},
	
		// draws a dot (with pretty colors)
		drawRainbow: function(coords, reverse) {
			reverse = reverse || false;
			var r = Math.floor(coords.x / this.ctx.canvas.width * 255),
				g = 50,
				b = Math.floor(coords.y / this.ctx.canvas.height * 255);
			if (reverse) {
				r = 255 - r;
				b = 255 - b;			
			}
			this.ctx.beginPath();
			this.ctx.moveTo(coords.x,coords.y);
			this.ctx.arc(coords.x, coords.y, 5, 0,  Math.PI*2, true);
			this.ctx.fill();
			this.ctx.closePath();
		}
	}

	// moves the current x and y around based on user input
	move = function(e) {
		var coords = {
			x:e.clientX - e.target.offsetLeft + window.scrollX,
			y:e.clientY - e.target.offsetTop + window.scrollY
		};
		pen.draw(coords);
		playSound(coords);
		socket.send(coords);
	};
	
	// pretty self explanator
	playSound = function(coords) {
		audio.src = "http://"+HOST+":"+PORT+"/sound?x="+coords.x+"&y="+coords.y;
		audio.play();
	}

	window.onload = function() {

		// instantiating some variables
		audio = new Audio();
		body = document.querySelector("body");
		canvas = document.querySelector('canvas');
		ctx = canvas.getContext('2d');
		pen = new Pen(ctx);
		
		// hide the toolbar in iOS
		setTimeout(function() { window.scrollTo(0, 1); }, 100);

		// prevents dragging the page in iOS	
		body.ontouchmove = function(e) {
			e.preventDefault();
		};
		
		// typical draw evemt for desktop 
		canvas.onclick = function(e) {
			move(e);	
		};
	
	};
	
})();
