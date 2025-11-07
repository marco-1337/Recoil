export default class Platform extends Phaser.GameObjects.Sprite {

    /**
   * Constructor de la Plataforma
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {Player} player Jugador del juego
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} w Anchura
   * @param {number} h altura
   */
    constructor(scene, player, x, y, w, h) {
        super(scene, x, y, 'platform');
        this.scene.add.existing(this);
        // Si se reescala debe de ir antes de añadir la caja de colisión porque
        // si no no se actualiza las dimensiones para la caja
        this.scaleX = w;
        this.scaleY = h;
        this.scene.physics.add.existing(this, true);
        this.scene.physics.add.collider(this, player);
    }
}