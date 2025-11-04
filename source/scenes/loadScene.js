export default class TestScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        this.load.setPath('source/assets/sprites/');
        this.load.image('platform', 'test_sprite.png');
        this.load.spritesheet('player', 'player_spritesheet.png', 
            { frameWidth: 96, frameHeight: 144 });
    }

    create() {

    }

    update() {
        this.scene.start('LevelScene');
    }
}