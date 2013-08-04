//var canvas = document.getElementById('canvas');
//var helper = new CanvasHelper(canvas, 'rgb(50, 50, 50)');

test('CanvasHelper', function() {
	var ctx = new Object();
	var getContext = sinon.stub().throws().withArgs('2d').returns(ctx);
	var addEventListener = sinon.stub().throws()
		.withArgs('mousedown')
		.withArgs('mousemove')
		.withArgs('mouseout')
		.withArgs('mouseup')
		.withArgs('dblclick');
	var canvas = {
		getContext: getContext,
		addEventListener: addEventListener
	};
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