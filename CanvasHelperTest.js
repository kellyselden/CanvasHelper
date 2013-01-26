var canvas = document.getElementById('canvas');
var helper = new CanvasHelper(canvas, 'rgb(50, 50, 50)');
var box1 = new CanvasColorObject(0, 0, 50, 50, 1, true, 'rgb(100, 0, 0)');
var box2 = new CanvasColorObject(50, 0, 50, 50, 2, true, 'rgb(0, 100, 0)');
var box3 = new CanvasColorObject(50, 50, 50, 50, 0, false, 'rgb(0, 0, 100)');
var box4 = new CanvasColorObject(100, 0, 50, 50, 3, true, 'rgb(100, 100, 0)');
var imageBox = new CanvasImageObject(100, 50, 50, 50, 4, true);
helper.add(box1);
helper.add(box2);
helper.add(box3);
helper.add(box4);
box2.add(box4);
helper.add(imageBox);
imageBox.loadImage('Capture.PNG');
function scale() {
	helper.resize(window.innerWidth, window.innerHeight, true);
}
scale();
window.onresize = scale;