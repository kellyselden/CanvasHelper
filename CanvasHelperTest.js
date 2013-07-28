var canvas = document.getElementById('canvas');
var helper = new CanvasHelper(canvas, 'rgb(50, 50, 50)');
helper.add(new CanvasColorObject({
	x: 0,
	y: 0,
	width: 50,
	height: 50,
	zindex: 1,
	draggable: true,
	color: 'rgb(100, 0, 0)'
}));
var box2 = new CanvasColorObject({
	x: 50,
	y: 0,
	width: 50,
	height: 50,
	zindex: 2,
	draggable: true,
	color: 'rgb(0, 100, 0)'
});
var box4 = new CanvasColorObject({
	x: 100,
	y: 0,
	width: 50,
	height: 50,
	zindex: 3,
	draggable: true,
	color: 'rgb(100, 100, 0)'
});
helper.add(box2);
helper.add(box4);
box2.add(box4);
helper.add(new CanvasColorObject({
	x: 50,
	y: 50,
	width: 50,
	height: 50,
	color: 'rgb(0, 0, 100)'
}));
helper.add(new CanvasImageObject({
	x: 100,
	y: 50,
	width: 50,
	height: 50,
	zindex: 4,
	draggable: true,
	path: 'Capture.PNG'
}));
helper.add(new CanvasImageObject({
	x: 0,
	y: 50,
	width: 50,
	height: 50,
	zindex: 5,
	draggable: true,
	transparent: true,
	path: 'Untitled.png'
}));
function scale() {
	helper.resize(window.innerWidth, window.innerHeight, true);
}
scale();
window.onresize = scale;