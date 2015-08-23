"use strict";

var canvas;
var gl;
var objectSelected = "sphere";
var program;
var runAnimation = false;

var projection = {};
var camera = {};
var translation = {};
var lightsState =[];

var sphere = {};
var cone = {};
var cylinder = {};

var color = [0.8, 0.1, 0.1, 1.0];
var vertexPositionData = [];
var normalData = [];
var indexData = [];
var projectionMatrix = [];
var translationMatrix = [];

var projectionMatrixLoc;
var translationMatrixLoc;
var modelViewMatrix, modelViewMatrixLoc;
var scalingMatrix, scalingMatrixLoc;

//- Stuff Added for the Lighting in Assignment #4

var lightPosition = [];
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = [vec4( 1.0, 0.0, 1.0, 1.0 ), vec4( 0.0, 1.0, 1.0, 1.0 )];
var materialDiffuse = [vec4( 1.0, 0.8, 0.0, 1.0), vec4(0.0, 1.0, 0.8, 1.0)];
var materialSpecular = [vec4( 1.0, 0.8, 0.0, 1.0 ), vec4(0.0, 1.0, 0.8, 1.0)];
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

function onClearButtonClick()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
	clearVertexData();
}

function onAddButtonClick()
{
	createObject(objectSelected);
}

function onStopAnimationClick()
{
	if (runAnimation == true) {
		runAnimation = false;
		document.getElementById('runAnimation').innerHTML = 'Start Animation';
	} else {
		runAnimation = true;
		document.getElementById('runAnimation').innerHTML = 'Stop Animation';
		render();
	}
}

function onToggleLight1()
{
	if (document.getElementById('light1').checked == true)
	{
		document.getElementById('light1').value == "On";
		SetLightState('light1', 'On');
	} else {
		document.getElementById('light1').value == "Off";
		SetLightState('light1', 'Off');		
	};
}


function onToggleLight2()
{
	if (document.getElementById('light2').checked == true)
	{
		document.getElementById('light2').value == "On";
		SetLightState('light2', 'On');
	} else {
		document.getElementById('light2').value == "Off";
		SetLightState('light2', 'Off');		
	};
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

	scalingMatrix = scalem( 0.3, 0.3, 0.3 );
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "uProjectionMatrix" );       
	translationMatrixLoc = gl.getUniformLocation( program, "uTranslationMatrix" );
	scalingMatrixLoc = gl.getUniformLocation( program, "uScalingMatrix" );
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniformMatrix4fv( scalingMatrixLoc, false, flatten(scalingMatrix) );
	
	switch (typeOfObject)
	{
		case "sphere":
	    	projectionMatrix[0] = ortho(projection.left, projection.right, projection.bottom, 
								 projection.ytop, projection.near, projection.far);
			translationMatrix[0] = translate(translation.x, translation.y, 0.0);		
			createSphereVertexes();
			break;
		case "cone":
    		projectionMatrix[1] = ortho(projection.left, projection.right, projection.bottom, 
							 projection.ytop, projection.near, projection.far);
			translationMatrix[1] = translate(translation.x, translation.y, 0.0);
			createConeVertexes();
			break;
		case "cylinder":
			projectionMatrix[2] = ortho(projection.left, projection.right, projection.bottom, 
						 projection.ytop, projection.near, projection.far);
			translationMatrix[2] = translate(translation.x, translation.y, 0.0);
			createCylinderVertexes();
			break;
	}
	render();	
	
}

window.onload = function init()
{
	//- Initialization of projection properties
	projection.near = -5;
	projection.far = 5;
	projection.left = -1.0;
	projection.right = 1.0;
	projection.ytop = 1.0;
	projection.bottom = -1.0;
	//- Initialization of camera properties	
	camera.radius = 6.0;
	camera.theta  = 45.0;
	camera.phi    = 45.0;
	//- Translation
	translation.x = 0.0;
	translation.y = 0.0;
	
	clearVertexData();
	clearTransformationData();
	
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas , {preserveDrawingBuffer:true});   // 
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
	
	//- Add the data for Assignment #4 - Lighting
	SetLightState("light1", "On");
	SetLightState("light2", "On");

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
	
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
	

	document.getElementById("sliderXPosition").onchange = function() 
	{
	    translation.x = projection.right*(event.srcElement.value/310.0);
	};
	
	document.getElementById("sliderYPosition").onchange = function() 
	{
	    translation.y = projection.ytop*(event.srcElement.value/256.0);
	};
    
};

function SetLightState(light, state)
{
	if (light == "light1")
	{
		if (state == "On")
		{
			materialAmbient[0] = vec4( 1.0, 0.0, 1.0, 1.0 );
			materialDiffuse[0] = vec4( 1.0, 0.0, 0.8, 1.0);
			materialSpecular[0] = vec4( 1.0, 0.0, 0.8, 1.0 );		
		}
		else
		{
			materialAmbient[0] = vec4( 0.2, 0.0, 0.2, 1.0 );
			materialDiffuse[0] = vec4( 0.2, 0.0, 0.2, 1.0);
			materialSpecular[0] = vec4( 0.2, 0.0, 0.2, 1.0 );			
		}
	}
	else
	{
		if (state == "On")
		{
			materialAmbient[1] 	= vec4( 0.0, 1.0, 1.0, 1.0 );
			materialDiffuse[1] 	= vec4(0.0, 1.0, 0.8, 1.0);
			materialSpecular[1] = vec4(0.0, 1.0, 0.8, 1.0);			
		}
		else
		{
			materialAmbient[1] 	= vec4( 0.0, 0.2, 0.2, 1.0 );
			materialDiffuse[1] 	= vec4(0.0, 0.2, 0.2, 1.0);
			materialSpecular[1] = vec4(0.0, 0.2, 0.2, 1.0);			
		}
	}
	
	var ambientProduct = [];
    var diffuseProduct = [];
    var specularProduct = [];

	for (var i=0; i<2; i++)
	{
		ambientProduct[i] = mult(lightAmbient, materialAmbient[i]);
	    diffuseProduct[i] = mult(lightDiffuse, materialDiffuse[i]);
	    specularProduct[i] = mult(lightSpecular, materialSpecular[i]);		
	}
	
	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
}

function clearVertexData()
{
	for (var i=0; i<3; i++)
	{
		vertexPositionData[i] 	= [];
		normalData[i] 			= [];
		indexData[i] 			= [];
	}
}

function clearTransformationData()
{
	for (var i=0; i<3; i++)
	{
		projectionMatrix[i] 	= [];
		translationMatrix[i] 	= [];
	}
}

function updateProjection()
{
    projection.left = -2.0 - 6*(100 - event.srcElement.value)/100.0;
	projection.right = 2.0 + 6*(100 - event.srcElement.value)/100.0;
	projection.ytop = 2.0 + 6*(100 - event.srcElement.value)/100.0;
	projection.bottom = -2.0 - 6*(100 - event.srcElement.value)/100.0;	
	
}


function createSphereVertexes()
{
	vertexPositionData[0] 	= [];
	normalData[0] 			= [];
	indexData[0] 			= []
	
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

            normalData[0].push(x);
            normalData[0].push(y);
            normalData[0].push(z);
			
            vertexPositionData[0].push(radius*x);
            vertexPositionData[0].push(radius*y);
            vertexPositionData[0].push(radius*z);

        }
    }
	
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) 
	{
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) 
		{
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			
            indexData[0].push(first);
            indexData[0].push(second);
            indexData[0].push(first + 1);

            indexData[0].push(second);
            indexData[0].push(second + 1);
            indexData[0].push(first + 1);
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

	var nIndex;
	if (topRadius < 0.5) {
		vertexPositionData[1] = [];
		indexData[1] = [];
		nIndex = 1;
	} else {
		vertexPositionData[2] = [];
		indexData[2] = [];
		nIndex = 2;		
		
	}
	
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

	  		vertexPositionData[nIndex].push(sin * ringRadius);
	  		vertexPositionData[nIndex].push(y);
	  		vertexPositionData[nIndex].push(cos * ringRadius);
			
			normalData[nIndex].push((yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant));
			normalData[nIndex].push((yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant));
			normalData[nIndex].push((yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant));	

    	}
  	}

  	for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {
    	for (var ii = 0; ii < radialSubdivisions; ++ii) {
      		indexData[nIndex].push(vertsAroundEdge * (yy + 0) + 0 + ii);
      		indexData[nIndex].push(vertsAroundEdge * (yy + 0) + 1 + ii);
      		indexData[nIndex].push(vertsAroundEdge * (yy + 1) + 1 + ii);

      		indexData[nIndex].push(vertsAroundEdge * (yy + 0) + 0 + ii);
      		indexData[nIndex].push(vertsAroundEdge * (yy + 1) + 1 + ii);
      		indexData[nIndex].push(vertsAroundEdge * (yy + 1) + 0 + ii);
   		}
  
	}

}

var theta = [0.0, Math.PI/180.0];
var dir   = [1.0, -1.0];
function positionLights()
{
	var radius = 20.0;

	var speed = [2.0*Math.PI/(20.0*180.0), 5.0*Math.PI/(20.0*180.0)];
	
	for (var i=0; i<2; i++)
	{
		var phi = (-2*i + 1)*45*Math.PI/180;

		lightPosition[i] = vec4(radius*Math.cos(phi)*Math.cos(theta[i]),
								radius*Math.sin(phi),
		 						radius*Math.cos(phi)*Math.sin(theta[i]) + radius/2.0,
								0.0);

		theta[i] = theta[i] + dir[i]*speed[i];
		if (theta [i] < 0.0)
		{
			dir[i] = 1.0;
		}
		if (theta [i] > Math.PI )
		{
			dir[i] = -1.0;
		}
	}
}

function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	positionLights();
	var lightPosLoc = gl.getUniformLocation(program, "lightPosition");
	gl.uniform4fv(lightPosLoc, flatten(lightPosition) );
	
	for (var i=0; i<3; i++)
	{
		if (vertexPositionData[i].length > 1.0)
		{
		    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix[i]) );
			gl.uniformMatrix4fv( translationMatrixLoc, false, flatten(translationMatrix[i]) );
	
			var nBuffer = gl.createBuffer();
		    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
		    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normalData[i]), gl.STATIC_DRAW );
		    var vNormalLoc = gl.getAttribLocation( program, "vNormal" );
		    gl.enableVertexAttribArray( vNormalLoc );
		    gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 );
	
			var vertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[i]), gl.STATIC_DRAW);
			var vPositionLoc = gl.getAttribLocation(program, "vPosition");
			gl.enableVertexAttribArray(vPositionLoc);
			gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

			var vertexIndexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[i]), gl.STATIC_DRAW);

			gl.drawElements(gl.TRIANGLES, indexData[i].length, gl.UNSIGNED_SHORT, 0);

		}
	}
	
	if (runAnimation == true)
	{
		requestAnimFrame(render);
	}
}