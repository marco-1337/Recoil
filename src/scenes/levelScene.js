import Flag from '../objects/flag.js';
import Platform from '../objects/platform.js';
import Player, {PLAYER_STATES} from '../objects/player.js';
import Spikes from '../objects/spikes.js'
import Munition from '../objects/munition.js'
import {addFullscreenButton} from '../utils.js';

export const LEVELS_AMMOUNT = 5;

export default class LevelScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LevelScene' });

        this.levelsList = [];

        for (let i = 0; i < LEVELS_AMMOUNT; i++) {
            this.levelsList.push('level_' + (i+1));
        }
    }

    init(data) {
        if (data.levelID > LEVELS_AMMOUNT || data.levelID < 1) {
            this.currentLevelID = 0;
        }
        else {
            this.currentLevelID = data.levelID - 1;
        }
    }

    preload() {

    }

    create() {

        addFullscreenButton(this);

        // Cursor por defecto
		this.input.setDefaultCursor('url(assets/images/recoil_cursor.cur), auto');

        // esto hay que ponerlo en cada escena, no vale con ponerlo en solo la de carga
		this.physics.world.TILE_BIAS = 50;
        this.cameras.main.setDeadzone(100, 70);

        this.player = new Player(this, 0, 0, 0.3, 0.7);
        this.levelLimit = this.physics.add.staticBody(0, 10000, 1000, 50);
        this.levelLimitCollider = this.physics.add.overlap(this.player, this.levelLimit, 
            () => { this.player.changeState(PLAYER_STATES.DEAD); }, null, this);
        this.flag = new Flag(this, this.player, 100, 100);

        this.platforms = [];
        this.munitions = [];

        this.spikes = this.physics.add.staticGroup({classType: Spikes});

        this.munitionTween = this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
                let value = tween.getValue();
                this.munitions.forEach(obj => {
                    obj.y = obj.startY - 25 * value;
                });
            }
        });

        const height = this.sys.game.config.height;

        this.initLevel();
    }

    update() {}

    clearCurrentLevel() {
        this.terrainCollider.destroy();
        this.levelMap.layers.forEach(l => l.tilemapLayer.destroy());
        this.levelMap.destroy();
        this.spikes.clear(true, true);

        this.platforms.forEach(platform => platform.destroy());
        this.platforms = [];

        this.munitions.forEach(munition => munition.destroy());
        this.munitions = [];
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
            let fX = 100, fY = 100;
            let yLimit = this.levelMap.heightInPixels;

            dataObjects.forEach(obj => {
                if (obj.name === 'spawn') {
                    plX = obj.x + obj.width/2;
                    plY = obj.y - obj.height/2;
                }
                else if (obj.name === 'limit') {
                    yLimit = obj.y - obj.height/2;
                }
                else if (obj.name === 'flag') {
                    fX = obj.x + obj.width/2;
                    fY = obj.y - obj.height/2;
                }
            });

            // Jugador
            this.player.setup(plX, plY);
            this.cameras.main.startFollow(this.player, true, 1, 0.5, 0.6, 50);

            // Limite del mundo
            this.levelLimit.position.set(0, yLimit);
            this.levelLimit.setSize(this.levelMap.widthInPixels, 50);
            this.levelLimit.updateCenter();

            // Plataformas
            const platformObjects = this.levelMap.getObjectLayer('platforms').objects;
            const platformDestObjects = this.levelMap.getObjectLayer('platforms_dest').objects;
            let platformsDataMap = {};
            platformObjects.forEach(obj => {
                if (obj.properties) {
                    for (const { name, value } of obj.properties) {
                        if (name === 'id') {
                            platformsDataMap[value] = {
                                xStart: obj.x + obj.width/2,
                                yStart: obj.y - obj.height/2,
                                xEnd: obj.x + obj.width/2,
                                yEnd: obj.y - obj.height/2,
                            }
                        }
                    }
                }
            });

            platformDestObjects.forEach(obj => {
                if (obj.properties) {
                    for (const { name, value } of obj.properties) {
                        if (name === 'id') {
                            if (platformsDataMap[value]) {
                                platformsDataMap[value].xEnd = obj.x + obj.width/2;
                                platformsDataMap[value].yEnd = obj.y - obj.height/2;   
                            }
                        }
                    }
                }
            });

            Object.values(platformsDataMap).forEach( val => {
                this.platforms.push(
                    new Platform(this, this.player, val.xStart, val.yStart, val.xEnd, val.yEnd));
            });
            
            // Munición
            const ammoObjects = this.levelMap.getObjectLayer('munition').objects;
            ammoObjects.forEach(obj => {
                if (obj.properties) {
                    for (const { name, value } of obj.properties) {
                        if (name === 'ammo') {
                            this.munitions.push(new Munition(this, this.player, obj.x + obj.width/2, 
                                obj.y - obj.height/2, value));
                        }
                    }
                }
            });

            // Creación de terreno
            const tilesetTerrain = this.levelMap.addTilesetImage('terrain_tileset', 'terrain_tileset');
            const terrainLayer = this.levelMap.createLayer('ground', tilesetTerrain);
            terrainLayer.setDepth(10);
            terrainLayer.setCollisionBetween(0, 999);
            this.terrainCollider = this.physics.add.collider(this.player, terrainLayer);

            // Pinchos, esto podría estar en una pool, pero no lo está
            const spikeObjects = this.levelMap.getObjectLayer('spikes').objects;
            spikeObjects.forEach(obj => {
                // tambien se puede usar this.spikes.add(objeto) y añade el objeto, o addMultiple
                this.spikes.create(obj.x + obj.width/2, obj.y - obj.height/2);
            });
            this.physics.add.collider(this.player, this.spikes, 
                () => { this.player.changeState(PLAYER_STATES.DEAD); }, null, this);

            // Bandera
            this.flag.setup(fX, fY);

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
        this.player.changeState(PLAYER_STATES.SPAWN);
        this.platforms.forEach( platform => platform.reset());
        this.munitions.forEach( munition => munition.reset());
    }

    advanceLevel() {
        console.log(this.currentLevelID);
        if (this.currentLevelID < this.levelsList.length - 1) {
            this.clearCurrentLevel();
            this.currentLevelID++;
            localStorage.setItem('level', this.currentLevelID + 1)
            this.initLevel();
        }
        else {
            localStorage.removeItem('level');
            this.scene.start('WinScene');
        }
    }
}