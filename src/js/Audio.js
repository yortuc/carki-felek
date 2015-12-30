import BufferLoader from './BufferLoader';

function Audio(){
}

Audio.prototype.init = function(){
	try {
		// Fix up for prefixing
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		this.context = new AudioContext();
	}
	catch(e) {
		console.log('Bu browser Web Audio API desteklemiyor. Ses devre dışı.');
		return;
	}

	var bufferLoader = new BufferLoader(
		this.context,
		[
		  'images/wheel.mp3', 'images/win.mp3'
		],
		this.finishedLoading.bind(this)
	);

	bufferLoader.load();
}

Audio.prototype.finishedLoading = function(bufferList) {
	console.log(bufferList);
	this.bufferList = bufferList;
}

Audio.prototype.play = function(){

	// sourceNode
	var source = this.context.createBufferSource();
	source.buffer = this.bufferList[0];

	// Create a gain node.
	this.gainNode = this.context.createGain();
	this.gainNode.gain.value = 1;

	source.connect(this.gainNode);
	this.gainNode.connect(this.context.destination);

	source.start(0);
}

Audio.prototype.setRate = function(volRate){
	this.gainNode.gain.value *= volRate;
}

Audio.prototype.stop = function(){
	this.gainNode.gain.value = 0;
}

Audio.prototype.playWin = function(){
	// sourceNode
	var source = this.context.createBufferSource();
	source.buffer = this.bufferList[1];
	source.connect(this.context.destination);
	source.start(0);
}

export default Audio;