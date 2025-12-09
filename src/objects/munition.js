import {setupPhysicsBody} from '../utils.js';

export default class Munition extends Phaser.GameObjects.Sprite { 

    static reloadSoundEffect = null;

    /**
   * Constructor del jugador
   * @param {Phaser.Scene} scene Escena a la que pertenece
   * @param {Player} player Jugador
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} ammount cantidad de munición que otorga
   */
    constructor(scene, player, x, y, ammount) {
        super(scene, x, y, 'munition', ammount - 1);

        this.startY = y;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.body
            .setAllowGravity(false)
            .setImmovable(true);

        setupPhysicsBody(this, 0.5, 0.8, false);

        this.ammount = ammount;

        if (!Munition.reloadSoundEffect) {
            Munition.reloadSoundEffect = scene.sound.add('reload', { loop: false });
            Munition.reloadSoundEffect.setVolume(0.1);
        }

        this.scene.physics.add.overlap(this, player, (munition, player) => { 
                Munition.reloadSoundEffect.play();
                player.setMunition(this.ammount); 
                this.body.enable = false
                this.setVisible(false);
            }, null, this
        );
    }

    reset() {
        this.body.enable = true; 
        this.setVisible(true);
    }
}