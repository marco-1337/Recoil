import Platform from '../objects/platform.js';
import Player from '../objects/player.js';

export default class LevelScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LevelScene' });
    }

    preload() {

    }

    create() {

		this.levelMap = this.make.tilemap({
			key: 'level_1',
			tileWidth: 50, 
  			tileHeight: 50
		});
        
        const tilesetTerrain = this.levelMap.addTilesetImage('terrain_tileset', 'terrain_tileset');
        const terrainLayer = this.levelMap.createLayer('ground', tilesetTerrain);
        terrainLayer.setCollisionBetween(0, 999);

        /* Debug de tiles

        const debugGraphics = this.add.graphics().setAlpha(0.75);

        this.terrainLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });
        */


        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.centerY, 0.3, 0.7);
        //new Platform(this, player, this.cameras.main.centerX, this.cameras.main.centerY + 455, 60, 5);
        this.physics.world.addCollider(this.player, terrainLayer);

        const camera = this.cameras.main;
        camera.startFollow(this.player, true, 1, 0.5, 0., 50);
        camera.setDeadzone(250, 350);
        // Falta las bounds, esto debería hacerse según 
        //camera.setBounds(0, 0, 2000, 2000);

    }

    update() {

    }
}