function CanvasHelper(canvas, backgroundColor) {
	var me = this;
	var objects = [];
	var colorObjects = [];
	var imageObjects = [];
	var oldRects = [];
	//this.turnOffEvents = false;
	var desiredFramerate = 60;
	var repaintMilliseconds = Math.round(1000 / desiredFramerate);
	var terminalZindex = -100;
	var imageLoadingComplete;
	var idIncrement = 0;
	this.ctx = canvas.getContext('2d');
	this.add = function(obj) {
		objects.push(obj);
		if (obj.constructor == CanvasColorObject)
			colorObjects.push(obj);
		if (obj.constructor == CanvasImageObject)
			imageObjects.push(obj);
		if (oldRects[obj.id = idIncrement++]) throw 'object already added';
		oldRects[obj.id] = Rect.clone(obj.rect);
		obj.helper = this;
	}
	this.resize = function(width, height, scale) {
		if (scale) {
			var scaleX = width / canvas.width;
			var scaleY = height / canvas.height;
			for (var i in objects) {
				var rect = objects[i].rect;
				rect.setX1(rect.getX1() * scaleX);
				rect.setY1(rect.getY1() * scaleY);
				rect.setX2(rect.getX2() * scaleX);
				rect.setY2(rect.getY2() * scaleY);
			}
		}
		canvas.width = width;
		canvas.height = height;
		paint(true);
	}
	function sortObjectsByZindex() {
		objects.sort(function(a, b) {
			if (a.rect.zindex < b.rect.zindex)
				return 1;
			if (a.rect.zindex > b.rect.zindex)
				return -1;
			return 0;
		});
	}
	function paint(all) {
		if (!imageLoadingComplete) {
			for (var i in imageObjects)
				if (imageObjects[i].preloading)
					return setTimeout(function() { paint(all) }, 0);
			imageLoadingComplete = true;
		}
		var paintedRects = [];
		sortObjectsByZindex();
		for (var i in objects) {
			var obj = objects[i];
			if (obj.transparent) continue;
			var oldRect = oldRects[obj.id];
			var newRect = obj.rect;
			if (all || obj.repaint) {
				var rects = Rect.subtractMultiple([newRect], paintedRects);
				for (var j in rects) {
					var rect = rects[j];
					obj.paint(rect);
					paintedRects.push(rect);
				}
			} else if (!Rect.areEqual(oldRect, newRect)) {
				//don't repaint part of boxes that don't change
				if (obj.constructor == CanvasColorObject) {
					var rect = Rect.getIntersect(oldRect, newRect);
					//box moved so fast it has no intersect
					if (rect) paintedRects.push(rect);
				}
				var rects = Rect.subtractMultiple([newRect], paintedRects);
				for (var j in rects) {
					var rect = rects[j];
					obj.paint(rect);
					paintedRects.push(rect);
				}
				rects = Rect.subtractMultiple([oldRect], paintedRects);
				for (var j in rects) {
					var rect = rects[j];
					paintRect(rect);
					paintedRects.push(rect);
				}
			} else paintedRects.push(newRect);
			oldRects[obj.id] = Rect.clone(newRect);
			obj.repaint = false;
		}
		if (all) {
			var rects = Rect.subtractMultiple([new Rect(0, 0, canvas.width, canvas.height, terminalZindex)], paintedRects);
			me.ctx.fillStyle = backgroundColor;
			for (var i in rects) {
				var rect = rects[i];
				me.fillRect(rect);
				paintedRects.push(rect);
			}
		}
		for (var i in objects) {
			var obj = objects[objects.length - 1 - i];
			if (!obj.transparent) continue;
			var oldRect = oldRects[obj.id];
			var newRect = obj.rect;
			// var rects = Rect.subtractMultiple([newRect], paintedRects);
			// for (var j in rects) {
				// var rect = rects[j];
				// obj.paint(rect);
				// paintedRects.push(rect);
			// }
			paintRect(newRect);
			//obj.paint(newRect);
			paintedRects.push(newRect);
			if (!Rect.areEqual(oldRect, newRect)) {
				//oldRect.zindex = terminalZindex;
				var rects = Rect.subtractMultiple([oldRect], paintedRects);
				for (var j in rects) {
					var rect = rects[j];
					paintRect(rect);
					paintedRects.push(rect);
				}
			}
			oldRects[obj.id] = Rect.clone(newRect);
			obj.repaint = false;
		}
	}
	function paintRect(rect) {
		var paintedRects = [];
		for (var i in objects) {
			var obj = objects[i];
			if (obj.transparent) continue;
			var intersect = Rect.getIntersect(rect, obj.rect);
			if (intersect) {
				var rects = Rect.subtractMultiple([intersect], paintedRects);
				for (var j in rects) {
					var newRect = rects[j];
					obj.paint(newRect);
					paintedRects.push(newRect);
				}
			}
		}
		var rects = Rect.subtractMultiple([new Rect(rect.getX1(), rect.getY1(), rect.getX2(), rect.getY2(), terminalZindex)], paintedRects);
		me.ctx.fillStyle = backgroundColor;
		for (var i in rects) {
			var rect = rects[i];
			me.fillRect(rect);
			paintedRects.push(rect);
		}
		for (var i in objects) {
			var obj = objects[objects.length - 1 - i];
			if (!obj.transparent) continue;
			var intersect = Rect.getIntersect(rect, obj.rect);
			if (intersect) {
				obj.paint(intersect);
				paintedRects.push(intersect);
			}
		}
	}
	this.fillRect = function(rect) {
		rect = this.roundRect(rect);
		this.ctx.fillRect(rect.getX1(), rect.getY1(), rect.getX2() - rect.getX1(), rect.getY2() - rect.getY1());
	}
	this.roundRect = function(rect) {
		return new Rect(
			Math.round(rect.getX1()),
			Math.round(rect.getY1()),
			Math.round(rect.getX2()),
			Math.round(rect.getY2()));
	}
	
	function getMousePos(e) {
		return {
			x: e.pageX - canvas.offsetLeft,
			y: e.pageY - canvas.offsetTop
		}
	}
	function getMouseX(e) { return getMousePos(e).x }
	function getMouseY(e) { return getMousePos(e).y }
	
	function hitTest(e, obj) {
		var pos = getMousePos(e);
		return pos.x >= obj.rect.getX1()
			&& pos.x <= obj.rect.getX2()
			&& pos.y >= obj.rect.getY1()
			&& pos.y <= obj.rect.getY2();
	}
	
	var mouseX, mouseY;
	function updateMouseCoords(e) {
		mouseX = getMouseX(e);
		mouseY = getMouseY(e);
	}
	
	var clicked, dragging, isDragging, draggingList;
	canvas.addEventListener('mousedown', function(e) {
		if (me.turnOffEvents) return;
		sortObjectsByZindex();
		for (var i in objects) {
			var obj = objects[i];
			if (hitTest(e, obj)) {
				if (obj.onmousedown)
					obj.onmousedown();
				clicked = obj;
				updateMouseCoords(e);
				break;
			}
		}
	});

	canvas.addEventListener('mousemove', function(e) {
		if (clicked && clicked.draggable) {
			dragging = clicked;
			isDragging = true;
			draggingList = dragging.links.slice(0);
			draggingList.push(dragging);
			dragTimer();
		}
		if (isDragging) {
			var changeX = getMouseX(e) - mouseX;
			var changeY = getMouseY(e) - mouseY;
			updateMouseCoords(e);
			for (var i in draggingList) {
				var rect = draggingList[i].rect;
				rect.setX1(rect.getX1() + changeX);
				rect.setY1(rect.getY1() + changeY);
				rect.setX2(rect.getX2() + changeX);
				rect.setY2(rect.getY2() + changeY);
			}
			if (dragging.ondrag)
				dragging.ondrag(changeX, changeY);
		}
		clicked = null;
	});
	function dragTimer() {
		var startTime;
		if (isDragging)
			startTime = new Date().getTime();
		var oldRect = oldRects[dragging.id];
		var newRect = dragging.rect;
		if (!Rect.areEqual(oldRect, newRect))
			paint();
		if (isDragging) {
			var endTime = new Date().getTime();
			setTimeout(dragTimer, Math.max(0, repaintMilliseconds - (endTime - startTime)));
		}
		else dragging = null;
	}

	function mouseup(e) {
		if (dragging && dragging.ondragend)
			dragging.ondragend();
		isDragging = false;
		if (clicked && clicked.onclick)
			clicked.onclick();
		clicked = null;
	}
	canvas.addEventListener('mouseout', mouseup);
	canvas.addEventListener('mouseup', mouseup);
	
	canvas.addEventListener('dblclick', function(e) {
		if (me.turnOffEvents) return;
		sortObjectsByZindex();
		for (var i in objects) {
			var obj = objects[i];
			if (obj.ondblclick && hitTest(e, obj)) {
				obj.ondblclick();
				break;
			}
		}
	});
}

var CanvasBaseObject = Class.extend({
	init: function(stuff) {
		var x = stuff.x || 0;
		var y = stuff.y || 0;
		this.rect = new Rect(
			x,
			y,
			x + stuff.width || 0,
			y + stuff.height || 0,
			stuff.zindex || 0);
		this.draggable = stuff.draggable || false;
		
		this.links = [];
	},
	add: function(obj) {
		this.links.push(obj);
	}
});
var CanvasColorObject = CanvasBaseObject.extend({
	init: function(stuff) {
		this._super(stuff);
		this.color = stuff.color;
	},
	paint: function(rect) {
		helper.ctx.fillStyle = this.color;
		helper.fillRect(rect);
	}
});
var CanvasImageObject = CanvasBaseObject.extend({
	init: function(stuff) {
		this._super(stuff);
		this.transparent = stuff.transparent;
		if (stuff.path)
			this.loadImage(stuff.path);
	},
	loadImage: function(path) {
		var image = new Image();
		image.src = path;
		this.setImage(image);
	},
	setImage: function(image) {
		if (!image.complete) {
			helper.imageLoadingComplete = false;
			this.preloading = true;
			var me = this;
			return setTimeout(function() { me.setImage(image) }, 0); 
		}
		this.preloading = false;
		this.image = image;
		this.setImageDimensions(0, 0, image.width, image.height);
	},
	setImageDimensions: function(imageX, imageY, imageWidth, imageHeight) {
		this.imageX = imageX;
		this.imageY = imageY;
		this.imageWidth = imageWidth;
		this.imageHeight = imageHeight;
	},
	paint: function(rect) {
		var scaleX1 = this.image.width / this.imageWidth;
		var scaleY1 = this.image.height / this.imageHeight;
		var scaleX2 = this.imageWidth / (this.rect.getX2() - this.rect.getX1());
		var scaleY2 = this.imageHeight / (this.rect.getY2() - this.rect.getY1());
		// var x = this.imageX + Math.round(rect.getX1() - this.rect.getX1()) * scaleX;
		// var y = this.imageY + Math.round(rect.getY1() - this.rect.getY1()) * scaleY;
		// var width = Math.min(Math.round(rect.getX2() - rect.getX1()) * scaleX, this.imageWidth - x);
		// var height = Math.min(Math.round(rect.getY2() - rect.getY1()) * scaleY, this.imageHeight - y);
		var x = this.imageX + (rect.getX1() - this.rect.getX1()) * scaleX2;
		var y = this.imageY + (rect.getY1() - this.rect.getY1()) * scaleY2;
		var width = (rect.getX2() - rect.getX1()) * scaleX2;
		var height = (rect.getY2() - rect.getY1()) * scaleY2;
		console.log('x:\t' + x + ', y:\t' + y + ', w:\t' + width + ', h:\t' + height);
		rect = helper.roundRect(rect);
		// var x = this.imageX + (rect.getX1() - Math.round(this.rect.getX1())) * scaleX;
		// var y = this.imageY + (rect.getY1() - Math.round(this.rect.getY1())) * scaleY;
		// var width = Math.min((rect.getX2() - rect.getX1()) * scaleX, this.imageWidth - x);
		// var height = Math.min((rect.getY2() - rect.getY1()) * scaleY, this.imageHeight - y);
		// if (!width || !height)
			// return; //scaling can make fractional paint boxes
		helper.ctx.drawImage(this.image,
			x,
			y,
			width,
			height,
			rect.getX1(),
			rect.getY1(),
			rect.getX2() - rect.getX1(),
			rect.getY2() - rect.getY1());
	}
});