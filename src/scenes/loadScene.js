export default class TestScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LoadScene' });
    }

    // Carga de recursos, se cargan de forma asíncrona
    preload() {

        this.load.setPath('assets/sprites/');

        this.load.image('platform', 'test_sprite.png');
        this.load.spritesheet('player', 'player_spritesheet.png', 
            { frameWidth: 74, frameHeight: 115});
        this.load.spritesheet('weapon', 'gun_spritesheet.png', 
            { frameWidth: 100, frameHeight: 30});
		this.load.spritesheet('terrain_tileset', 'terrain_tileset.png', {
			frameWidth: 50,
    		frameHeight: 50
		});
		this.load.image('flag', 'flag.png');

		this.load.setPath('assets/levels/');

		this.load.tilemapTiledJSON('level_1', 'Level1.json');
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
		this.anims.create({
			key: 'death',
			frames: [
				{key: 'player', frame:7},
				{key: 'player', frame:8},
				{key: 'player', frame:9},
				{key: 'player', frame:10}
			],
			frameRate: 10,
			repeat: 0
		});
		this.anims.create({
			key: 'spawn',
			frames: [
				{key: 'player', frame:11},
				{key: 'player', frame:11},
				{key: 'player', frame:12},
				{key: 'player', frame:13}
			],
			frameRate: 9,
			repeat: 0
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
        this.scene.start('LevelScene', {levelID: 1});
    }
}