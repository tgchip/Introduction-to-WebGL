"use strict";

var canvas;
var gl;
var points = [];
var bufferId;
var bMouseDown = false;
var colorLoc;
var lineWidth = 1;

function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect();
    return {
       x: -1 + 2*(evt.clientX - rect.left)/canvas.width,
       y: -1 + 2*(canvas.height - evt.clientY + rect.top)/canvas.height
     };
}

function onButtonClick()
{
    gl.clear( gl.COLOR_BUFFER_BIT );	
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas, {preserveDrawingBuffer:true} );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	colorLoc = gl.getUniformLocation(program, "color");
	gl.uniform4f(colorLoc, 0.0, 0.0, 0.0, 1.0);
    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


	canvas.addEventListener("mousedown", function(event) 
	{
		bMouseDown = true;
		document.getElementById("gl-canvas").style.cursor="crosshair";
		points = []
		var mousePos = getMousePos(canvas, event);
		console.log("Mouse Down Event: (" + mousePos.x + " , " + mousePos.y + ")");
	});
	
	canvas.addEventListener("mouseup", function(event) 
	{
		bMouseDown = false;
		document.getElementById("gl-canvas").style.cursor="default";
		var mousePos = getMousePos(canvas, event);;
		console.log("Mouse Up Event: (" + mousePos.x + " , " + mousePos.y + ")");
	});
	
	canvas.addEventListener("mousemove", function(event) 
	{
		if (bMouseDown)
		{
			var mousePos = getMousePos(canvas, event);
			var position = vec2(mousePos.x, mousePos.y);
			points.push(position);
			render();
			console.log("Mouse Move Event: (" + mousePos.x + " , " + mousePos.y + ")");
		}
	});
	
	var colSelections = document.getElementById("colorSelection");
	colSelections.addEventListener('click', function()
	{
		switch (colSelections.selectedIndex)
		{
			case 0:
				gl.uniform4f(colorLoc, 0.0, 0.0, 0.0, 1.0);
				break;
			case 1:
				gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0);
				break;
			case 2:
				gl.uniform4f(colorLoc, 0.0, 1.0, 0.0, 1.0);
				break;
			case 3:
				gl.uniform4f(colorLoc, 0.0, 0.0, 1.0, 1.0);
				break;
		}
	});

	var lwSelections = document.getElementById("lineWidth");
	lwSelections.addEventListener('click', function()
	{
		switch (lwSelections.selectedIndex)
		{
			case 0:
				lineWidth = 1;
				break;
			case 1:
				lineWidth = 3;
				break;
			case 2:
				lineWidth = 6;
				break;
			case 3:
				lineWidth = 9;
				break;
		}
	});
    
};



function render()
{
    // First, initialize the corners of our gasket with three points.

	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	gl.lineWidth(lineWidth);
    gl.drawArrays(gl.LINE_STRIP, 0, points.length );

}