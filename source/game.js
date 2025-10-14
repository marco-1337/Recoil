import TestScene from './scenes/testScene.js';

let config = {
	type: Phaser.CANVAS,
	parent: "game",
	width: 800,
	height: 450,
	pixelArt: true,
	scene: [TestScene],
	
	physics: {  
		default: 'arcade',
		audio: {
  			disableWebAudio: false
		}, 
		arcade: {
			gravity: { y: 500 },
			debug: false
		}
	}
};

const game = new Phaser.Game(config);