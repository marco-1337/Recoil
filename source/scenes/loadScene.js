export default class TestScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        this.load.setPath('source/assets/sprites/');
        this.load.image('platform', 'test_sprite.png');
    }

    create() {

    }

    update() {
        this.scene.start('LevelScene');
    }
}