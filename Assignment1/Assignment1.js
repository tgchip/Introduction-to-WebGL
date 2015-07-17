"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 4;
var Theta = 0.25;
var d = 0;
var bufferId;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


	document.getElementById("sliderTes").onchange = function() 
	{
		
	        NumTimesToSubdivide = event.srcElement.value;
	        render();
	};
	
	document.getElementById("sliderTheta").onchange = function() 
	{
	        Theta = event.srcElement.value;
	        render();
	};

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function twist(vertex)
{
	var result = vec2(0.0, 0.0);
	var twistFactor = Theta*(Math.PI/180.0)*Math.sqrt(vertex[0]*vertex[0] + vertex[1]*vertex[1]);
	result[0] = vertex[0]*Math.cos(twistFactor) - 	vertex[1]*Math.sin(twistFactor);
	result[1] = vertex[0]*Math.sin(twistFactor) + vertex[1]*Math.cos(twistFactor);
	return result
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( twist(a), twist(ab), twist(ac), count );
        divideTriangle( twist(c), twist(ac), twist(bc), count );
        divideTriangle( twist(b), twist(bc), twist(ab), count );
        divideTriangle( twist(ab), twist(ac), twist(bc), count );
    }
}

function render()
{
    // First, initialize the corners of our gasket with three points.
	var vertices = [
 		vec2( -0.61, -0.35 ),
        vec2(  0.0,  0.7 ),
        vec2(  0.61, -0.35 )
    ];
	points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
	points = [];
}