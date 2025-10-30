import LoadScene from './scenes/loadScene.js';
import LevelScene from './scenes/levelScene.js';

let config = {
	type: Phaser.CANVAS,
	parent: "game",
	width: 800,
	height: 450,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	pixelArt: true,
	scene: [LoadScene, LevelScene],
	
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