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
    constructor(scene, x, y, w, h) {
        super(scene, x, y, 'platform');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.scaleX = w;
        this.scaleY = h;
        //this.scene.physics.add.collider(this, player);
    }
}