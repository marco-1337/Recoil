import {LEVELS_AMMOUNT} from './levelScene.js'

export default class LoadScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'LoadScene' });
    }

    // Carga de recursos, se cargan de forma asíncrona
    preload() {

        this.load.setPath('assets/sprites/');

		this.load.image('flag', 'flag.png')
		this.load.image('platform', 'platform.png')
        this.load.spritesheet('player', 'player_spritesheet.png', 
            { frameWidth: 74, frameHeight: 115});
        this.load.spritesheet('weapon', 'gun_spritesheet.png', 
            { frameWidth: 100, frameHeight: 30});
		this.load.spritesheet('terrain_tileset', 'terrain_tileset.png', {
			frameWidth: 50,
    		frameHeight: 50
		});
		this.load.spritesheet('shoot_effect', 'shoot_spritesheet.png', {
			frameWidth: 130,
    		frameHeight: 24
		});
		this.load.spritesheet('munition', 'munition.png', {
			frameWidth: 58,
			frameHeight: 45
		});
		this.load.spritesheet('win_sprite', 'win_sprite.png', {
			frameWidth: 768,
			frameHeight: 432
		});

		this.load.setPath('assets/levels/');

		for (let i = 1; i <= LEVELS_AMMOUNT; ++i) {
			this.load.tilemapTiledJSON('level_'+ i, 'Level' + i + '.json');
		}

		this.load.setPath('assets/images/');
		this.load.image('logo', 'recoil_logo_notext.png');
		this.load.image('munition_UI', 'munition_ui.png');

		// Hay que poner la ruta completa
		this.loadFont('MainFont', 'assets/fonts/TurretRoad-ExtraBold.ttf');

		this.load.setPath('assets/audio/');
		this.load.audio('main_theme_intro', 'Shellshock_intro.mp3');
		this.load.audio('main_theme_loop', 'Shellshock_loop.mp3');
		this.load.audio('win', 'win.mp3');
		this.load.audio('death', 'death.mp3');
		this.load.audio('shoot', 'shoot.mp3');
		this.load.audio('reload', 'reload.mp3');
    }

    // Creación de animaciones, se crean después de la carga de los recursos porque pueden no estar
    // listos tras las llamadas al preload, al ser asíncrono
    create() {

		// Cursor por defecto
		this.input.setDefaultCursor('url(assets/images/recoil_cursor.cur), auto');

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
        
		// Disparo
		this.anims.create({
			key: 'shoot',
			frames: this.anims.generateFrameNumbers('shoot_effect', {start:0, end:4}),
			frameRate: 36,
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

		// Pantalla de victoria
		this.anims.create({
			key: 'win_screen',
			frames: [
				{key: 'win_sprite', frame:0, duration: 433},
				{key: 'win_sprite', frame:1, duration: 133},
				{key: 'win_sprite', frame:2, duration: 433},
				{key: 'win_sprite', frame:1, duration: 133}
			],
			frameRate: 12,
			repeat: -1
		});
		
		let music_intro = this.game.sound.add('main_theme_intro', { loop: false });
		music_intro.setVolume(0.1);
		let music_loop = this.sound.add('main_theme_loop', {loop: true});
		music_loop.setVolume(0.1);

		music_intro.play();

		music_intro.once('complete', function() {
			music_loop.play();
		});
    }

    update() {
        this.scene.start('MenuScene');
    }

	loadFont(name, url) {
		let newFont = new FontFace(name, `url(${url})`);
		newFont.load().then(function (loaded) {
			document.fonts.add(loaded);
		}).catch(function (error) {
			return error;
		});
	}
}