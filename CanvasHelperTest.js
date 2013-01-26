var canvas = document.getElementById('canvas');
var helper = new CanvasHelper(canvas, 'rgb(50, 50, 50)');
var box1 = new CanvasColorObject({
	x: 0,
	y: 0,
	width: 50,
	height: 50,
	zindex: 1,
	draggable: true,
	color: 'rgb(100, 0, 0)'
});
var box2 = new CanvasColorObject({
	x: 50,
	y: 0,
	width: 50,
	height: 50,
	zindex: 2,
	draggable: true,
	color: 'rgb(0, 100, 0)'
});
var box3 = new CanvasColorObject({
	x: 50,
	y: 50,
	width: 50,
	height: 50,
	color: 'rgb(0, 0, 100)'
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
var imageBox1 = new CanvasImageObject({
	x: 100,
	y: 50,
	width: 50,
	height: 50,
	zindex: 4,
	draggable: true,
	path: 'Capture.PNG'
});
var imageBox2 = new CanvasImageObject({
	x: 0,
	y: 50,
	width: 50,
	height: 50,
	zindex: 5,
	draggable: true,
	transparent: true,
	path: 'Untitled.png'
});
helper.add(box1);
helper.add(box2);
helper.add(box3);
helper.add(box4);
box2.add(box4);
helper.add(imageBox1);
helper.add(imageBox2);
function scale() {
	helper.resize(window.innerWidth, window.innerHeight, true);
}
scale();
window.onresize = scale;