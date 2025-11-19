import PhysicalSprite from './physicalSprite.js';

export default class Spikes extends PhysicalSprite { 
    /**
   * Constructor del jugador
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   */
    constructor(scene, x, y) {
        super(scene, x, y, 1.0, 0.5, 'terrain_tileset', 7, true, true);
    }
}