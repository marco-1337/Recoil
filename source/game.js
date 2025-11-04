import LoadScene from './scenes/loadScene.js';
import LevelScene from './scenes/levelScene.js';

let config = {
	type: Phaser.AUTO,
	parent: "game",
	width: 1920,
	height: 1080,
	//backgroundColor: 0x3498db,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	pixelArt: true,
	antialias: true,
	scene: [LoadScene, LevelScene],
	
	physics: {  
		default: 'arcade',
		audio: {
  			disableWebAudio: false
		}, 
		arcade: {
			gravity: { y: 4000 },
			debug: true // permite ver las cajas de colisión
		}
	}
};

const game = new Phaser.Game(config);