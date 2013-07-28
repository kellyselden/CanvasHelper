//var canvas = document.getElementById('canvas');
//var helper = new CanvasHelper(canvas, 'rgb(50, 50, 50)');

test('CanvasBaseObject defaults', function() {
	var box = new CanvasBaseObject({
		width: 50,
		height: 50
	});
	strictEqual(box.rect.getX1(), 0);
	strictEqual(box.rect.getY1(), 0);
	strictEqual(box.rect.getX2(), 50);
	strictEqual(box.rect.getY2(), 50);
	strictEqual(box.rect.zindex, 0);
	strictEqual(box.draggable, false);
	deepEqual(box.links, []);
});
test('CanvasBaseObject invalid rectangle', function() {
	throws(function() { new CanvasBaseObject({ }) }, /rectangle/);
});