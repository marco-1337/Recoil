import Platform from '../objects/platform.js';
import Player from '../objects/player.js';

export default class LevelScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LevelScene' });
    }

    preload() {}

    create() {

        let player = new Player(this, this.cameras.main.centerX, this.cameras.main.centerY, 0.3, 0.7);
        new Platform(this, player, this.cameras.main.centerX, this.cameras.main.centerY + 455, 60, 5);
    }

    update() {

    }
}