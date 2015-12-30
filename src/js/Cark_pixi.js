import Resouces from "./resources";
import Audio from "./Audio";

function Cark (data){
  data = data || {};

  this.slices = data.slices;
  this.buttonSprite = data.buttonSprite;

  this.onDragFinished = data.onDragFinished;
  this.onWin = data.onWin;
  this.friction = data.friction || 0.018;
  this.dumping = data.dumping || 0.00008;

  this.init();
}

Cark.prototype.init = function(){
  this.buttonHover = false;
  this.isTurning = false;
  this.turningDirection = 0;
  this.theta = 0;
  this.omega = 0;

  // init 2d drawing context
  this.canvas = document.getElementById('canvas');
  //this.ctx = this.canvas.getContext("2d");
  this.rect = this.canvas.getBoundingClientRect();
  this.radius =  this.rect.width/2;

  this.radPerSlice = 2*Math.PI/this.slices.length;  // radians per slice
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

    if(this.buttonHover) this.cevir();

  }.bind(this);

  this.canvas.onmouseup = function(e){
    if(this.isTurning) return;

    this.t2 = Date.now();
    this.p2 = this.toLocalCoords(e.clientX, e.clientY);

    if(this.isDown && this.onDragFinished && !this.isTurning) {
      this.turnCark(this.p2, this.p1, this.t2, this.t1)
    }

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

      var _theta = (this.theta+Math.PI/2+this.radPerSlice/2) % (2*Math.PI);
      var winIndex = Math.floor( 12 * _theta/(2*Math.PI) );

      console.log( this.theta, _theta, winIndex, this.slices[ (12-winIndex) % 12] );
    }

    this.prevP = p;
    this.prevTime = Date.now();

    var mag = Math.sqrt(this.p.x*this.p.x + this.p.y*this.p.y);
    if( mag < this.buttonSprite.width/4 ){
        e.target.style.cursor = 'hand';
        this.buttonHover = true;
    }
    else{
      e.target.style.cursor = 'default';
      this.buttonHover = false;
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

  this.initRenderer();
}

Cark.prototype.initRenderer = function(){

  this.stage = new PIXI.Container();

  // cark
  this.stageCark = new PIXI.Container();
  this.stageCark.pivot.set(this.centerPoint.x, this.centerPoint.y);
  this.stageCark.position.set(this.centerPoint.x, this.centerPoint.y);

  this.renderer = PIXI.autoDetectRenderer(
    this.rect.width,
    this.rect.height,
    {view:this.canvas, transparent: true, antialias: true}
  );

  this.analyseText();

  // create slices
  for(var i=0; i<this.slices.length; i++){
    var gSlice = new PIXI.Graphics();
    gSlice.beginFill( this.slices[i].bgColor );
    gSlice.lineStyle(2, 0xffffff, 1);

    var startingAngle = i * this.radPerSlice - this.radPerSlice/2;
    var endingAngle = startingAngle + this.radPerSlice;

    gSlice.moveTo(this.centerPoint.x, this.centerPoint.y);
    gSlice.arc(300,300, this.radius, startingAngle, endingAngle);
    gSlice.lineTo(300, 300);

    gSlice.endFill();

    this.stageCark.addChild(gSlice);

    this.createSliceText(i, this.stageCark);
    this.placeSliceIcon(i, this.stageCark);
  };
  this.stage.addChild(this.stageCark);

  // dil
  var dilTexture = PIXI.Texture.fromImage('images/peg.png');
  this.dil = new PIXI.Sprite(dilTexture);
  this.dil.anchor.set(0.5, 0.2);
  this.dil.position.set(300, 15);
  this.stage.addChild(this.dil);

  // turn button
  this.btnPasifTexture = PIXI.Texture.fromImage('images/button_pasif.png');
  this.btnAktifTexture = PIXI.Texture.fromImage('images/button_aktif.png');
  this.button = new PIXI.Sprite(this.btnPasifTexture);
  this.button.interactive = true;
  this.button.buttonMode = true;
  this.button.anchor.set(0.5, 0.5);
  this.button.position.set(300,300);
  this.button.on("mouseover", function(){ this.button.texture = this.btnAktifTexture }.bind(this));
  this.button.on("mouseout", function(){ this.button.texture = this.btnPasifTexture }.bind(this));
  this.stage.addChild(this.button);

  // pop-over for description text
  this.createPopOvers();  
}

Cark.prototype.analyseText = function() {

  var _maxTextLen = 0;

  for(var i=0; i<this.slices.length; i++){
    var sliceLen = this.slices[i].text.length;
    if( sliceLen > _maxTextLen) {
      _maxTextLen = sliceLen;
    }
  }

  this.maxTextLen = _maxTextLen;
  this.radsPerLetter = this.radPerSlice/(_maxTextLen+2);
}

Cark.prototype.createPopOvers = function(){
  var style = {
      font : 'bold italic 36px Arial',
      align: 'center',
      fill : '#F7EDCA',
      stroke : '#4a1850',
      strokeThickness : 5,
      dropShadow : true,
      dropShadowColor : '#000000',
      dropShadowAngle : Math.PI / 6,
      dropShadowDistance : 6,
      wordWrap : true,
      wordWrapWidth : 440
  };

  this.popOvers = [];

  for(var i=0; i<this.slices.length; i++){
    var pop = new PIXI.Text(this.slices[i].description, style);
    pop.anchor.set(0.5, 0.5);
    pop.position.set(this.centerPoint.x, this.centerPoint.y);
    pop.visible = false;
    this.stage.addChild(pop);
    this.popOvers.push(pop);
  }
}

Cark.prototype.createSliceText = function(i, container){

  var radEmptySpace = (this.radPerSlice - this.radsPerLetter * this.slices[i].text.length) / 2;

  var rotStart = i * this.radPerSlice - this.radPerSlice/2 + radEmptySpace + this.radsPerLetter/2;

  var text = this.slices[i].text;

  var style = {
      font : '20px Courier',
      fill : '#fff'
  };

  for(var j=0;j<text.length;j++){
    var rot = rotStart + (j * this.radsPerLetter);
    var txt = new PIXI.Text(text[j], style);
    txt.x = 300 + 0.95 * this.radius * Math.cos( rot );
    txt.y = 300 + 0.95 * this.radius * Math.sin( rot );
    txt.anchor.set(0.5, 0.5);
    txt.rotation = rot + Math.PI/2;
    container.addChild(txt);
  }
}

Cark.prototype.placeSliceIcon = function(i, container){
  var rot = i * this.radPerSlice;

  var iconTexture = PIXI.Texture.fromImage('images/' + this.slices[i].icon);
  var icon = new PIXI.Sprite(iconTexture);
  icon.anchor.set(0.5, 0.5);
  icon.scale.set(0.3, 0.3);
  icon.rotation = rot + Math.PI/2;

  icon.position.x = 300 + this.radius * 0.7 * Math.cos( rot );
  icon.position.y = 300 + this.radius * 0.7 * Math.sin( rot );

  icon.interactive = true;
  icon.tint = 0xededed;

  icon.on('mouseover', function(){
    if(this.isTurning) return;
    this.popOvers[i].visible = true;
    icon.tint = 0xffffff;
  }.bind(this));

  icon.on('mouseout', function(){
    this.popOvers[i].visible = false;
    icon.tint = 0xededed;
  }.bind(this));

  container.addChild(icon);
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


    console.log(xProj, yProj);


    this.isTurning = true;
    this.omega = (xProj + yProj) * ( Math.PI/120 / 2 );

    this.onDragFinished({ omega: this.omega * 180/Math.PI });
    this.audio.play();

    this.isDown = false;

    // aktif dilim resetle
    this.slices.map(function(s) { s.active = false; });
}

function roundZero(val, delta){
  return Math.abs(val) < delta ? 0 : val;
}

Cark.prototype.update = function() {

  var won = false;
  var dt = Date.now() - this.lastUpdate;
  
  // update phsyics
  this.theta += this.omega * dt;

  this.theta = roundZero(this.theta, 0.001);
  this.omega = roundZero(this.omega * (1-this.friction), this.dumping );

  if(this.isTurning && this.omega === 0) {
    this.audio.stop();
    this.isTurning = false;
    this.turningDirection = 0;
    
    var _theta = (this.theta+Math.PI/2+this.radPerSlice/2) % (2*Math.PI);
    var winIndex = Math.floor( 12 * _theta/(2*Math.PI) );

    console.log( this.theta, _theta, winIndex, this.slices[ (12-winIndex) % 12] );

    //if(this.onWin) this.onWin(winIndex);
    won = false;

  }
  else{
    this.audio.setRate(1-this.friction);
  }

  this.stageCark.rotation = this.theta;

  this.updateDil();

  this.lastUpdate = Date.now();

  this.renderer.render(this.stage);

  requestAnimationFrame( this.update.bind(this) );
}

Cark.prototype.updateDil = function(){
  var rot = Math.abs(Math.sin(this.theta*8)) * Math.PI/4;
  this.dil.rotation = -1 * this.turningDirection * rot;
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

  // aktif dilim resetle
  this.slices.map(function(s) { s.active = false; });

  this.isTurning = true;

  var turnVel = 1.2 + Math.random();
  this.turningDirection = 1;
  this.omega = turnVel * ( Math.PI/120 / 2 );
  this.audio.play();

  console.log(this.omega);

  this.isDown = false;
}

var requestAnimationFrame = window.requestAnimationFrame ||
                             window.webkitRequestAnimationFrame ||
                             window.mozRequestAnimationFrame    ||
                             function( callback ){
                              window.setTimeout(callback, 1000 / 60);
                             };

export default Cark;