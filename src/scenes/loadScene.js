export default class TestScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LoadScene' });
    }

    // Carga de recursos, se cargan de forma asíncrona
    preload() {

        this.load.setPath('assets/sprites/');
        this.load.image('platform', 'test_sprite.png');
        this.load.spritesheet('player', 'player_spritesheet.png', 
            { frameWidth: 96, frameHeight: 144 });
        this.load.spritesheet('weapon', 'gun_spritesheet.png', 
            { frameWidth: 110, frameHeight: 28});
    }

    // Creación de animaciones, se crean después de la carga de los recursos porque pueden no estar
    // listos tras las llamadas al preload, al ser asíncrono
    create() {

        // ANIMACIONES DEL CUERPO DEL PLAYER
        this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNumbers('player', {start:0, end:0}),
			frameRate: 0,
			repeat: -1
		});

		this.anims.create({
			key: 'jump',
			frames: this.anims.generateFrameNumbers('player', {start:1, end:1}),
			frameRate: 0,
			repeat: -1
		});
		this.anims.create({
			key: 'run',
			frames: this.anims.generateFrameNumbers('player', {start:2, end:6}),
			frameRate: 24,
			repeat: -1
		});
        this.anims.create({
			key: 'runBackwards',
			frames: this.anims.generateFrameNumbers('player', {start:6, end:2}),
			frameRate: 24,
			repeat: -1
		});

        
        // Brazo frontal
        this.anims.create({
			key: 'front_weapon',
			frames: this.anims.generateFrameNumbers('weapon', {start:0, end:0}),
			frameRate: 0,
			repeat: -1
		});

        // Overlay del brazo
        this.anims.create({
			key: 'background_weapon',
			frames: this.anims.generateFrameNumbers('weapon', {start:1, end:1}),
			frameRate: 1000,
			repeat: -1
		});

    }

    update() {
        this.scene.start('LevelScene');
    }
}