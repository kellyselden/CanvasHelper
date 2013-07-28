test('new Rect x1 == x2', function() {
	throws(function() { new Rect(0, 0, 0, 1) }, /rectangle has zero width \[0, 0, 0, 1\]/);
});
test('new Rect x1 > x2', function() {
	throws(function() { new Rect(1, 0, 0, 1) }, /rectangle has negative width \[1, 0, 0, 1\]/);
});
test('new Rect y1 == y2', function() {
	throws(function() { new Rect(0, 0, 1, 0) }, /rectangle has zero height \[0, 0, 1, 0\]/);
});
test('new Rect y1 > y2', function() {
	throws(function() { new Rect(0, 1, 1, 0) }, /rectangle has negative height \[0, 1, 1, 0\]/);
});
test('new Rect', function() {
	new Rect(0, 0, 1, 1);
	expect(0);
});

test('Rect.setX1', function() {
	throws(function() { new Rect(0, 0, 1, 1).setX1(1) }, /rectangle has zero width \[1, 0, 1, 1\]/);
});
test('Rect.setY1', function() {
	throws(function() { new Rect(0, 0, 1, 1).setY1(1) }, /rectangle has zero height \[0, 1, 1, 1\]/);
});
test('Rect.setX2', function() {
	throws(function() { new Rect(0, 0, 1, 1).setX2(0) }, /rectangle has zero width \[0, 0, 0, 1\]/);
});
test('Rect.setY2', function() {
	throws(function() { new Rect(0, 0, 1, 1).setY2(0) }, /rectangle has zero height \[0, 0, 1, 0\]/);
});

test('Rect.areEqual r1.getX1() == r2.getX1()', function() {
	ok(!Rect.areEqual(new Rect(0, 2, 3, 4), new Rect(1, 2, 3, 4)));
});
test('Rect.areEqual r1.getY1() == r2.getY1()', function() {
	ok(!Rect.areEqual(new Rect(1, 1, 3, 4), new Rect(1, 2, 3, 4)));
});
test('Rect.areEqual r1.getX2() == r2.getX2()', function() {
	ok(!Rect.areEqual(new Rect(1, 2, 2, 4), new Rect(1, 2, 3, 4)));
});
test('Rect.areEqual r1.getY2() == r2.getY2()', function() {
	ok(!Rect.areEqual(new Rect(1, 2, 3, 3), new Rect(1, 2, 3, 4)));
});
test('Rect.areEqual', function() {
	ok(Rect.areEqual(new Rect(1, 2, 3, 4), new Rect(1, 2, 3, 4)));
});

test('Rect.getIntersect r1.getX1() < r2.getX2()', function() {
	var rect = Rect.getIntersect(new Rect(2, 0, 3, 1), new Rect(0, 0, 1, 1));
	equal(rect, null);
});
test('Rect.getIntersect r1.getY1() < r2.getY2()', function() {
	var rect = Rect.getIntersect(new Rect(0, 2, 1, 3), new Rect(0, 0, 1, 1));
	equal(rect, null);
});
test('Rect.getIntersect r1.getX2() > r2.getX1()', function() {
	var rect = Rect.getIntersect(new Rect(0, 0, 1, 1), new Rect(1, 0, 2, 1));
	equal(rect, null);
});
test('Rect.getIntersect r1.getY2() > r2.getY1()', function() {
	var rect = Rect.getIntersect(new Rect(0, 0, 1, 1), new Rect(0, 1, 1, 2));
	equal(rect, null);
});
test('Rect.getIntersect', function() {
	var rect = Rect.getIntersect(new Rect(0, 0, 2, 2, 1), new Rect(1, 1, 3, 3, 2));
	deepEqual(rect, new Rect(1, 1, 2, 2, 2))
});

test('Rect.clone', function() {
	var rect = new Rect(0, 0, 1, 1, 2);
	deepEqual(Rect.clone(rect), rect);
});

// test('Rect.contains not', function() {
	// ok(!Rect.contains([new Rect(0, 0, 1, 1)], new Rect(0, 0, 2, 2)));
// });
// test('Rect.contains', function() {
	// ok(Rect.contains([new Rect(0, 0, 1, 1)], new Rect(0, 0, 1, 1)));
// });

test('Rect.subtractMultiple r2s.length', function() {
	var r1s = [];
	strictEqual(Rect.subtractMultiple(r1s, []), r1s);
});
test('Rect.subtractMultiple !Rect.getIntersect(r1, r2)', function() {
	var r1s = [new Rect(0, 0, 1, 1)];
	var r2s = [new Rect(1, 1, 2, 2)];
	strictEqual(Rect.subtractMultiple(r1s, r2s), r1s);
});
test('Rect.subtractMultiple r1.zindex > r2.zindex', function() {
	var r1s = [new Rect(0, 0, 1, 1, 1)];
	var r2s = [new Rect(0, 0, 1, 1, 0)];
	strictEqual(Rect.subtractMultiple(r1s, r2s), r1s);
});
test('Rect.subtractMultiple r1 inside r2', function() {
	var r1s = [new Rect(1, 1, 2, 2, 1)];
	var r2s = [new Rect(0, 0, 3, 3, 1)];
	ok(!Rect.subtractMultiple(r1s, r2s).length);
});

test('Rect.subtractMultiple r1.getX1() < r2.getX1()', function() {
	var r1s = [new Rect(0, 0, 2, 1, 1)];
	var r2s = [new Rect(1, 0, 2, 1, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 1);
	deepEqual(rects[0], new Rect(0, 0, 1, 1, 1));
});
test('Rect.subtractMultiple r1.getX2() > r2.getX2()', function() {
	var r1s = [new Rect(0, 0, 2, 1, 1)];
	var r2s = [new Rect(0, 0, 1, 1, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 1);
	deepEqual(rects[0], new Rect(1, 0, 2, 1, 1));
});
test('Rect.subtractMultiple r1.getY1() < r2.getY1()', function() {
	var r1s = [new Rect(0, 0, 1, 2, 1)];
	var r2s = [new Rect(0, 1, 1, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 1);
	deepEqual(rects[0], new Rect(0, 0, 1, 1, 1));
});
test('Rect.subtractMultiple r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(0, 0, 1, 2, 1)];
	var r2s = [new Rect(0, 0, 1, 1, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 1);
	deepEqual(rects[0], new Rect(0, 1, 1, 2, 1));
});

test('Rect.subtractMultiple r1.getX1() < r2.getX1() and r1.getX2() > r2.getX2()', function() {
	var r1s = [new Rect(0, 0, 3, 1, 1)];
	var r2s = [new Rect(1, 0, 2, 1, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(0, 0, 1, 1, 1));
	deepEqual(rects[1], new Rect(2, 0, 3, 1, 1));
});
test('Rect.subtractMultiple r1.getY1() < r2.getY1() and r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(0, 0, 1, 3, 1)];
	var r2s = [new Rect(0, 1, 1, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(0, 0, 1, 1, 1));
	deepEqual(rects[1], new Rect(0, 2, 1, 3, 1));
});
test('Rect.subtractMultiple r1.getX1() < r2.getX1() and r1.getY1() < r2.getY1()', function() {
	var r1s = [new Rect(0, 0, 2, 2, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(0, 0, 1, 2, 1));
	deepEqual(rects[1], new Rect(1, 0, 2, 1, 1));
});
test('Rect.subtractMultiple r1.getX2() > r2.getX2() and r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(1, 1, 3, 3, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(2, 1, 3, 3, 1));
	deepEqual(rects[1], new Rect(1, 2, 2, 3, 1));
});
test('Rect.subtractMultiple r1.getX2() > r2.getX2() and r1.getY1() < r2.getY1()', function() {
	var r1s = [new Rect(1, 0, 3, 2, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(2, 0, 3, 2, 1));
	deepEqual(rects[1], new Rect(1, 0, 2, 1, 1));
});
test('Rect.subtractMultiple r1.getX1() < r2.getX1() and r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(0, 1, 2, 3, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(0, 1, 1, 3, 1));
	deepEqual(rects[1], new Rect(1, 2, 2, 3, 1));
});

test('Rect.subtractMultiple r1.getX1() < r2.getX1() and r1.getX2() > r2.getX2() and r1.getY1() < r2.getY1()', function() {
	var r1s = [new Rect(0, 0, 3, 2, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 3);
	deepEqual(rects[0], new Rect(0, 0, 1, 2, 1));
	deepEqual(rects[1], new Rect(2, 0, 3, 2, 1));
	deepEqual(rects[2], new Rect(1, 0, 2, 1, 1));
});
test('Rect.subtractMultiple r1.getX1() < r2.getX1() and r1.getX2() > r2.getX2() and r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(0, 0, 3, 2, 1)];
	var r2s = [new Rect(1, 0, 2, 1, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 3);
	deepEqual(rects[0], new Rect(0, 0, 1, 2, 1));
	deepEqual(rects[1], new Rect(2, 0, 3, 2, 1));
	deepEqual(rects[2], new Rect(1, 1, 2, 2, 1));
});
test('Rect.subtractMultiple r1.getX1() < r2.getX1() and r1.getY1() < r2.getY1() and r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(0, 0, 2, 3, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 3);
	deepEqual(rects[0], new Rect(0, 0, 1, 3, 1));
	deepEqual(rects[1], new Rect(1, 0, 2, 1, 1));
	deepEqual(rects[2], new Rect(1, 2, 2, 3, 1));
});
test('Rect.subtractMultiple r1.getX2() > r2.getX2() and r1.getY1() < r2.getY1() and r1.getY2() > r2.getY2()', function() {
	var r1s = [new Rect(0, 0, 2, 3, 1)];
	var r2s = [new Rect(0, 1, 1, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 3);
	deepEqual(rects[0], new Rect(1, 0, 2, 3, 1));
	deepEqual(rects[1], new Rect(0, 0, 1, 1, 1));
	deepEqual(rects[2], new Rect(0, 2, 1, 3, 1));
});

test('Rect.subtractMultiple r2 inside r1', function() {
	var r1s = [new Rect(0, 0, 3, 3, 1)];
	var r2s = [new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 4);
	deepEqual(rects[0], new Rect(0, 0, 1, 3, 1));
	deepEqual(rects[1], new Rect(2, 0, 3, 3, 1));
	deepEqual(rects[2], new Rect(1, 0, 2, 1, 1));
	deepEqual(rects[3], new Rect(1, 2, 2, 3, 1));
});

test('Rect.subtractMultiple substract 2', function() {
	var r1s = [new Rect(0, 0, 2, 2, 1)];
	var r2s = [new Rect(0, 0, 1, 1, 1), new Rect(1, 1, 2, 2, 1)];
	var rects = Rect.subtractMultiple(r1s, r2s);
	equal(rects.length, 2);
	deepEqual(rects[0], new Rect(1, 0, 3, 1, 1));
	deepEqual(rects[1], new Rect(0, 1, 1, 2, 1));
});