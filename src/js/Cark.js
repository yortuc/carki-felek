import Resouces from "./resources";
import Audio from "./Audio";
import drawTextAlongArc from "./Label";

function Cark (data){
  data = data || {};

  this.slices = data.slices || [{
    text: "Krmızı dilim", color:"red" }, {
    text: "Mavi dilim", color:"blue" }, {
    text: "Turuncu dilim", color: "orange" }]

  this.sprite = data.sprite;
  this.sliceWidth = data.sliceWidth;
  this.sliceHeight = data.sliceHeight;

  this.onDragging = data.onDragging;
  this.onDragFinished = data.onDragFinished;
  this.onWin = data.onWin;
  this.friction = data.friction || 0.018;
  this.dumping = data.dumping || 0.00008;
  this.init();
}

Cark.prototype.init = function(){

  this.isTurning = false;
  this.turningDirection = 0;
  this.theta = 0;
  this.omega = 0;

  // init 2d drawing context
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext("2d");
  this.rect = this.canvas.getBoundingClientRect();
  this.radius =  this.rect.width/2;

  this.degPerSlice = 360/this.slices.length;
  this.centerPoint = {x: this.rect.width/2, y: this.rect.height/2};
  this.lastUpdate = null;

  // mouse positions
  this.prevP = {x: 0, y:0};
  this.p = null;  // current mouse pos
  this.p1 = null; // mouseDown position
  this.p2 = null; // mouseUp position
  this.isDown = false;

  // zamanlar
  this.t1 = null;
  this.t2 = null;
  this.mouseVelocity = 0;

  // audio handler
  this.audio = new Audio();

  // init event listeners
  this.canvas.onmousedown = function(e){

    if(this.isTurning) return;

    this.t1 = Date.now();
    this.p1 = this.toLocalCoords(e.clientX, e.clientY);
    this.isDown = true;
  }.bind(this);

  this.canvas.onmouseup = function(e){
    if(this.isTurning) return;

    this.t2 = Date.now();
    this.p2 = this.toLocalCoords(e.clientX, e.clientY);

    if(this.isDown && this.onDragFinished && !this.isTurning) {
      this.turnCark(this.p2, this.p1, this.t2, this.t1)
    }

    console.log(this.p2);

    this.isDown = false;
    e.target.style.cursor = 'default';


  }.bind(this);

  this.canvas.onmousemove = function(e){
    if(this.isTurning) return;

    var p = this.toLocalCoords(e.clientX, e.clientY);
    this.p = p;

    // dragging the wheel
    if(this.isDown) {

      var theta1 = Math.atan2( this.p.y, this.p.x );
      var theta2 = Math.atan2( this.prevP.y, this.prevP.x);
      var dTheta = theta2 - theta1;

      this.turningDirection = Math.sign(dTheta);

      this.theta += dTheta; 

      console.log(this.theta);

      e.target.style.cursor = 'move';
    }

    this.prevP = p;
    this.prevTime = Date.now();

    var mag = Math.sqrt(this.p.x*this.p.x + this.p.y*this.p.y);
    if( mag < 30 ){
        e.target.style.cursor = 'hand';
    }
    else{
      e.target.style.cursor = 'default';
    }

  }.bind(this);

  this.canvas.onmouseout = function(e){
    if(this.isTurning) return;

    var pOut = this.toLocalCoords(e.clientX, e.clientY);

    if(!this.isTurning && this.isDown) {
      this.turnCark( pOut, this.p1, Date.now(), this.t1);
      this.isDown = false;
    }
  }.bind(this);
}


Cark.prototype.turnCark = function(p2,p1,t2,t1){
    var dx = p2.x - p1.x;   
    var dy = p2.y - p1.y;
    var dt = t2 - t1;

    this.mouseVelocity = {x: dx/dt, y: dy/dt};
    
    var magVel = Math.sqrt(this.mouseVelocity.x*this.mouseVelocity.x + 
                           this.mouseVelocity.y*this.mouseVelocity.y);

    console.log("magvel", magVel);

    if(magVel < 0.4) return;
 
    var xProj = (this.p.x > 0) ? -this.mouseVelocity.y : this.mouseVelocity.y;
    var yProj = (this.p.y > 0) ? this.mouseVelocity.x : -this.mouseVelocity.x;

    this.isTurning = true;
    this.omega = (xProj + yProj) * ( Math.PI/120 / 2 );

    this.onDragFinished({ omega: this.omega * 180/Math.PI });
    this.audio.play();

    this.isDown = false;
}

function roundZero(val, delta){
  return Math.abs(val) < delta ? 0 : val;
}

Cark.prototype.update = function() {

  var won = false;
  var dt = Date.now() - this.lastUpdate;
  
  // update phsiycs
  this.theta += this.omega * dt;

  //this.theta = roundZero(this.theta, 0.001);
  this.omega = roundZero(this.omega * (1-this.friction), this.dumping );

  if(this.isTurning && this.omega === 0) {
    this.audio.stop();
    this.isTurning = false;
    this.turningDirection = 0;
    won = true;
  }
  else{
    this.audio.setRate(1-this.friction);
  }

  // render updates
  //clear scene
  this.drawBg();

  this.ctx.save();

  this.ctx.translate(this.centerPoint.x, this.centerPoint.y);
  this.ctx.rotate(this.theta);

  //var r = this.rect.width * 0.9;
  //this.ctx.drawImage(Resouces.images["carkaktif.png"], -r/2, -r/2, r, r);


  for(var i=0; i<this.slices.length; i++){
    this.drawSegment(i);
  }

  //this.drawButton();

  this.ctx.restore();

  this.drawDil();

  if(won){
    var theta = ( this.theta + degreesToRadians(this.degPerSlice)/2 ) % (2*Math.PI);
    var winIndex = 12 - Math.ceil( theta * 12 / (2* Math.PI) ) + 1;

    var winSlice = this.slices[winIndex];

    if(this.onWin) this.onWin(winSlice);
    won = false;
  }

  this.lastUpdate = Date.now();

  requestAnimationFrame(this.update.bind(this) );
}

Cark.prototype.drawSegment = function(i) {   
   
    this.ctx.save();

    /*this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, this.radius, 
            startingAngle, endingAngle, false);
    this.ctx.closePath();

    this.ctx.fillStyle = slice.color;
    //this.ctx.fill();*/
      
    this.ctx.rotate( i * 2*Math.PI / this.slices.length );

    var destRatio = (this.radius - 35) /  this.sliceHeight ;
    var dw = this.sliceWidth * destRatio;
    var dh = this.sliceHeight * destRatio;

    //void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    this.ctx.drawImage( 
      this.sprite, 
      i*this.sliceWidth, 
      0, 
      this.sliceWidth, 
      this.sliceHeight, 
      -dw/2, 
      -dh, 
      dw, 
      dh);

    this.drawSegmenOverlay(i);
    
    this.ctx.restore();

    //this.drawSegmentLabel(i);
}

Cark.prototype.drawSegmenOverlay = function(i) {

  this.ctx.save();

  var startingAngle = degreesToRadians(this.degPerSlice* i - this.degPerSlice/2);
  var arcSize = degreesToRadians(this.degPerSlice);
  var endingAngle = startingAngle + arcSize;

  var destRatio = (this.radius - 35) /  this.sliceHeight ;
  var dw = this.sliceWidth * destRatio;
  var dh = this.sliceHeight * destRatio;

  this.ctx.globalCompositeOperation = "overlay";
  var opacityRatio = Math.abs(Math.sin(this.theta * i));

  // overlay
  this.ctx.beginPath();
  this.ctx.moveTo(0, 0);
  this.ctx.arc(0, 0, dh, -arcSize/2, arcSize/2, false);
  this.ctx.closePath();
  this.ctx.clip();

  this.ctx.beginPath();
  this.ctx.moveTo(0, 0);
  this.ctx.arc(0, 0, dh, -arcSize/2, arcSize/2, false);
  this.ctx.closePath();
  this.ctx.fillStyle = "rgba(255,255,255," + opacityRatio.toFixed(2) + ")";
  this.ctx.fill();

  this.ctx.restore();

  //this.ctx.fillStyle= "black";
  //this.ctx.fillRect(-dw/2,-dh,dw,dh);

}

Cark.prototype.drawSegmentLabel = function(i) {

  var text = this.slices[i].text;

  this.ctx.save();

  var angle = degreesToRadians(this.degPerSlice * i );

  drawTextAlongArc(this.ctx, this.slices[i].text, 0, 0, this.radius, angle);

   /*this.ctx.textBaseline = 'middle';
   this.ctx.rotate(angle);

   var dx = Math.floor(this.radius) - 10;
   var dy = Math.floor(this.radius * 0.05);

   this.ctx.textAlign = "right";
   var fontSize = Math.floor(this.rect.height / 25);
   this.ctx.font = fontSize + "pt Helvetica";

   this.ctx.fillText(text, dx, dy);
   */

   this.ctx.restore();
}

Cark.prototype.drawDil = function(){

  this.ctx.save();
  this.ctx.translate(this.rect.width/2, 20);

  var rot = Math.abs(Math.sin(this.theta*8)) * Math.PI/4;

  this.ctx.rotate(  -1 * this.turningDirection * rot);

  this.ctx.drawImage(Resouces.images["peg.png"], -20, -20, 40, 70);

  /*
  this.ctx.beginPath();
  this.ctx.fillStyle="black";
  this.ctx.moveTo(-15, -10);
  this.ctx.lineTo(15, -10);
  this.ctx.lineTo(0, 30);
  this.ctx.fill();  */

  this.ctx.restore();
}

Cark.prototype.drawBg = function(){
  var color = "white";
  
  /*if(this.isTurning) {
    var colorVal = Math.floor( Math.abs(Math.sin(this.theta*5)) * 255 );
    color = "rgb(" + colorVal + "," + colorVal + "," + colorVal + ")"; 
  }*/

  this.ctx.fillStyle = color;
  this.ctx.fillRect(0,0,this.rect.width, this.rect.height);
}

Cark.prototype.toLocalCoords = function(x,y){
  // coordiantes relative to the top-left of canvas
  var x1 = x - this.rect.left;
  var y1 = y - this.rect.top;

  // relative to the center of the wheel
  x1 = x1 - this.rect.width/2;
  y1 = this.rect.height/2 - y1;

  return {x: x1, y:y1};
}

Cark.prototype.cevir = function(){

  this.isTurning = true;

  var turnVel = Math.random() * 1.2;
  this.omega = turnVel * ( Math.PI/120 / 2 );

  this.onDragFinished({ omega: this.omega * 180/Math.PI });
  this.audio.play();

  this.isDown = false;
}

Cark.prototype.drawButton = function(){
  this.ctx.beginPath();
  this.ctx.arc(0, 0, 30, 0, 2 * Math.PI, false);
  this.ctx.fillStyle = 'green';
  this.ctx.fill();

  this.ctx.fillStyle = "white";
  this.ctx.textAlign = "center";
  var fontSize = Math.floor(this.rect.height / 40);
  this.ctx.font = fontSize + "pt Helvetica";
  this.ctx.fillText("Çevir", 0, 6);
}

function degreesToRadians(degrees) {
    return (degrees * Math.PI)/180;
}

var requestAnimationFrame = window.requestAnimationFrame ||
                             window.webkitRequestAnimationFrame ||
                             window.mozRequestAnimationFrame    ||
                             function( callback ){
                              window.setTimeout(callback, 1000 / 60);
                             };




export default Cark;