import LoadScene from './scenes/loadScene.js';
import LevelScene from './scenes/levelScene.js';
import MenuScene from './scenes/menuScene.js';
import WinScene from './scenes/winScene.js';

let config = {
	type: Phaser.AUTO,
	width: 1600,
	height: 900,
	parent: "game-display-section",
	//backgroundColor: 0x3498db,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		expandParent: true,
		fullscreenTarget: 'game-display-section'
	},
	//pixelArt: true,
	antialias: true,
	scene: [LoadScene, MenuScene, LevelScene, WinScene],
	
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
game.sound.pauseOnBlur = false;