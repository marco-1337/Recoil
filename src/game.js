import LoadScene from './scenes/loadScene.js';
import LevelScene from './scenes/levelScene.js';

let config = {
	type: Phaser.AUTO,
	parent: "game",
	width: 1600,
	height: 900,
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
			fixedStep: true,
      		fps: 120, // para no atravesar cosas, por al parecer arcade no es continuo
			debug: true // permite ver las cajas de colisión
		}
	}
};

const game = new Phaser.Game(config);