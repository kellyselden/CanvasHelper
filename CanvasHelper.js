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
		if (obj.constructor == CanvasImageObject) {
			imageObjects.push(obj);
			if (obj.path) obj.loadImage();
		}
		oldRects[obj.id = idIncrement++] = obj.rect.clone();
		obj.helper = this;
	};
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
	};
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
			oldRects[obj.id] = newRect.clone();
			obj.repaint = false;
		}
		if (all) {
			var rects = Rect.subtractMultiple([new Rect(0, 0, canvas.width, canvas.height, terminalZindex)], paintedRects);
			me.ctx.fillStyle = backgroundColor;
			for (var i in rects) {
				var rect = rects[i];
				fillRect(rect);
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
			oldRects[obj.id] = newRect.clone();
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
			fillRect(rect);
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
	function fillRect(rect) {
		if (rect = roundRect(rect))
			me.ctx.fillRect(rect.getX1(), rect.getY1(), rect.getX2() - rect.getX1(), rect.getY2() - rect.getY1());
	}
	function roundRect(rect) {
		var x1 = Math.round(rect.getX1());
		var y1 = Math.round(rect.getY1());
		var x2 = Math.round(rect.getX2());
		var y2 = Math.round(rect.getY2());
		return x1 == x2 || y1 == y2 ? null : new Rect(x1, y1, x2, y2);
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