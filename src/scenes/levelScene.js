import Player from '../objects/player.js';

export default class LevelScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LevelScene' });

        this.levelsList = [];

        for (let i = 0; i < 10; i++) {
            this.levelsList.push('level_' + (i+1));
            console.log('level_' + (i+1));
        }
    }

    init(data) {
        if (data.levelID > 10 || data.levelID < 1) {
            this.currentLevelID = 0;
        }
        else {
            this.currentLevelID = data.levelID - 1;
        }
    }

    preload() {

    }

    create() {

        this.cameras.main.setDeadzone(150, 250);
        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.centerY, 0.3, 0.7);
        //new Platform(this, player, this.cameras.main.centerX, this.cameras.main.centerY + 455, 60, 5);
 
        this.initLevel();
    }

    update() {}

    clearCurrentLevel() {
        this.terrainCollider.destroy();
        this.levelMap.layers.forEach(l => l.tilemapLayer.destroy());
        this.levelMap.destroy();
    }

    /** 
    * Crea el nivel según a lo que apunta currentLevelID,
    * si el ID no es válido se lanza un error
    */
    initLevel() {

        if (this.currentLevelID < this.levelsList.length) {
            this.levelMap = this.make.tilemap({
                key: this.levelsList[this.currentLevelID],
                tileWidth: 50, 
                tileHeight: 50
            });
        
            const tilesetTerrain = this.levelMap.addTilesetImage('terrain_tileset', 'terrain_tileset');
            const terrainLayer = this.levelMap.createLayer('ground', tilesetTerrain);
            terrainLayer.setCollisionBetween(0, 999);

            this.physics.world.setBounds(0, 0, this.levelMap.widthInPixels, this.levelMap.heightInPixels);

            this.terrainCollider = this.physics.add.collider(this.player, terrainLayer);

            this.cameras.main.startFollow(this.player, true, 1, 0.5, 0.6, 50);
            // Falta las bounds, esto debería hacerse según 
            this.cameras.main.setBounds(-this.levelMap.tileWidth * 2, 0, 
                this.levelMap.widthInPixels + this.levelMap.tileWidth * 4, 
                this.levelMap.heightInPixels + this.levelMap.tileHeight);
        }
        else {
            throw new Error("El ID de nivel actual no es válido");
        }
    }

    advanceLevel() {
        this.clearCurrentLevel();
        if (this.currentLevelID < (this.levelsList.length - 1)) {
            this.currentLevelID++;
            this.initLevel();
        }
        else {
            this.gameEnd();
        }
    }

    gameEnd() {
        // to do
    }

}