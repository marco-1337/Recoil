export default class TestScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        this.load.setPath('assets/sprites/');
        this.load.image('platform', 'test_sprite.png');
        this.load.spritesheet('player', 'player_spritesheet.png', 
            { frameWidth: 96, frameHeight: 144 });
        this.load.spritesheet('weapon', 'gun_spritesheet.png', 
            { frameWidth: 110, frameHeight: 28});
    }

    create() {

    }

    update() {
        this.scene.start('LevelScene');
    }
}