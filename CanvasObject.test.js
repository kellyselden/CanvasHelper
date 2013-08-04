test('CanvasBaseObject defaults', function() {
	var width = 100, height = 100;
	var box = new CanvasBaseObject({
		width: width,
		height: height,
		zindex: 1,
		draggable: true
	});
	strictEqual(box.rect.getX1(), 0);
	strictEqual(box.rect.getY1(), 0);
	strictEqual(box.rect.getX2(), width);
	strictEqual(box.rect.getY2(), height);
	strictEqual(box.rect.zindex, 1);
	strictEqual(box.draggable, true);
	deepEqual(box.links, []);
});
test('CanvasBaseObject invalid rectangle', function() {
	throws(function() { new CanvasBaseObject({ }) }, /rectangle/);
});
test('CanvasBaseObject.add', function() {
	var box = new CanvasBaseObject({
		width: 100,
		height: 100
	});
	var obj = new Object();
	box.add(obj);
	equal(box.links.length, 1);
	strictEqual(box.links[0], obj);
});

test('CanvasColorObject defaults', function() {
	var box = new CanvasColorObject({
		width: 100,
		height: 100,
		color: 'rgb(0, 0, 0)'
	});
	strictEqual(box.color, 'rgb(0, 0, 0)');
});
test('CanvasColorObject.paint', function() {
	var color = 'rgb(0, 0, 0)';
	var box = new CanvasColorObject({
		width: 100,
		height: 100,
		color: color
	});
	var fillRect = sinon.spy();
	box.helper = {
		ctx: {
			fillStyle: ''
		},
		fillRect: fillRect
	};
	var rect = new Rect(0, 0, 1, 1);
	box.paint(rect);
	strictEqual(box.helper.ctx.fillStyle, color);
	ok(fillRect.calledWith(rect));
});

test('CanvasImageObject defaults', function() {
	var path = 'test';
	var box = new CanvasImageObject({
		width: 100,
		height: 100,
		transparent: true,
		path: path
	});
	strictEqual(box.transparent, true);
	strictEqual(box.path, path);
});
test('CanvasImageObject.loadImage()', function() {
	var width = 2, height = 2;
	var image = {
		complete: false
	};
	var imageFactory = sinon.stub().returns(image);
	var path = 'test';
	var box = new CanvasImageObject({
		width: 100,
		height: 100,
		imageFactory: imageFactory,
		path: path
	});
	box.helper = {
		imageLoadingComplete: true
	};
	var setTimeout = sinon.stub(window, 'setTimeout', function(func, delay) {
		image.width = width;
		image.height = height;
		image.complete = true;
		func();
	});
	box.loadImage();
	strictEqual(image.src, path);
	strictEqual(box.helper.imageLoadingComplete, false);
	strictEqual(box.preloading, false);
	strictEqual(box.image, image);
	strictEqual(box.imageX, 0);
	strictEqual(box.imageY, 0);
	strictEqual(box.imageWidth, width);
	strictEqual(box.imageHeight, height);
	ok(imageFactory.called);
	ok(setTimeout.called);
	setTimeout.restore();
});
test('CanvasImageObject.loadImage(path)', function() {
	var width = 2, height = 2;
	var image = {
		complete: true,
		width: width,
		height: height
	};
	var imageFactory = sinon.stub().returns(image);
	var box = new CanvasImageObject({
		width: 100,
		height: 100,
		imageFactory: imageFactory
	});
	var setTimeout = sinon.spy(window, 'setTimeout');
	var path = 'test';
	box.loadImage(path);
	strictEqual(box.path, path);
	strictEqual(box.preloading, false);
	strictEqual(box.image, image);
	strictEqual(box.imageX, 0);
	strictEqual(box.imageY, 0);
	strictEqual(box.imageWidth, width);
	strictEqual(box.imageHeight, height);
	ok(!setTimeout.called);
});
test('CanvasImageObject.paint', function() {
	var width = 25, height = 25;
	var image = {
		complete: true,
		width: width,
		height: height
	};
	var box = new CanvasImageObject({
		x: 50,
		y: 50,
		width: 100,
		height: 100,
		path: 'test',
		imageFactory: sinon.stub().returns(image)
	});
	box.loadImage();
	var rect = new Rect(75, 75, 125, 125);
	var roundRect = sinon.stub().throws().withArgs(rect).returnsArg(0);
	var drawImage = sinon.spy();
	box.helper = {
		roundRect: roundRect,
		ctx: {
			drawImage: drawImage
		}
	};
	box.paint(rect);
	ok(roundRect.calledWith(rect));
	ok(drawImage.calledWith(
		image,
		6.25,
		6.25,
		12.5,
		12.5,
		75,
		75,
		50,
		50
	));
});