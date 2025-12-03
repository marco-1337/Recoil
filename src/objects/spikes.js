import setupPhysicsBody from './physicsUtils.js';

export default class Spikes extends Phaser.GameObjects.Sprite { 
    /**
   * Constructor del jugador
   * @param {Phaser.Scene} scene Escena a la que pertenece
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   */
    constructor(scene, x, y) {
        super(scene, x, y, 'terrain_tileset', 7);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        setupPhysicsBody(this, 0.85, 0.5, true);
    }
}