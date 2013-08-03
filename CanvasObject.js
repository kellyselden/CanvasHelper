var CanvasBaseObject = Class.extend({
	init: function(stuff) {
		var x = stuff.x || 0;
		var y = stuff.y || 0;
		this.rect = new Rect(
			x,
			y,
			x + stuff.width || 0,
			y + stuff.height || 0,
			stuff.zindex || 0);
		this.draggable = stuff.draggable || false;
		
		this.links = [];
	},
	add: function(obj) {
		this.links.push(obj);
	}
});

var CanvasColorObject = CanvasBaseObject.extend({
	init: function(stuff) {
		this._super(stuff);
		this.color = stuff.color;
	},
	paint: function(rect) {
		this.helper.ctx.fillStyle = this.color;
		this.helper.fillRect(rect);
	}
});

var CanvasImageObject = CanvasBaseObject.extend({
	init: function(stuff) {
		this._super(stuff);
		this.transparent = stuff.transparent;
		this.path = stuff.path;
		this.imageFactory = stuff.imageFactory || function() { return new Image() };
	},
	loadImage: function(path) {
		if (path) this.path = path;
		var image = this.imageFactory();
		image.src = this.path;
		this.setImage(image);
	},
	setImage: function(image) {
		if (!image.complete) {
			this.helper.imageLoadingComplete = false;
			this.preloading = true;
			var me = this;
			return setTimeout(function() { me.setImage(image) }, 0); 
		}
		this.preloading = false;
		this.image = image;
		this.setImageDimensions(0, 0, image.width, image.height);
	},
	//don't think this or anything in here is necessary
	setImageDimensions: function(imageX, imageY, imageWidth, imageHeight) {
		this.imageX = imageX;
		this.imageY = imageY;
		this.imageWidth = imageWidth;
		this.imageHeight = imageHeight;
	},
	paint: function(rect) {
		var scaleX1 = this.image.width / this.imageWidth;
		var scaleY1 = this.image.height / this.imageHeight;
		var scaleX2 = this.imageWidth / (this.rect.getX2() - this.rect.getX1());
		var scaleY2 = this.imageHeight / (this.rect.getY2() - this.rect.getY1());
		// var x = this.imageX + Math.round(rect.getX1() - this.rect.getX1()) * scaleX;
		// var y = this.imageY + Math.round(rect.getY1() - this.rect.getY1()) * scaleY;
		// var width = Math.min(Math.round(rect.getX2() - rect.getX1()) * scaleX, this.imageWidth - x);
		// var height = Math.min(Math.round(rect.getY2() - rect.getY1()) * scaleY, this.imageHeight - y);
		var x = this.imageX + (rect.getX1() - this.rect.getX1()) * scaleX2;
		var y = this.imageY + (rect.getY1() - this.rect.getY1()) * scaleY2;
		var width = (rect.getX2() - rect.getX1()) * scaleX2;
		var height = (rect.getY2() - rect.getY1()) * scaleY2;
		//console.log('x:\t' + x + ', y:\t' + y + ', w:\t' + width + ', h:\t' + height);
		rect = this.helper.roundRect(rect);
		// var x = this.imageX + (rect.getX1() - Math.round(this.rect.getX1())) * scaleX;
		// var y = this.imageY + (rect.getY1() - Math.round(this.rect.getY1())) * scaleY;
		// var width = Math.min((rect.getX2() - rect.getX1()) * scaleX, this.imageWidth - x);
		// var height = Math.min((rect.getY2() - rect.getY1()) * scaleY, this.imageHeight - y);
		// if (!width || !height)
			// return; //scaling can make fractional paint boxes
		this.helper.ctx.drawImage(this.image,
			x,
			y,
			width,
			height,
			rect.getX1(),
			rect.getY1(),
			rect.getX2() - rect.getX1(),
			rect.getY2() - rect.getY1());
	}
});