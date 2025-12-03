import Player, {PLAYER_STATES} from '../objects/player.js';
import Spikes from '../objects/spikes.js'

export default class LevelScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LevelScene' });

        this.levelsList = [];

        for (let i = 0; i < 10; i++) {
            this.levelsList.push('level_' + (i+1));
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
        // esto hay que ponerlo en cada escena, no vale con ponerlo en solo la de carga
		this.physics.world.TILE_BIAS = 50;
        this.cameras.main.setDeadzone(150, 250);
        this.initLevel();
    }

    update() {}

    clearCurrentLevel() {
        this.terrainCollider.destroy();
        this.levelMap.layers.forEach(l => l.tilemapLayer.destroy());
        //this.flag.destroy(true);
        this.player.destroy(true);
        this.spikes.clear(true, true);
        this.levelMap.destroy();
        this.heightDeathbox.destroy();
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

            // Lectura de datos del nivel
            const dataObjects = this.levelMap.getObjectLayer('data').objects;
            let plX = 0, plY = 0;
            let yLimit = this.levelMap.heightInPixels;
            dataObjects.forEach(obj => {
                if (obj.name === 'spawn') {
                    plX = obj.x + obj.width/2;
                    plY = obj.y - obj.height/2;
                }
                else if (obj.name === 'limit') {
                    yLimit = obj.y - obj.height/2;
                }
            });

            // jugador
            this.player = new Player(this, plX, plY, 0.3, 0.7);
            this.cameras.main.startFollow(this.player, true, 1, 0.5, 0.6, 50);

            // suelo
            this.levelLimit = this.physics.add.staticBody(0, yLimit, this.levelMap.widthInPixels, 50);
            this.levelLimitCollider = this.physics.add.overlap(this.player, this.levelLimit, 
                () => { this.player.changeState(PLAYER_STATES.DEAD); }, null, this);

            // Creación de terreno
            const tilesetTerrain = this.levelMap.addTilesetImage('terrain_tileset', 'terrain_tileset');
            const terrainLayer = this.levelMap.createLayer('ground', tilesetTerrain);
            terrainLayer.setCollisionBetween(0, 999);
            this.terrainCollider = this.physics.add.collider(this.player, terrainLayer);

            // Pinchos
            this.spikes = this.physics.add.staticGroup({classType: Spikes});
            const spikeObjects = this.levelMap.getObjectLayer('spikes').objects;

            spikeObjects.forEach(obj => {
                // tambien se puede usar this.spikes.add(objeto) y añade el objeto, o addMultiple
                this.spikes.create(obj.x + obj.width/2, obj.y - obj.height/2);
            });
            
            this.physics.add.collider(this.player, this.spikes, 
                () => { this.player.changeState(PLAYER_STATES.DEAD); }, null, this);

            // Limites de la cámara y mundo
            this.physics.world.setBounds(0, 0, this.levelMap.widthInPixels, this.levelMap.heightInPixels);
            this.cameras.main.setBounds(-this.levelMap.tileWidth * 4, -this.levelMap.tileHeight * 2, 
                this.levelMap.widthInPixels + this.levelMap.tileWidth * 8, 
                this.levelMap.heightInPixels + this.levelMap.tileHeight * 4);
        }
        else {
            throw new Error("El ID de nivel actual no es válido");
        }
    }

    resetLevel() {
        //this.player.restartIn
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