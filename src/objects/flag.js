import {setupPhysicsBody} from '../utils.js';

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
        setupPhysicsBody(this, 0.6, 0.8, true);

        this.winSoundEffect = this.scene.sound.add('win', { loop: false });
		this.winSoundEffect.setVolume(0.1);

        this.scene.physics.add.overlap(this, player,
            () => { 
                this.body.checkCollision.none = true;
                this.winSoundEffect.play();
                this.scene.time.delayedCall(0, () => {
                    this.scene.advanceLevel();
                });
            }, null, this);

        /** @type {Phaser.Physics.Arcade.StaticBody} */
        this.body;
    }

    /** Recoloca la bandera
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