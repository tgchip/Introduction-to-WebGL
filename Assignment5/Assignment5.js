"use strict";

var canvas;
var gl;
var textureSelected = "";
var program;

var projection = {};
var camera = {};
var rotation = {};
var lightsState =[];

var sphere = {};
var cone = {};
var cylinder = {};

var color = [0.8, 0.1, 0.1, 1.0];
var vertexPositionData;
var normalData;
var textureCoordData;
var indexData;

var texture;
var sampler, samplerLoc;
var projectionMatrix, projectionMatrixLoc;
var rotationMatrix  , rotationMatrixLoc;
var modelViewMatrix , modelViewMatrixLoc;
var scalingMatrix   , scalingMatrixLoc;

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

function onResetOrientationButtonClick()
{
	document.getElementById('sliderXPosition').value = 0;
	document.getElementById('sliderYPosition').value = 0;
	document.getElementById('sliderZPosition').value = 0;
	rotation.x = 0;
	rotation.y = 0;
	rotation.z = 0;
	rotationMatrix = mult(mult(rotate(rotation.x, 1.0, 0.0, 0.0), rotate(rotation.y, 0.0, 1.0, 0.0)), rotate(rotation.z, 0.0, 0.0, 1.0));
	if (textureSelected != "")
	{
		render();
	}		
}

function onClearButtonClick()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
	textureSelected = ""
}


function onToggleLight1()
{
	if (document.getElementById('light1').checked == true)
	{
		document.getElementById('light1').value == "On";
		SetLightState('light1', 'On');
		render();
	} else {
		document.getElementById('light1').value == "Off";
		SetLightState('light1', 'Off');
		render();		
	};
}


function onToggleLight2()
{
	if (document.getElementById('light2').checked == true)
	{
		document.getElementById('light2').value == "On";
		SetLightState('light2', 'On');
		render();
	} else {
		document.getElementById('light2').value == "Off";
		SetLightState('light2', 'Off');	
		render();	
	};
}

function createSphere()
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

	scalingMatrix = scalem( 0.6, 0.6, 0.6 );
	
	
	
	modelViewMatrixLoc = gl.getUniformLocation( program, "uModelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "uProjectionMatrix" );       
	rotationMatrixLoc = gl.getUniformLocation( program, "uRotationMatrix" );
	scalingMatrixLoc = gl.getUniformLocation( program, "uScalingMatrix" );
	samplerLoc = gl.getUniformLocation(program, "uSampler");
	
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniformMatrix4fv( scalingMatrixLoc, false, flatten(scalingMatrix) );
	

	projectionMatrix = ortho(projection.left, projection.right, projection.bottom, 
								 projection.ytop, projection.near, projection.far);
	rotationMatrix = mult(mult(rotate(rotation.x, 1.0, 0.0, 0.0), rotate(rotation.y, 0.0, 1.0, 0.0)), rotate(rotation.z, 0.0, 0.0, 1.0));		
	createSphereVertexes();
		
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
	rotation.x = 0.0;
	rotation.y = 0.0;
	rotation.z = 0.0;
	
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

	var textureSelections = document.getElementById("textureSelection");
	textureSelections.addEventListener('click', function()
	{
		
		switch (textureSelections.selectedIndex)
		{
			case 0:
				textureSelected="checkerboard";
				var image = GetCheckerBoardImage(256,16);
				ConfigureTexture(image,256);
				break;
			case 1:
				textureSelected="bricks";
				var image = document.getElementById("brickWall");
				ConfigureTexture(image, 0);
				break;
			case 2:
				textureSelected="concrete";
				var image = document.getElementById("concrete");
				ConfigureTexture(image, 0);
				break;

		}
		createSphere();
		render();
	});
	

	document.getElementById("sliderXPosition").onchange = function() 
	{
	    rotation.x = event.srcElement.value;
		rotationMatrix = mult(mult(rotate(rotation.x, 1.0, 0.0, 0.0), rotate(rotation.y, 0.0, 1.0, 0.0)), rotate(rotation.z, 0.0, 0.0, 1.0));
		render();	
	};
	
	document.getElementById("sliderYPosition").onchange = function() 
	{
	    rotation.y = event.srcElement.value;
		rotationMatrix = mult(mult(rotate(rotation.x, 1.0, 0.0, 0.0), rotate(rotation.y, 0.0, 1.0, 0.0)), rotate(rotation.z, 0.0, 0.0, 1.0));
		render();	
	};
	
	document.getElementById("sliderZPosition").onchange = function() 
	{
	    rotation.z = event.srcElement.value;
		rotationMatrix = mult(mult(rotate(rotation.x, 1.0, 0.0, 0.0), rotate(rotation.y, 0.0, 1.0, 0.0)), rotate(rotation.z, 0.0, 0.0, 1.0));	
		render();
	};

};

function GetCheckerBoardImage(textureSize,numChecks)
{
	var c;
	var image = new Uint8Array(4*textureSize*textureSize);
	for (var i=0; i<textureSize; i++) {
		for (var j=0; j<textureSize; j++) {
			var patchX = Math.floor(i/(textureSize/numChecks));
			var patchY = Math.floor(j/(textureSize/numChecks)); 
			if (patchX%2 ^ patchY%2) 
				c = 255;
			else
				c = 0;
				
			image[4*i*textureSize +   4*j] = c;
			image[4*i*textureSize + 4*j+1] = c;
			image[4*i*textureSize + 4*j+2] = c;
			image[4*i*textureSize + 4*j+3] = 255;			
		}
	}
	return image;
}


function ConfigureTexture(image, textureSize)
{
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	if (textureSize > 0)
	{
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, 
											gl.RGBA, gl.UNSIGNED_BYTE, image);		

	}
	else
	{
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	}
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.uniform1i(samplerLoc, 0);
	
}

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



function updateProjection()
{
    projection.left = -2.0 - 6*(100 - event.srcElement.value)/100.0;
	projection.right = 2.0 + 6*(100 - event.srcElement.value)/100.0;
	projection.ytop = 2.0 + 6*(100 - event.srcElement.value)/100.0;
	projection.bottom = -2.0 - 6*(100 - event.srcElement.value)/100.0;	
	
}


function createSphereVertexes()
{
	vertexPositionData	= [];
	normalData 			= [];
	indexData			= [];
	textureCoordData    = [];
	
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

            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);

			textureCoordData.push(u);
            textureCoordData.push(v);

            vertexPositionData.push(radius*x);
            vertexPositionData.push(radius*y);
            vertexPositionData.push(radius*z);

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

	gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniformMatrix4fv( rotationMatrixLoc, false, flatten(rotationMatrix) );
	
	var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW );
	var vNormalLoc = gl.getAttribLocation( program, "vNormal" );
	gl.enableVertexAttribArray( vNormalLoc );
	gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 );
	
	var vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	var vPositionLoc = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPositionLoc);
	gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

	var vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
	
	var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordData), gl.STATIC_DRAW);
    var aTextureCoordLoc = gl.getAttribLocation(program, "aTextureCoord");
	gl.vertexAttribPointer(aTextureCoordLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aTextureCoordLoc);

	//gl.activeTexture(gl.TEXTURE0);
    //gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.uniform1i(samplerLoc, 0);

	gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

}