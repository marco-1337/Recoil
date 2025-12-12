import {setupPhysicsBody} from '../utils.js';

/**
 * Bandera de fin de juego
 */
export default class Flag extends Phaser.GameObjects.Sprite { 
    /**
   * Constructor de la bandera de fin de juego
   * @param {Phaser.Scene} scene Escena a la que pertenece
   * @param {Player} player Jugador
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   */
    constructor(scene, player, x, y) {
        super(scene, x, y, 'flag');

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        setupPhysicsBody(this, 0.7, 1., true);

        // Efecto de sonido de victoria
        this.winSoundEffect = this.scene.sound.add('win', { loop: false });
		this.winSoundEffect.setVolume(0.1);

        this.scene.physics.add.overlap(this, player,
            () => { 
                // IMPORTANTE, desactiva automaticamente la detección de colisiones
                // para que no se avance mas de una vez
                this.body.checkCollision.none = true;
                this.winSoundEffect.play();

                this.scene.advanceLevel();

            }, null, this);

        /** @type {Phaser.Physics.Arcade.StaticBody} */
        this.body;
    }

    /** Recoloca la bandera, se llama al inciar un nivel desde LevelScene
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     * @param {Player} player Jugador
     */
    setup(x, y) {
        this.setPosition(x, y);
        this.body.checkCollision.none = false;
        this.body.x = x - this.body.width/2;
        this.body.y = y - this.body.height/2 + (this.displayHeight - this.body.height)/2;
    }
}