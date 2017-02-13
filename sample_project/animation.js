// *******************************************************
// CS 174a 

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }
var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), // Omit the final (string) parameter if you want no texture
			greyPlastic = new Material( vec4( .5,.5,.5,1 ), .2, .8, .5, 20 ),
			stars = new Material ( vec4( 0,0,0, 0), 1, 0.2, 0.20, 30, "stars.png"),
			whiteWall = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "wall.jpg" ),
			red = new Material( vec4 (.8, 0, 0, 1), 1, 1, 1, 20),
			white = new Material (vec4(1,1,1,1), 1,1,1,20),
			black = new Material (vec4(0,0,0,1), 1,1,1,20),
			dark_pink = new Material(vec4(1,64/255,121/255,1),.9,.9,.8,40),
			light_pink = new Material(vec4(1,102/255,184/255,1),.8,.8,.6,40),
			dragonGold = new Material ( vec4( 0, 0, 0, 0), 1, 0.2, 0.20, 30, "gold.jpg"),
			metalSilver = new Material ( vec4( .5, .5, .5, 1), .3, .3, .6, 30, "silver.jpg"),
			signText = new Material ( vec4( 0, 0, 0, 0), 1, 0.2, 0.20, 30, "sign.png"),
			doraemonBlue = new Material( vec4(41/255, 138/255, 191/255), 1,1,1,20),
			grass = new Material (vec4(0, 153/255, 0, 1), 1, 0.2, 0.2, 30),
			blueCarpet = new Material ( vec4( 0, 0, 0, 0), 1, 0.2, 0.20, 30, "carpet.jpg"),
			gold = new Material(vec4(1,215/255,0),.6,.7,.5,20),
			orchid = new Material(vec4(122/255,55/255,139/255), .2,.5,.3,80),
			skin = new Material(vec4(253/255,228/255,200/255), .8,.8,.3,40),
			egypt_photo = new Material ( vec4( 0,0,0,0), 1, .1, .1, 30, "egypt2.jpg"),
			dora_photo = new Material ( vec4( 0,0,0,0), 1, .1, .1, 30, "dora_egypt.jpg");


var wall = new Wall();
var floor = new Floor();
var fence = new Fence();
var picture = new Picture();
var sign = new Sign();
var doraemon = new Doraemon();
var door = new Door();



// ********************************t***********************

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif" , "wall.jpg", "gold.jpg", "silver.jpg","egypt2.jpg","sign.png", "carpet.jpg","dora_egypt.jpg"];


// *******************************************************


window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self)
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );

		gl.clearColor( 0, 0, 0, 1 );			// Background color

		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );

		self.m_cube = new cube();
		self.m_obj = new shape_from_file( "teapot.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );

		self.m_triangle = new triangle( mat4() );
		self.m_platform = new platform(50, mat4() );

		self.m_semiphere = new semisphere(mat4(), 4);

		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-40), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);

		self.context.render();
	} ) ( this );

	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );

	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;

		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// *******************************************************
// display(): called once per frame, whenever OpenGL decides it's time to redraw.
Animation.prototype.draw_wall = function(model_transform, wall){
	model_transform = mult(model_transform, scale(wall.wall_x,wall.wall_y,wall.wall_z));
	this.m_cube.draw(this.graphicsState,model_transform, wall.wall_mat);;

	return model_transform;
}

Animation.prototype.draw_floor = function(model_transform, floor, mat){
	model_transform = mult(model_transform,translation(0,floor.floor_pos,0));
	model_transform = mult(model_transform,scale(floor.floor_x,floor.floor_y,floor.floor_z));
	this.m_cube.draw(this.graphicsState, model_transform,mat);

	return model_transform;
}

Animation.prototype.draw_grass = function(model_transform, floor){
	model_transform = mult(model_transform,translation(0,floor.floor_pos,0));
	model_transform = mult(model_transform,scale(floor.grass_x,floor.floor_y,floor.grass_z));
	this.m_cube.draw(this.graphicsState, model_transform,grass);

	return model_transform;
}


Animation.prototype.draw_platform = function(model_transform, color) {
	model_transform = mult(model_transform, rotation(270, 1, 0, 0));
	this.m_platform.draw(this.graphicsState, model_transform, color);

	return model_transform;
}

Animation.prototype.draw_fence_bar = function(model_transform, fence){
	model_transform = mult(model_transform,scale(fence.bar_x,fence.bar_y,fence.bar_z));
		this.draw_platform(model_transform,fence.bar_mat);
	model_transform = mult(model_transform,scale(1/fence.bar_x,1/fence.bar_y,1/fence.bar_z));

	model_transform = mult(model_transform,translation(0,4,0));
	this.m_sphere.draw(this.graphicsState,model_transform,fence.bar_mat);

	return model_transform;
}

Animation.prototype.draw_rope_seg = function(model_transform,fence,a){
	model_transform = mult(model_transform,rotation(90,0,1,0));
	model_transform = mult(model_transform, scale(fence.rope_seg_x, fence.rope_seg_y, fence.rope_seg_z));
	model_transform = mult(model_transform, translation( a,0,0));

	this.m_cylinder.draw(this.graphicsState,model_transform,fence.rope_mat);
	model_transform = mult(model_transform, scale(1/fence.rope_seg_x, 1/fence.rope_seg_y, 1/fence.rope_seg_z));
	model_transform = mult(model_transform,rotation(-90,0,1,0));

	return model_transform;
}

Animation.prototype.draw_rope = function(model_transform, fence,a){
	var x = 0;
	var y = 0;
	var new_y = 0;
	var delta_y = 0
	for(var i = 0; i<fence.num_rope_seg; i++){
		delta_y = new_y - y;
		y = new_y;

		model_transform = mult(model_transform,translation(fence.rope_seg_z, delta_y/30, 0));
		this.draw_rope_seg(model_transform, fence,a);
		x+=fence.rope_seg_z;
		new_y = .7*((Math.pow(x,2))-fence.rope_length*x);
	}

	return model_transform;
}

Animation.prototype.draw_fence = function(model_transform,fence,a){
	model_transform = mult(model_transform,translation(-fence.separation,0,-30));
	this.draw_fence_bar(model_transform,fence);
	model_transform = mult(model_transform,translation(2*fence.separation,0,0));
	this.draw_fence_bar(model_transform,fence);

	model_transform = mult(model_transform,translation(-2*fence.separation+.4,2.5,0));
	this.draw_rope(model_transform, fence,a);

	return model_transform;
}

Animation.prototype.draw_pic_frame = function (model_transform, picture) {
	model_transform = mult(model_transform, translation(0,picture.pic_y,picture.pic_z));
	model_transform = mult(model_transform, scale(picture.frame_x,picture.frame_y,picture.frame_z));
	this.m_cube.draw(this.graphicsState, model_transform, picture.frame_mat);

	return model_transform;
}

Animation.prototype.draw_pic_art = function (model_transform, picture,option) {
	model_transform = mult(model_transform, translation(0,picture.pic_y, picture.pic_z));
	model_transform = mult(model_transform, scale(picture.art_x, picture.art_y, picture.art_z));
	if(option == 0){
		this.m_cube.draw(this.graphicsState, model_transform, egypt_photo);
	}
	if(option == 1){
		this.m_cube.draw(this.graphicsState,model_transform,dora_photo);
	}

	return model_transform;
}

Animation.prototype.draw_picture = function(model_transform, picture,option){
	this.draw_pic_frame(model_transform,picture);
	this.draw_pic_art(model_transform, picture,option);

	return model_transform;
}

Animation.prototype.draw_human = function(model_transform,color){
	model_transform = mult(model_transform, scale(2,2,2));
	if(color == 0){
		this.m_sphere.draw(this.graphicsState,model_transform,greyPlastic);
	}
	if(color == 1){
		this.m_sphere.draw(this.graphicsState,model_transform, red);
	}
	if(color == 2){
		this.m_sphere.draw(this.graphicsState,model_transform,doraemonBlue);
	}
	if(color == 3){
		this.m_sphere.draw(this.graphicsState,model_transform,dark_pink);
	}
	model_transform = mult(model_transform, scale(1/2,1/2,1/2));
	model_transform = mult(model_transform, scale(1.5,1.5,1.5));
	model_transform = mult(model_transform,translation(0,2,0));
	this.m_sphere.draw(this.graphicsState,model_transform, skin);

	return model_transform;
}

Animation.prototype.draw_sign = function(model_transform, sign){
	model_transform = mult(model_transform, translation(sign.sign_pos_x, 0, sign.sign_pos_z));
	model_transform = mult(model_transform, scale(sign.stick_x,sign.stick_y,sign.stick_z));
		this.m_cube.draw(this.graphicsState, model_transform, sign.sign_mat);
	model_transform = mult(model_transform, scale(1/sign.stick_x,1/sign.stick_y,1/sign.stick_z));

	model_transform = mult(model_transform,translation(0,sign.stick_y/2,0));
	model_transform = mult(model_transform,scale(sign.plate_x, sign.plate_y,sign.plate_z));
		this.m_cube.draw(this.graphicsState, model_transform, sign.sign_mat);
	model_transform = mult(model_transform,scale(1/sign.plate_x, 1/sign.plate_y,1/sign.plate_z));
	model_transform = mult(model_transform,scale(sign.plate_x+.01, sign.plate_y-1,sign.plate_z-1));
		this. m_cube.draw(this.graphicsState,model_transform, signText);

	return model_transform;
}

Animation.prototype.draw_dora = function(model_transform, doraemon,mouth_open){
	var dora_stack = [];
	dora_stack.push(model_transform);

		//head
		dora_stack.push(model_transform);
	model_transform = mult(model_transform, scale(doraemon.head_x,doraemon.head_y,doraemon.head_z));
	this.m_sphere.draw(this.graphicsState,model_transform,doraemon.head_mat);
		model_transform = dora_stack.pop();

		//face
	model_transform = mult(model_transform, translation(0,-.5,1));
		dora_stack.push(model_transform);
	model_transform = mult(model_transform, scale(doraemon.face_x,doraemon.face_y, doraemon.face_z));
	this.m_sphere.draw(this.graphicsState, model_transform, doraemon. face_mat);
		model_transform = dora_stack.pop()
	model_transform = mult(model_transform, translation(-.7,2.2,2));
		dora_stack.push(model_transform);

		//left eye
	model_transform = mult(model_transform, scale(doraemon.eye_x,doraemon.eye_y,doraemon.eye_z));
	this.m_sphere.draw(this.graphicsState,model_transform,doraemon.eye_mat);
		model_transform = dora_stack.pop();

		dora_stack.push(model_transform);
	model_transform = mult(model_transform, translation(.4,.5,.8));
	model_transform = mult(model_transform,scale(doraemon.pupil_x, doraemon.pupil_y,doraemon.pupil_z));
	this.m_sphere.draw(this.graphicsState, model_transform, doraemon.pupil_mat);
		model_transform =  dora_stack.pop();

		//right eye
	model_transform = mult(model_transform, translation(1.4,0,0));
		dora_stack.push(model_transform);

	model_transform = mult(model_transform, scale(doraemon.eye_x,doraemon.eye_y,doraemon.eye_z));
	this.m_sphere.draw(this.graphicsState,model_transform,whiteWall);
		model_transform = dora_stack.pop();

		dora_stack.push(model_transform);
	model_transform = mult(model_transform, translation(-.4,.5,.8));
	model_transform = mult(model_transform,scale(doraemon.pupil_x, doraemon.pupil_y,doraemon.pupil_z));
	this.m_sphere.draw(this.graphicsState, model_transform, doraemon.pupil_mat);
		model_transform =  dora_stack.pop();

		//nose
	model_transform = mult(model_transform, translation(-.7,-.3,1));
	model_transform = mult(model_transform, scale(doraemon.nose_x,doraemon.nose_y, doraemon.nose_z));
	this.m_sphere.draw(this.graphicsState, model_transform, doraemon.nose_mat);
		model_transform = dora_stack.pop();

		//mouth
			dora_stack.push(model_transform);
		model_transform = mult(model_transform,translation(0,0,4));
		if (mouth_open == 0	){
			model_transform = mult(model_transform, scale(2,.5,1.5));
		}
		if (mouth_open == 1){
			var y = this.graphicsState.animation_time/9000;
			model_transform = mult(model_transform, scale(doraemon.mouth_open_x,y,doraemon.mouth_open_z));
		}
		if (mouth_open == 2	){
			model_transform = mult(model_transform, scale(doraemon.mouth_open_x,doraemon.mouth_open_y,doraemon.mouth_open_z));
		}
		this.m_semiphere.draw(this.graphicsState, model_transform,red);
		model_transform = dora_stack.pop();

		//collar & bell
		dora_stack.push(model_transform);

	model_transform = mult(model_transform, translation(0,-3,0));
	model_transform = mult(model_transform, rotation(90, 1,0,0));
		dora_stack.push(model_transform);
	model_transform = mult(model_transform, scale(3,3.5,.7));
	this.m_cylinder.draw(this.graphicsState,model_transform,red);
		model_transform = dora_stack.pop();
	model_transform = mult(model_transform, scale(.7,.7,.7));
	model_transform = mult(model_transform, translation(0,6,0));
	this.m_sphere.draw(this.graphicsState,model_transform,gold);

		//body & pocket
		model_transform = dora_stack.pop();
		dora_stack.push(model_transform);
	model_transform = mult(model_transform,translation(0, -6, 0));
	model_transform = mult(model_transform,scale(4,4,4));
		this.m_sphere.draw(this.graphicsState, model_transform, doraemonBlue);
	model_transform = mult(model_transform,scale(1/4,1/4,1/4));

	model_transform = mult(model_transform,translation(0, 0, 4));
	model_transform = mult(model_transform, scale(2,2,.2));
	this.m_semiphere.draw(this.graphicsState, model_transform,white);

		//hands
		model_transform = dora_stack.pop();
	model_transform = mult(model_transform,translation(0,-5,0));
		dora_stack.push(model_transform);
	model_transform = mult(model_transform,translation(-4,0,0));
	model_transform = mult(model_transform,rotation(-45,0,0,1));

	model_transform = mult(model_transform, scale(1,2.5,1));
	this.m_sphere.draw(this.graphicsState,model_transform,doraemonBlue);
	model_transform = mult(model_transform, scale(1,1/2.5,1));

	model_transform = mult(model_transform, translation(0,-2.5,0));
	this.m_sphere.draw(this.graphicsState,model_transform,white);

		model_transform = dora_stack.pop();
	model_transform = mult(model_transform,translation(4,0,0));
	model_transform = mult(model_transform,rotation(45,0,0,1));
	model_transform = mult(model_transform, scale(1,2.5,1));
	this.m_sphere.draw(this.graphicsState,model_transform,doraemonBlue);
	model_transform = mult(model_transform, scale(1,1/2.5,1));

	model_transform = mult(model_transform, translation(0,-2.5,0));
	this.m_sphere.draw(this.graphicsState,model_transform,white);

	return model_transform;
}

Animation.prototype.draw_lightbulb = function(model_transform){
	model_transform = mult(model_transform,scale(.8,1.5,.8));
		this.m_sphere.draw(this.graphicsState, model_transform,gold);
	model_transform = mult(model_transform,scale(1/.8,1/1.5,1/.8));

	model_transform = mult(model_transform,translation(0,-1,0));
	model_transform = mult(model_transform,scale(1.2,1.2,1.2));
	this.m_cube.draw(this.graphicsState,model_transform,greyPlastic);

	return model_transform;
}

Animation.prototype.draw_door = function(model_transform, door,door_open){
	var stack = [];

	//door frame
		stack.push(model_transform);
	model_transform = mult(model_transform, translation(0,10,0));
	model_transform = mult(model_transform,scale(15,1,2));
	this.m_cube.draw(this.graphicsState, model_transform,dark_pink);
		model_transform = stack.pop();
		stack.push(model_transform);
	model_transform = mult(model_transform, translation(0,-9.5,0));
	model_transform = mult(model_transform,scale(15,1,2));
	this.m_cube.draw(this.graphicsState, model_transform,dark_pink);
		model_transform = stack.pop();
		stack.push(model_transform);
	model_transform = mult(model_transform, translation(-6,0,0));
	model_transform = mult(model_transform,scale(1,19,2));
	this.m_cube.draw(this.graphicsState, model_transform,dark_pink);
		model_transform = stack.pop();
		stack.push(model_transform);
	model_transform = mult(model_transform, translation(6,0,0));
	model_transform = mult(model_transform,scale(1,19,2));
	this.m_cube.draw(this.graphicsState, model_transform,dark_pink);
		model_transform = stack.pop();

	//door
	if(door_open == 0){
		model_transform = mult(model_transform, translation(0,.3,0));
		model_transform = mult(model_transform,scale(11,18.3,2));
		this.m_cube.draw(this.graphicsState, model_transform,light_pink);
	}

	if(door_open == 1){
			stack.push(model_transform);
		model_transform = mult(model_transform, translation(0,.3,0));
		model_transform = mult(model_transform,scale(11,18.3,1));
		this.m_cube.draw(this.graphicsState, model_transform,stars);
			model_transform = stack.pop();

		var door_angle = -100+ 7* (this.graphicsState.animation_time)/400;
		model_transform = mult(model_transform, translation(0,.3,0));
		model_transform = mult(model_transform, translation(-5,0,0));
		model_transform = mult(model_transform, rotation(-door_angle, 0,1,0));
		model_transform = mult(model_transform, translation(5,0,0));
		model_transform = mult(model_transform,scale(11,18.3,2));
		this.m_cube.draw(this.graphicsState, model_transform, light_pink);

	}

	if(door_open == 2){
			stack.push(model_transform);
		model_transform = mult(model_transform, translation(0,.3,0));
		model_transform = mult(model_transform,scale(11,18.3,1));
		this.m_cube.draw(this.graphicsState, model_transform,stars);
			model_transform = stack.pop();

		model_transform = mult(model_transform, translation(0,.3,0));
		model_transform = mult(model_transform, translation(-5,0,0));
		model_transform = mult(model_transform, rotation(-120, 0,1,0));
		model_transform = mult(model_transform, translation(5,0,0));
		model_transform = mult(model_transform,scale(11,18.3,2));
		this.m_cube.draw(this.graphicsState, model_transform, light_pink);

	}

	//knob
	model_transform = mult(model_transform,scale(1/11,1/18.3,1/2));
	model_transform = mult(model_transform, translation(4,0,1));
	model_transform = mult(model_transform,scale(.7,.7,.7));
	this.m_sphere.draw(this.graphicsState, model_transform, metalSilver);

	return model_transform;
}

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
	//	delta +=  this.animation_delta_time;

		update_camera( this, this.animation_delta_time );

		this.basis_id = 0;

		var model_transform = mat4();

		// Materials: Declare new ones as needed in every function.
		// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.


		/**********************************
		Start coding here!!!!
		**********************************/
		var stack = []; stack.push(this.graphicsState.camera_transform);

		//scene1
		if(this.graphicsState.animation_time  < 22000){
		this.draw_wall(model_transform,wall);
		this.draw_floor(model_transform,floor,floor.floor_mat);

		model_transform = mult(model_transform,translation(0,-6,3));
		var rope_move = fence.rope_max_angle*Math.sin((this.graphicsState.animation_time/20)*Math.PI/180);
		this.draw_fence(model_transform,fence, rope_move);

		this.draw_picture(model_transform, picture,0);

		this.draw_sign(model_transform, sign);

		model_transform = mult(model_transform, translation(0,5,0));


		//lookat sign
		if(this.graphicsState.animation_time < 4000) {
			var eye_x =  -1-this.graphicsState.animation_time/800;
			var eye_z = 2+ this.graphicsState.animation_time/700 *4;

			var at = vec3(-50,0,15);
			var eye = vec3(eye_x, 0, eye_z);
			var up = vec3(0, 1,0);
			this.graphicsState.camera_transform = lookAt(eye, at, up);
		}

		//lookat painting
		if(this.graphicsState.animation_time  > 4000 && this.graphicsState.animation_time < 8000){
			var eye_z = 4+this.graphicsState.animation_time/700 *1.4;

			var at = vec3(0,2,2);
			var eye = vec3(0, 0, eye_z);
			var up = vec3(0, 1,0);
			this.graphicsState.camera_transform = lookAt(eye, at, up);
		}


		//dora walks to the picture
		if(  this.graphicsState.animation_time > 8000 && this.graphicsState.animation_time < 12000){
			model_transform = mult(model_transform, translation(0,1,0));
			model_transform = mult(model_transform,rotation(180,0,1,0));
			var walk = this.graphicsState.animation_time/500;
			model_transform = mult(model_transform,translation(0,0,walk));
			this.draw_dora(model_transform, doraemon,0);
		}


		if( this.graphicsState.animation_time > 12000 && this.graphicsState.animation_time< 16000){
			model_transform = mult(model_transform, translation(0,1,-10));
			model_transform = mult(model_transform,rotation(180,0,1,0));
			this.draw_dora(model_transform,doraemon,0);

			var eye_z = -10-this.graphicsState.animation_time/700 *1.4;

			var at = vec3(6,2,10);
			var eye = vec3(6, 6, eye_z);
			var up = vec3(0, 1,0);
			this.graphicsState.camera_transform = lookAt(eye, at, up);
		}

		//dora's face
		if( this.graphicsState.animation_time > 16000 && this.graphicsState.animation_time< 22000){
			model_transform = mult(model_transform, translation(0,1,-10));
			model_transform = mult(model_transform,rotation(180,0,1,0));

			//smile
			if( this.graphicsState.animation_time > 16000 && this.graphicsState.animation_time< 20000){
				this.draw_dora(model_transform,doraemon,1);
			}

		//lightbulb
			if( this.graphicsState.animation_time > 20000 && this.graphicsState.animation_time< 22000){
				this.draw_dora(model_transform,doraemon,2);
				model_transform = mult(model_transform,translation(-6,3,0));
				model_transform = mult(model_transform,rotation(35,0,0,1));
				this.draw_lightbulb(model_transform);
			}

			var at = vec3(0,0,-10);
			var eye = vec3(0, 0, -20);
			var up = vec3(0, 1,0);
			this.graphicsState.camera_transform = lookAt(eye, at, up);
			}


		} //draw museum for the first 22 seconds


		//scene2
		if(this.graphicsState.animation_time > 23000 && this.graphicsState.animation_time < 41000 ){
			this.graphicsState.camera_transform = stack.pop();
			gl.clearColor(135/255,181/255,225/255,1);
			this.draw_grass(model_transform,floor);


			if(this.graphicsState.animation_time > 23000 && this.graphicsState.animation_time < 27000) {
				model_transform = mult(model_transform,translation(-5,0,0));
				model_transform = mult(model_transform, rotation(90,0,1,0));
				this.draw_door(model_transform,door,0);
				model_transform = mult(model_transform, rotation(-90,0,1,0));

				if(this.graphicsState.animation_time< 25000){

					model_transform = mult(model_transform,translation(25,0,0));
					this.draw_dora(model_transform,doraemon,2);

					var at = vec3(0,0,0);
					var eye = vec3(10, 0, 50);
					var up = vec3(0, 1,0);
					this.graphicsState.camera_transform = lookAt(eye, at, up);
				}

				//doraemon rotate
				if(this.graphicsState.animation_time >25000 && this.graphicsState.animation_time < 26000){
					model_transform = mult(model_transform,translation(25,0,0));
					model_transform = mult(model_transform, rotation(90-this.graphicsState.animation_time/11,0,1,0));
					this.draw_dora(model_transform,doraemon,2);
				}

				//camera rotate
				if(this.graphicsState.animation_time >26000 && this.graphicsState.animation_time < 27000){
					model_transform = mult(model_transform,translation(25,0,0));

					model_transform = mult(model_transform, rotation(-80,0,1,0));
					this.draw_dora(model_transform,doraemon,2);


					var eye_x =  50-10*Math.cos(this.graphicsState.animation_time/1000);
					var eye_z = 30+Math.sin(this.graphicsState.animation_time/1000);

					var at = vec3(-80,0,-20);
					var eye = vec3(eye_x, 0, eye_z);
					var up = vec3(0, 1,0);
					this.graphicsState.camera_transform = lookAt(eye, at, up);
				}
			}

			//door open
			if(this.graphicsState.animation_time>27000 && this.graphicsState.animation_time < 33000){
				model_transform = mult(model_transform,translation(-5,0,0));
				model_transform = mult(model_transform, rotation(90,0,1,0));
				this.draw_door(model_transform,door,1);
				model_transform = mult(model_transform, rotation(-90,0,1,0));

				model_transform = mult(model_transform,translation(25,0,0));
				model_transform = mult(model_transform, rotation(-90,0,1,0));
				this.draw_dora(model_transform,doraemon,2);
			}

			//Doraemon enters the door
			if(this.graphicsState.animation_time>33000 && this.graphicsState.animation_time < 41000){
				model_transform = mult(model_transform,translation(-5,0,0));
				model_transform = mult(model_transform, rotation(90,0,1,0));
				this.draw_door(model_transform,door,2);
				model_transform = mult(model_transform, rotation(-90,0,1,0));

				model_transform = mult(model_transform,translation(25,0,0));
				model_transform = mult(model_transform, rotation(-90,0,1,0));
				var enter = -82.5+this.graphicsState.animation_time/400;
				model_transform = mult(model_transform,translation(0,0,enter));
				this.draw_dora(model_transform,doraemon,2);
			}


		}

		if(this.graphicsState.animation_time > 41000 && this.graphicsState.animation_time<42000){
			gl.clearColor( 0, 0, 0, 1 );
		}

		//scene3
		if(this.graphicsState.animation_time > 42000 && this.graphicsState.animation_time<47000){
			var at = vec3(0,0,0);
			var eye = vec3(0, 0, 60);
			var up = vec3(0, 1,0);
			this.graphicsState.camera_transform = lookAt(eye, at, up);

				stack.push(model_transform);
			model_transform = mult(model_transform,translation(0,0,0));
			model_transform = mult(model_transform,scale(140,140,140));
			model_transform = mult(model_transform,rotation((this.graphicsState.animation_time/40),0,0,1));
			this.m_cube.draw(this.graphicsState,model_transform,stars);
				model_transform = stack.pop();

			model_transform = mult(model_transform, rotation(20,1,0,0));
			this.draw_dora(model_transform, doraemon,2);
		}

		//scene 4
		if(this.graphicsState.animation_time > 48000 && this.graphicsState.animation_time< 60000){
			model_transform = mult(model_transform, translation(0,0,50));
			this.draw_wall(model_transform,wall);
			this.draw_floor(model_transform,floor,floor.floor_mat);

			model_transform = mult(model_transform,translation(0,-6,3));
			var rope_move = fence.rope_max_angle*Math.sin((this.graphicsState.animation_time/20)*Math.PI/180);
			this.draw_fence(model_transform,fence, rope_move);

			this.draw_picture(model_transform, picture,1);

			this.draw_sign(model_transform, sign);

			model_transform = mult(model_transform,translation(-11,-2,-8));
			for(var i = 1; i<9; i++){
				var color = i % 4;
				this.draw_human(model_transform,color);
				model_transform = mult(model_transform,translation(3,0,0));
			}

			model_transform = mult(model_transform, translation(0,5,0));

			var eye_z = -60+this.graphicsState.animation_time/700 *1.7;

			var at = vec3(0,-3,0);
			var eye = vec3(0, 0, eye_z);
			var up = vec3(0, 1,0);
			this.graphicsState.camera_transform = lookAt(eye, at, up);

		}
}

Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
	//debug_screen_strings.string_map["basis"] = "Showing basis: " + this.m_axis.basis_selection;
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	//debug_screen_strings.string_map["thrust"] = "Thrust: " + thrust;
	debug_screen_strings.string_map["frame"] = "FPS: " + Math.round(1/(this.animation_delta_time/1000), 1) + " fps";

}

function Wall(){
	this.wall_x = 200;
	this.wall_y = 100;
	this.wall_z = 100;
	this.wall_mat = whiteWall;
}

function Floor(){
	this.floor_pos = -60;
	this.floor_x = 200;
	this.floor_y = 100;
	this.floor_z = 100;
	this.floor_mat = blueCarpet;
	this.grass_x = 2000;
	this.grass_z = 1000;
}

function Fence(){
	this.bar_x = 1;
	this.bar_y = 4;
	this.bar_z = 1;
	this.separation = 7;
	this.bar_mat = gold;

	this.rope_max_angle = 1.3;
	this.rope_length = 13;
	this.num_rope_seg = 43;
	this.rope_seg_x = .5;
	this.rope_seg_y = .5;
	this.rope_seg_z = .3;
	this.rope_mat = orchid;
}

function Picture(){
	this.pic_z = -49.5;
	this.pic_y = 20;

	this.frame_x = 30;
	this.frame_y = 18;
	this.frame_z = 1;
	this.frame_mat = dragonGold;

	this.art_x = 26;
	this.art_y = 14;
	this.art_z = 1.2;
	this.art_mat = egypt_photo;
}

function Sign(){
	this.sign_pos_x = -30, -3, 15;
	this.sign_pos_z = 15;
	this.sign_mat = metalSilver;

	this.plate_x = .7;
	this.plate_y = 3.5;
	this.plate_z = 7;

	this.stick_x = .5;
	this.stick_y = 8;
	this.stick_z = .5


}

function Doraemon(){
	this.head_mat = doraemonBlue;
	this.face_mat = white;

	this.head_x = 4;
	this.head_y = 4;
	this.head_z = 4;

	this.face_x = 3.5;
	this.face_y = 3;
	this.face_z = 4;

	this.eye_x = 1;
	this.eye_y = 1.5;
	this.eye_z = 1;
	this.eye_mat = whiteWall;

	this.pupil_x = .2;
	this.pupil_y = .3;
	this.pupil_z = .2;
	this.pupil_mat = black;

	this.nose_x = .5;
	this.nose_y = .5;
	this.nose_z = .5;
	this.nose_mat = red;

	this.mouth_open_x = 2.3;
	this.mouth_open_y = 2.3;
	this.mouth_open_z = 1.5;

}

function Door(){}
