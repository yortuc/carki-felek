import Cark from './js/Cark_pixi';
import Resources from './js/resources';

Resources.loadImagesFromArray(["peg.png", "button.png"], function(){
	
	var cark = new Cark({ 
		turnOnce: false,
	    buttonSprite: Resources.images["button.png"],

		slices: [
			{ text: "Marmaris", bgColor: 0xff0000 }, 
			{ text: "Fethiye", 	bgColor: 0x00FF00 }, 
			{ text: "Kemer", 	bgColor: 0x0000FF },
			{ text: "Alanya", 	bgColor: 0xAAAA00 },
			{ text: "Belek", 	bgColor: 0xAA00AA }, 
			{ text: "Kemer 2", 	bgColor: 0x00AA00 },
			{ text: "Kuşadası", bgColor: 0xffAACC },
			{ text: "Side", 	bgColor: 0xffBBAA },
			{ text: "Alanya 2", bgColor: 0xAABBCC },
			{ text: "Bodrum", 	bgColor: 0xDDAACC },
			{ text: "Kemer 3", 	bgColor: 0xff00CC },
			{ text: "Çeşme", 	bgColor: 0xCC00AA }
	    ],
	    
		onDragFinished: function(e){
			console.log("onDragFinished", e);
		},

		onWin: function(e){
			console.log("onWin", e);
		}
	});
	
	window.cark = cark;

	cark.update();
});