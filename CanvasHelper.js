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
		oldRects[obj.id] = cloneRect(obj.rect);
		obj.helper = this;
	}
	this.resize = function(width, height, scale) {
		if (scale) {
			var scaleX = width / canvas.width;
			var scaleY = height / canvas.height;
			for (var i in objects) {
				var obj = objects[i];
				obj.rect.x1 *= scaleX;
				obj.rect.y1 *= scaleY;
				obj.rect.x2 *= scaleX;
				obj.rect.y2 *= scaleY;
			}
		}
		canvas.width = width;
		canvas.height = height;
		this.paint(true);
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
	this.paint = function(all) {
		if (!imageLoadingComplete) {
			for (var i in imageObjects) {
				var obj = imageObjects[i];
				if (!obj.image.complete)
					return setTimeout(function() { me.paint(all) }, 0);
			}
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
				var rects = subtractRects([newRect], paintedRects);
				for (var j in rects) {
					var rect = rects[j];
					obj.paint(rect);
					paintedRects.push(rect);
				}
			} else if (!areRectsEqual(oldRect, newRect)) {
				//don't repaint part of boxes that don't change
				if (obj.constructor == CanvasColorObject) {
					var rect = this.getIntersect(oldRect, newRect);
					//box moved so fast it has no intersect
					if (rect) paintedRects.push(rect);
				}
				var rects = subtractRects([newRect], paintedRects);
				for (var j in rects) {
					var rect = rects[j];
					obj.paint(rect);
					paintedRects.push(rect);
				}
				rects = subtractRects([oldRect], paintedRects);
				for (var j in rects)
					paintRect(rects[j]);
			} else paintedRects.push(newRect);
			oldRects[obj.id] = cloneRect(newRect);
			obj.repaint = false;
		}
		if (all) {
			var rects = subtractRects([new Rect(0, 0, canvas.width, canvas.height, terminalZindex)], paintedRects);
			this.ctx.fillStyle = backgroundColor;
			for (var i in rects)
				this.fillRect(rects[i]);
		}
		for (var i in objects) {
			var obj = objects[objects.length - 1 - i];
			if (!obj.transparent) continue;
			var oldRect = oldRects[obj.id];
			var newRect = obj.rect;
			var rects = subtractRects([newRect], paintedRects);
			for (var j in rects) {
				var rect = rects[j];
				obj.paint(rect);
				paintedRects.push(rect);
			}
			if (!areRectsEqual(oldRect, newRect)) {
				oldRect.zindex = terminalZindex;
				rects = subtractRects([oldRect], paintedRects);
				for (var j in rects)
					paintRect(rects[j]);
			}
			oldRects[obj.id] = cloneRect(newRect);
			obj.repaint = false;
		}
	}
	function paintRect(rect) {
		var paintedRects = [];
		for (var i in objects) {
			var obj = objects[i];
			if (obj.transparent) continue;
			var intersect = me.getIntersect(rect, obj.rect);
			if (intersect) {
				var rects = subtractRects([intersect], paintedRects);
				for (var j in rects) {
					var newRect = rects[j];
					obj.paint(newRect);
					paintedRects.push(newRect);
				}
			}
		}
		var rects = subtractRects([new Rect(rect.x1, rect.y1, rect.x2, rect.y2, terminalZindex)], paintedRects);
		me.ctx.fillStyle = backgroundColor;
		for (var i in rects) {
			var rect = rects[i];
			me.fillRect(rect);
			paintedRects.push(rect);
		}
		for (var i in objects) {
			var obj = objects[objects.length - 1 - i];
			if (!obj.transparent) continue;
			var intersect = me.getIntersect(rect, obj.rect);
			if (intersect) {
				var rects = subtractRects([intersect], paintedRects);
				for (var j in rects)
					obj.paint(rects[j]);
			}
		}
	}
	function areRectsEqual(r1, r2) {
		return r1.x1 == r2.x1
			&& r1.y1 == r2.y1
			&& r1.x2 == r2.x2
			&& r1.y2 == r2.y2;
	}
	this.fillRect = function(rect) {
		this.ctx.fillRect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
	}
	this.getIntersect = function(r1, r2) {
		return r1.x1 < r2.x2 && r1.x2 > r2.x1
			&& r1.y1 < r2.y2 && r1.y2 > r2.y1
			? new Rect(
				Math.max(r1.x1, r2.x1),
				Math.max(r1.y1, r2.y1),
				Math.min(r1.x2, r2.x2),
				Math.min(r1.y2, r2.y2),
				Math.max(r1.zindex, r2.zindex))
			: null;
	}
	function subtractRects(r1s, r2s) {
		if (r2s.length)
			for (var i in r1s) {
				var r1 = r1s[i];
				for (var j in r2s) {
					var r2 = r2s[j];
					
					if (!me.getIntersect(r1, r2)) continue;
					if (r1.zindex > r2.zindex) continue;
					
					var rects = [];
					var cutR1 = cloneRect(r1);
					if (r1.x1 < r2.x1) {
						var left = cloneRect(r1);
						left.x2 = cutR1.x1 = r2.x1;
						rects.push(left);
					}
					if (r1.x2 > r2.x2) {
						var right = cloneRect(r1);
						right.x1 = cutR1.x2 = r2.x2;
						rects.push(right);
					}
					if (r1.y1 < r2.y1) {
						var top = cloneRect(cutR1);
						top.y2 = r2.y1;
						rects.push(top);
					}
					if (r1.y2 > r2.y2) {
						var bottom = cloneRect(cutR1);
						bottom.y1 = r2.y2;
						rects.push(bottom);
					}
					r1s = r1s.slice(0);
					r1s.splice(parseInt(i), 1);
					for (var k in rects)
						r1s.push(rects[k]);
					return subtractRects(r1s, r2s);
				}
			}
		return r1s;
	}
	function cloneRect(rect) {
		return new Rect(rect.x1, rect.y1, rect.x2, rect.y2, rect.zindex);
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
		return pos.x >= obj.rect.x1
			&& pos.x <= obj.rect.x2
			&& pos.y >= obj.rect.y1
			&& pos.y <= obj.rect.y2;
	}
	
	var mouseX, mouseY;
	function updateMouseCoords(e) {
		mouseX = getMouseX(e);
		mouseY = getMouseY(e);
	}
	
	var clicked, dragging, isDragging;
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
			dragTimer();
		}
		if (isDragging) {
			var changeX = getMouseX(e) - mouseX;
			var changeY = getMouseY(e) - mouseY;
			updateMouseCoords(e);
			dragging.rect.x1 += changeX;
			dragging.rect.y1 += changeY;
			dragging.rect.x2 += changeX;
			dragging.rect.y2 += changeY;
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
		if (!areRectsEqual(oldRect, newRect))
			me.paint();
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

function Rect(x1, y1, x2, y2, zindex) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.zindex = zindex;
}

var CanvasBaseObject = Class.extend({
	init: function(x, y, width, height, zindex, draggable) {
		this.rect = new Rect(x, y, x + width, y + height, zindex);
		this.draggable = draggable;
	}
});
var CanvasColorObject = CanvasBaseObject.extend({
	init: function(x, y, width, height, zindex, draggable, color) {
		this._super(x, y, width, height, zindex, draggable);
		this.color = color;
	},
	paint: function(rect) {
		helper.ctx.fillStyle = this.color;
		helper.fillRect(rect);
	}
});
var CanvasImageObject = CanvasBaseObject.extend({
	init: function(x, y, width, height, zindex, draggable, transparent) {
		this._super(x, y, width, height, zindex, draggable);
		this.transparent = transparent;
	},
	loadImage: function(path) {
		var image = new Image();
		image.src = path;
		this.setImage(image);
	},
	setImage: function(image) {
		this.image = image;
		helper.imageLoadingComplete = false;
		if (image.complete)
			this.setImageDimensions(0, 0, image.width, image.height);
	},
	setImageDimensions: function(imageX, imageY, imageWidth, imageHeight) {
		this.imageX = imageX;
		this.imageY = imageY;
		this.imageWidth = imageWidth;
		this.imageHeight = imageHeight;
	},
	paint: function(rect) {
		helper.ctx.drawImage(this.image,
			this.imageX,
			this.imageY,
			this.imageWidth,
			this.imageHeight,
			rect.x1,
			rect.y1,
			rect.x2 - rect.x1,
			rect.y2 - rect.y1);
	}
});