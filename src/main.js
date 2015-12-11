
import Cark from './js/Cark';
import Resources from './js/resources';



Resources.loadImagesFromArray(["carkaktif.png", "peg.png", "aktif.png", "pasif.png"], function(){
	
	var cark = new Cark({ 
		slices: [
			{ text: "Marmaris", color:"red" }, 
			{ text: "Fethiye", color:"blue" }, 
			{ text: "Kemer", color:"gray" },
			{ text: "Alanya", color:"olive" },
			{ text: "Belek", color:"#cef" }, 
			{ text: "Kemer", color:"#e3f" },
			{ text: "Kuşadası", color:"#ca6" },
			{ text: "Side", color: "orange" },
			{ text: "Alanya", color:"#ca6" },
			{ text: "Bodrum", color: "orange" },
			{ text: "Kemer", color:"#ca6" },
			{ text: "Çeşme", color: "orange" }
	    ],
	    sprite: Resources.images["pasif.png"],
	    sliceWidth: 175,
	    sliceHeight: 335,

		onDragFinished: function(e){
			console.log("onDragFinished", e);
		},

		onWin: function(e){
			console.log("onWin", e);
			//alert("Bravo kazandınız! \n" + e.text);
		}
	});
	
	window.cark = cark;

	cark.update();
});