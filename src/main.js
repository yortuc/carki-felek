import Cark from './js/Cark_pixi';
import Resources from './js/resources';

Resources.loadImagesFromArray(["peg.png", "button.png"], function(){
	
	var cark = new Cark({ 
		turnOnce: false,
	    buttonSprite: Resources.images["button.png"],

		slices: [
			{ text: "MARMARIS", bgColor: 0x43768b, icon: 'otel1.png', description: "Güzel Otel 7/24 Konaklama Herşey Dahil Sizi Bekliyor" }, 
			{ text: "FETHİYE", 	bgColor: 0x797b7b, icon: 'otel2.png', description: "FETHİYE Oteli Açıklama" }, 
			{ text: "KEMER", 	bgColor: 0x33669a, icon: 'otel3.png', description: "KEMER Oteli Açıklama" },
			{ text: "ALANYA", 	bgColor: 0xc6a860, icon: 'otel4.png', description: "ALANYA Oteli Açıklama" },
			{ text: "BELEK", 	bgColor: 0xde5b61, icon: 'otel1.png', description: "BELEK Oteli Açıklama" }, 
			{ text: "KEMER", 	bgColor: 0x335c40, icon: 'otel2.png', description: "KEMER Oteli Açıklama" },
			{ text: "KUŞADASI", bgColor: 0xc95309, icon: 'otel3.png', description: "KUŞADASI Oteli Açıklama" },
			{ text: "SİDE", 	bgColor: 0xfba608, icon: 'otel4.png', description: "SİDE Oteli Açıklama" },
			{ text: "ALANYA", 	bgColor: 0xfcf1cd, icon: 'otel1.png', description: "ALANYA Oteli Açıklama" },
			{ text: "BODRUM", 	bgColor: 0x43768b, icon: 'otel2.png', description: "BODRUM Oteli Açıklama" },
			{ text: "KEMER", 	bgColor: 0xc6a860, icon: 'otel3.png', description: "KEMER Oteli Açıklama" },
			{ text: "ÇEŞME", 	bgColor: 0xde5b61, icon: 'otel4.png', description: "ÇEŞME Oteli Açıklama" }
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