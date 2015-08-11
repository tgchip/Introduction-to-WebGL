"use strict";

var canvas;
var gl;
var objectSelected = "sphere";
var program;

var projection = {};
var camera = {};
var translation = {};

var sphere = {};
var cone = {};
var cylinder = {};

var color = [0.8, 0.1, 0.1, 1.0];
var vertexPositionData = [];
var indexData = [];
var modelViewMatrix, modelViewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;
var translationMatrix, translationMatrixLoc;


function onClearButtonClick()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
}

function onAddButtonClick()
{
	createObject(objectSelected);
}

function createObject(typeOfObject)
{
	const at = vec3(0.0, 0.0, 0.0);
	const up = vec3(0.0, 1.0, 0.0);
	var theta = camera.theta*Math.PI/180.0;
	var phi = camera.phi*Math.PI/180.0;
    var eye = vec3(camera.radius*Math.sin(theta)*Math.cos(phi), 
        		   camera.radius*Math.sin(theta)*Math.sin(phi), 
				   camera.radius*Math.cos(theta));

	modelViewMatrix = lookAt(eye, at , up);
	//ortho(left, right, bottom, ytop, near, far);
    projectionMatrix = ortho(projection.left, projection.right, projection.bottom, 
							 projection.ytop, projection.near, projection.far);
	translationMatrix = translate(translation.x, translation.y, 0.0);
	modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "uProjectionMatrix" );       
	translationMatrixLoc = gl.getUniformLocation( program, "uTranslationMatrix" );
	
	switch (typeOfObject)
	{
		case "sphere":
			createSphereVertexes();
			break;
		case "cone":
			createConeVertexes();
			break;
		case "cylinder":
			createCylinderVertexes();
			break;
	}
	render();	
	
}

window.onload = function init()
{
	//- Initialization of projection properties
	projection.near = -10;
	projection.far = 10;
	projection.left = -4.0;
	projection.right = 4.0;
	projection.ytop = 4.0;
	projection.bottom = -4.0;
	//- Initialization of camera properties	
	camera.radius = 6.0;
	camera.theta  = 45.0;
	camera.phi    = 45.0;
	//- Translation
	translation.x = 0.0;
	translation.y = 0.0;
	
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas, {preserveDrawingBuffer:true} );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	//createObject("sphere")
	
	var objSelections = document.getElementById("objectSelection");
	objSelections.addEventListener('click', function()
	{
		
		switch (objSelections.selectedIndex)
		{
			case 0:
				objectSelected = "sphere";
				break;
			case 1:
				objectSelected = "cone";
				break;
			case 2:
				objectSelected = "cylinder";
				break;

		}
	});
	
	var colorSelections = document.getElementById("colorSelection");
	colorSelections.addEventListener('click', function()
	{
		
		switch (colorSelections.selectedIndex)
		{
			case 0:
				color = [0.8, 0.1, 0.1, 1.0];
				break;
			case 1:
				color = [0.1, 0.8, 0.1, 1.0];
				break;
			case 2:
				color = [0.1, 0.1, 0.8, 1.0];
				break;

		}
	});

	document.getElementById("sliderOrientation").onchange = function() 
	{
		camera.phi= event.srcElement.value;
		camera.theta= event.srcElement.value;
	};
	
	document.getElementById("sliderSize").onchange = function() 
	{
		updateProjection();
	};

	document.getElementById("sliderXPosition").onchange = function() 
	{
	    translation.x = projection.right*(event.srcElement.value/310.0);
	};
	
	document.getElementById("sliderYPosition").onchange = function() 
	{
	    translation.y = projection.ytop*(event.srcElement.value/256.0);
	};
    
};

function updateProjection()
{
    projection.left = -2.0 - 6*(100 - event.srcElement.value)/100.0;
	projection.right = 2.0 + 6*(100 - event.srcElement.value)/100.0;
	projection.ytop = 2.0 + 6*(100 - event.srcElement.value)/100.0;
	projection.bottom = -2.0 - 6*(100 - event.srcElement.value)/100.0;	
	
}


function createSphereVertexes()
{
	vertexPositionData = [];
	indexData = [];
	var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 1;

    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) 
	{
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) 
		{
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    for (var latNumber=0; latNumber < latitudeBands; latNumber++) 
	{
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) 
		{
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

}

function createConeVertexes()
{
	createConeOrCylinderVertexes(1.0, 0.02, 1.0, 30, 20, true, true);
}


function createCylinderVertexes()
{
	createConeOrCylinderVertexes(1.0, 1.0, 1.0, 30, 20, true, true)	;
}

function createConeOrCylinderVertexes(
	bottomRadius,
    topRadius,
    height,
    radialSubdivisions,
    verticalSubdivisions,
    opt_topCap,
    opt_bottomCap) 

{
	vertexPositionData = [];
	indexData = [];
	
  	if (radialSubdivisions < 3) {
    	throw Error('radialSubdivisions must be 3 or greater');
  	}

  	if (verticalSubdivisions < 1) {
    	throw Error('verticalSubdivisions must be 1 or greater');
  	}

  	var topCap = (opt_topCap === undefined) ? true : opt_topCap;
  	var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

  	var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

  	var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);


  	var vertsAroundEdge = radialSubdivisions + 1;

  	// The slant of the cone is constant across its surface
  	var slant = Math.atan2(bottomRadius - topRadius, height);
  	var cosSlant = Math.cos(slant);
  	var sinSlant = Math.sin(slant);

  	var start = topCap ? -2 : 0;
  	var end = verticalSubdivisions + (bottomCap ? 2 : 0);

  	for (var yy = start; yy <= end; ++yy) {
    	var v = yy / verticalSubdivisions;
    	var y = height * v;
    	var ringRadius;
    	if (yy < 0) {
      		y = 0;
      		v = 1;
      		ringRadius = bottomRadius;
    	} else if (yy > verticalSubdivisions) {
      		y = height;
      		v = 1;
      		ringRadius = topRadius;
    	} else {
      		ringRadius = bottomRadius +
        	(topRadius - bottomRadius) * (yy / verticalSubdivisions);
    	}
    	if (yy === -2 || yy === verticalSubdivisions + 2) {
      		ringRadius = 0;
      		v = 0;
    	}
    	y -= height / 2;
    	for (var ii = 0; ii < vertsAroundEdge; ++ii) {
      		var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
      		var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
	  		vertexPositionData.push(sin * ringRadius);
	  		vertexPositionData.push(y);
	  		vertexPositionData.push(cos * ringRadius);		
    	}
  	}

  	for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {
    	for (var ii = 0; ii < radialSubdivisions; ++ii) {
      		indexData.push(vertsAroundEdge * (yy + 0) + 0 + ii);
      		indexData.push(vertsAroundEdge * (yy + 0) + 1 + ii);
      		indexData.push(vertsAroundEdge * (yy + 1) + 1 + ii);

      		indexData.push(vertsAroundEdge * (yy + 0) + 0 + ii);
      		indexData.push(vertsAroundEdge * (yy + 1) + 1 + ii);
      		indexData.push(vertsAroundEdge * (yy + 1) + 0 + ii);
   		}
  
	}

}



function render()
{
	var vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	var vPositionLoc = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPositionLoc);
	gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

	var vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniformMatrix4fv( translationMatrixLoc, false, flatten(translationMatrix) );
	var colorLoc = gl.getUniformLocation( program, "fColor" ); 

	gl.uniform4fv(colorLoc, flatten(color));
	gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
	gl.uniform4fv(colorLoc, flatten([0.0, 0.0, 0.0, 1.0]));
	gl.drawElements(gl.LINES, indexData.length, gl.UNSIGNED_SHORT, 0);

}