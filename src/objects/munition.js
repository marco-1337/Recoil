import {setupPhysicsBody} from '../utils.js';

const ACTIVATION_DELAY = 2000;

/**
 * Cajas de munición. Reinician el dar munición cada ACTIVATION_DELAY segundos
 */
export default class Munition extends Phaser.GameObjects.Sprite { 

    /** efecto de sonido estático "singleton" para que lo llamen todas las cajas */
    static reloadSoundEffect = null;

    /**
   * Constructor de caja de munición
   * @param {Phaser.Scene} scene Escena a la que pertenece
   * @param {Player} player Jugador
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} ammount cantidad de munición que otorga, tambien define el sprite a usar
   */
    constructor(scene, player, x, y, ammount) {
        super(scene, x, y, 'munition', ammount - 1);

        this.startY = y;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        /** @type {Phaser.Physics.Arcade.Body} */
        this.body;

        this.body
            .setAllowGravity(false)
            .setImmovable(true);

        setupPhysicsBody(this, 1, 1.2, false);

        this.ammount = ammount;

        // Si no está inicializado se crea el efecto de sonido
        if (!Munition.reloadSoundEffect) {
            Munition.reloadSoundEffect = scene.sound.add('reload', { loop: false });
            Munition.reloadSoundEffect.setVolume(0.1);
        }

        // Callback de colisión con el player, le otorga la munición y se resetea a si misma.
        // Desactiva la colisión para que sea reactivada tras el delay
        this.scene.physics.add.overlap(this, player, (munition, player) => { 
                Munition.reloadSoundEffect.play();
                player.setMunition(this.ammount); 
                this.body.checkCollision.none = true;
                this.setAlpha(0.5);

                this.waitTimer = this.scene.time.delayedCall(ACTIVATION_DELAY, () => {
                        this.reset();
                    }
                );

            }, null, this
        );
    }

    /**
     * Destruye el timer si existe para que no llame a referencias nulas
     */
    destroy() {
        if (this.waitTimer) {
            this.waitTimer.remove(false);
            this.waitTimer = null;
        }
        super.destroy();
    }

    /**
     * Se llama desde LevelScene al reiniciar el nivel y desde el callback de delay de la munición. 
     * Reactiva la colisión y restaura el alfa
     */
    reset() {
        this.body.checkCollision.none = false;
        this.setAlpha(1);                    
    }
}