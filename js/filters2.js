var canvas = document.getElementById('imageCanvas');
var context = canvas.getContext("2d");
var img = document.getElementById('image');
var orig = null;

var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change',function(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var image = new Image();
        image.onload = function(){
            context.drawImage(image, 0, 0,image.width,image.height);
            orig = context.getImageData( 0, 0, canvas.width, canvas.height);
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});
var Reset = function(){
  context.putImageData(orig, 0, 0);
};

var btnGrayscale = function () {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);

    var pixels = imgData.data;

    for (var i = 0; i < pixels.length; i += 4) {
        var grayscale = pixels[i] * .2126 + pixels[i + 1] * .7152 + pixels[i + 2] * .0722;
        pixels[i] = grayscale;
        pixels[i + 1] = grayscale;
        pixels[i + 2] = grayscale;
    }
    context.putImageData(imgData, 0, 0);
};
var btnBrightness = function () {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imgData.data;

    var adjustment = 30;
    for (var i = 0; i < pixels.length; i += 4) {
        pixels[i]   += adjustment;
        pixels[i+1] += adjustment;
        pixels[i+2] += adjustment;
    }
    context.putImageData(imgData, 0, 0);
};

var btnThreshold = function () {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imgData.data;

    var thresholdAdj = 190;

    for (var i = 0; i < pixels.length; i += 4) {
        var threshold = (pixels[i] * .2126 + pixels[i+1] * .7152 + pixels[i+2] * .0722 >= thresholdAdj) ? 255 : 0;
        pixels[i]   = threshold;
        pixels[i+1] = threshold;
        pixels[i+2] = threshold;
    }
    context.putImageData(imgData, 0, 0);
};
var opaque = false;
//USREDNIAJACY
var btnCustom = function(filterArray){
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imgData.data;

    var weights = filterArray;

    var side = Math.round(Math.sqrt(weights.length)); // ~1200
    var halfSide = Math.floor(side/2); // ~600

    var src = pixels;
    var sw  = imgData.width; // sw 550
    var sh  = imgData.height; // sh 600

    var w = sw; // w 550
    var h = sh; // h 600

    var output = context.createImageData(w, h);
    var dst = output.data;

    var alphaFac = opaque ? 1 : 0;
    for (var y=0; y<h; y++) {
        for (var x=0; x<w; x++) {
            var sy = y; // sy 600
            var sx = x; // sx 550
            var dstOff = (y*w+x)*4; // ( (0-600)*550+(0-600) ) * 4 || ( 1 * 550 + 1 ) * 4 = 2 204 v ( 600 * 550 + 600 ) * 4 = 1 322 400
            var r=0, g=0, b=0, a=0;

            for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                    var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
                    var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
                    var srcOff = (scy*sw+scx)*4;
                    var wt = weights[cy*side+cx];
                    r += src[srcOff] * wt;
                    g += src[srcOff+1] * wt;
                    b += src[srcOff+2] * wt;
                    a += src[srcOff+3] * wt;
                }
            }
            dst[dstOff] = r;
            dst[dstOff+1] = g;
            dst[dstOff+2] = b;
            dst[dstOff+3] = a + alphaFac*(255-a);
        }
    }
    context.putImageData(output, 0, 0);
};



var USREDNIAJACY = [1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9];

var SOBEL_POZIOMY = [ 1,  2,  1,
    0,  0,  0,
    -1, -2, -1];

var SOBEL_PIONOWY = [ 1,  0, -1,
    2,  0, -2,
    1,  0, -1];


var KWADRATOWY = [  1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1];

var KOLOWY = [  0, 1, 1, 1, 0,
                1, 1, 1, 1, 1,
                1, 1, 1, 1, 1,
                1, 1, 1, 1, 1,
                0, 1, 1, 1, 0];

var MEDIAN = [  1, 1, 1,
                1,  1, 1,
                1, 1, 1];

var algorithmHoaresa = function(array){

    var i = 0;
    var j = (array.length - 1);
    var w = j / 2;
    var k;

    while (i !== j) {
        k = partition(array,i,j);
        k = k - i + 1;
        if(k >= w) j = i + k - 1;
        if(k < w){
            w -= k;
            i += k;
        }
    }

    return array[i];
};


var partition = function(array,a,b){
    var tmp;
    var e = array[a];

    while (a < b){
        while ((a < b) && (array[b] >= e)) b--;
        while ((a < b) && (array[b] < e)) b--;
        if(a < b){
            tmp = array[a];
            array[a] = array[b];
            array[b] = tmp;
        }
    }

    return a;
};