//var canvas = document.getElementById('canvas');
//var helper = new CanvasHelper(canvas, 'rgb(50, 50, 50)');

function getCanvas(ctx) {
	return {
		getContext: sinon.stub().throws().withArgs('2d').returns(ctx || {
			fillRect: sinon.spy()
		}),
		addEventListener: sinon.stub().throws()
			.withArgs('mousedown')
			.withArgs('mousemove')
			.withArgs('mouseout')
			.withArgs('mouseup')
			.withArgs('dblclick')
	};
}
test('CanvasHelper', function() {
	var ctx = new Object();
	var canvas = getCanvas(ctx);
	var getContext = canvas.getContext;
	var addEventListener = canvas.addEventListener;
	
	var canvasHelper = new CanvasHelper(canvas);
	
	ok(getContext.calledWith('2d'));
	strictEqual(canvasHelper.ctx, ctx);
	ok(addEventListener.calledWith('mousedown'));
	ok(addEventListener.calledWith('mousemove'));
	ok(addEventListener.calledWith('mouseout'));
	ok(addEventListener.calledWith('mouseup'));
	ok(addEventListener.calledWith('dblclick'));
	strictEqual(
		addEventListener.withArgs('mouseout').args[1],
		addEventListener.withArgs('mouseup').args[1]);
});

function getObj() {
	return {
		rect: {
			clone: sinon.spy()
		}
	};
}
test('CanvasHelper.add', function() {
	var canvasHelper = new CanvasHelper(getCanvas());
	var obj = getObj();
	
	canvasHelper.add(obj);
	
	equal(obj.id, 0);
	strictEqual(obj.helper, canvasHelper);
	ok(obj.rect.clone.called);
});
test('CanvasHelper.add id', function() {
	var canvasHelper = new CanvasHelper(getCanvas());
	var obj = getObj();
	
	canvasHelper.add(obj);
	canvasHelper.add(obj);
	
	equal(obj.id, 1);
});
test('CanvasHelper.add CanvasColorObject', function() {
	var canvasHelper = new CanvasHelper(getCanvas());
	var obj = getObj();
	obj.constructor = CanvasColorObject;
	
	canvasHelper.add(obj);
	
	expect(0);
});
test('CanvasHelper.add CanvasImageObject', function() {
	var canvasHelper = new CanvasHelper(getCanvas());
	var obj = getObj();
	obj.constructor = CanvasImageObject;
	
	canvasHelper.add(obj);
	
	expect(0);
});
test('CanvasHelper.add CanvasImageObject loadImage', function() {
	var canvasHelper = new CanvasHelper(getCanvas());
	var obj = getObj();
	obj.constructor = CanvasImageObject;
	obj.path = true;
	obj.loadImage = sinon.spy();
	
	canvasHelper.add(obj);
	
	ok(obj.loadImage.called);
});

test('CanvasHelper.resize', function() {
	var canvas = getCanvas();
	var canvasHelper = new CanvasHelper(canvas);
	var width = 1;
	var height = 2;
	
	canvasHelper.resize(width, height, false);
	
	equal(canvas.width, width);
	equal(canvas.height, height);
});
test('CanvasHelper.resize scale', function() {
	var canvas = getCanvas();
	var canvasHelper = new CanvasHelper(canvas);
	canvas.width = 4;
	canvas.height = 5;
	var rect = new Rect(1, 2, 3, 4);
	var obj = {
		rect: rect,
		paint: function() { }
	};
	
	canvasHelper.add(obj);
	canvasHelper.resize(1, 2, true);
	
	equal(rect.getX1(), .25);
	equal(rect.getY1(), .8);
	equal(rect.getX2(), .75);
	equal(rect.getY2(), 1.6);
});