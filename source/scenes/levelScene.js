import Platform from '../objects/platform.js';

export default class LevelScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LevelScene' });
    }

    preload() {}

    create() {
        new Platform(this, this.cameras.main.centerX, this.cameras.main.centerY + 190, 24.8, 2);
    }

    update() {

    }
}