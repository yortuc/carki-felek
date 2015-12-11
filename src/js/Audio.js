function Audio(){
	var sound = document.createElement('audio');
	sound.setAttribute("src", "images/wheel.mp3");
	sound.playbackRate = 1;

	this.sound = sound;
	this.rate = 1;
}

Audio.prototype.play = function(){
	this.sound.play();
}

Audio.prototype.stop = function(){
	this.sound.pause();
	this.sound.currentTime = 0;
	this.rate = 1;
}

Audio.prototype.setRate = function(friction){
	this.rate = this.rate * friction;
	this.sound.volume = this.rate;
}

export default Audio;