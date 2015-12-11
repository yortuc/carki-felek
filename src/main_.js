import drawSegment from './js/utils';

var requestAnimationFrame =  window.requestAnimationFrame ||
					         window.webkitRequestAnimationFrame ||
					         window.mozRequestAnimationFrame    ||
					         function( callback ){
					         	window.setTimeout(callback, 1000 / 60);
					         };


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var lastUpdate = Date.now();



var state = {
	slices: [
		{color: "red", 		text: "Kırmızı dilim"},
		{color: "green",	text: "Yeşil dilim"},
		{color: "blue", 	text: "Mavi dilim"},
		{color: "magenta", 	text: "Magenta dilim"},
		{color: "orange", 	text: "Orange dilim"},
		{color: "lime",	 	text: "Lime dilim"},
		{color: "yellow", 	text: "Yellow dilim"}
	],
	mouse: {
		downPos: null,
		downTime: null,
		upPos: null,
		upTime: null,
		isDown: false,
		isMoving: false,
		velocity: 0
	},
	isTurning: false,
	theta: 0,			//rad
	omega: 0,
	maxOmega: Math.PI/6
}

function update(){

	var dt = Date.now() - lastUpdate;
	
	ctx.save();
	state.theta += state.omega * dt / 1000;
	ctx.translate(400,400);
	ctx.rotate(state.theta);

	for(var i=0; i<state.slices.length; i++){
		drawSegment(i, state.slices[i], state, ctx);
	}

	ctx.restore();

	requestAnimationFrame(update);
}

update();

function turn(velocity){
	state.omega = velocity.x * Math.PI / 120;
}

function handleMouseEvent(e, event){

	console.log(event, e);

	

	if(event === "mouseup") {

		var dx = state.mouse.upPos.x - state.mouse.downPos.x;
		var dy = state.mouse.upPos.y - state.mouse.downPos.y;
		var dt = state.mouse.upTime - state.mouse.downTime;

		var vx = dx / dt;
		var vy = dy / dt;

		state.mouse.velocity = {x: vx, y:vy};

		turn(state.mouse.velocity);

	}

	if(event === "mousemove") {

		if(state.mouse.isDown) {
			var dx = state.mouse.position.x - state.mouse.downPos.x;
			var dy = state.mouse.position.y - state.mouse.downPos.y;

			if(dx > 0 && dy >0 ) {
				var deltaTheta = Math.atan2(dy/dx);
				state.theta += deltaTheta;
			}
			
		}
	}

}

/*
canvas.onmousedown = function(e){
	console.log(e);
	
	let rect = canvas.getBoundingClientRect();
	var x1 = e.clientX - rect.left;
	var y1 = e.clientY - rect.top;  

	state.mouse.downPos = {x: x1, y:y1};
	state.mouse.downTime = Date.now();

	state.mouse.isDown = true;

	handleMouseEvent(e, "mousedown");
}.bind(this);

canvas.onmousemove = function(e){
	state.mouse.isMoving = true;
	let rect = canvas.getBoundingClientRect();
	var x1 = e.clientX - rect.left;
	var y1 = e.clientY - rect.top; 

	state.mouse.position = {x: x1, y:y1};

	handleMouseEvent(e, "mousemove");
}

canvas.onmouseup = function(e){
	state.mouse.isDown = false;
	state.mouse.isMoving = false;

	let rect = canvas.getBoundingClientRect();
	var x1 = e.clientX - rect.left;
	var y1 = e.clientY - rect.top;  
	state.mouse.upPos = {x: x1, y:y1}
	state.mouse.upTime = Date.now();

	handleMouseEvent(e, "mouseup");
}.bind(this);
*/

window.onmousedown = function(e) {

	//console.log("window: ", e.clientX, e.clientY);

}

canvas.onmousedown = function(e) {

	var rect = canvas.getBoundingClientRect();

	var localX = e.clientX - rect.left;
	var localY = e.clientY - rect.top;


	console.log("canvas", e.clientX, e.clientY, localX, localY);

}

function point(x,y){
	ctx.fillStyle = b.color;
	ctx.beginPath();
	ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
	ctx.fill();
}

canvas.onmouseover = function(e){
	console.log(e);
}






