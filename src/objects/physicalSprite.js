export default class PhysicalSprite extends Phaser.GameObjects.Sprite {
    /**
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {Player} player Jugador del juego
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} physicsWidthPercent Del 0 al 1, tamaño horizontal de la hitbox relativo al sprite 
   * @param {number} physicsHeightPercent Del 0 al 1, tamaño vertical de la hitbox relativo al sprite
   * @param {string} spriteKey clave del sprite
   * @param {number} spriteFrame frame del spritesheet (si es que hay)
   * @param {boolean} yFixedDown cuando se ajusta la altura, se pega a la parte baja del sprite
   * @param {boolean} isStatic cuerpo estático v
   */
    constructor(scene, x, y, physicsWidthPercent, physicsHeightPercent, spriteKey, 
        spriteFrame = 0, yFixedDown = true, isStatic = true) {

        super(scene, x, y, spriteKey, spriteFrame);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, isStatic);

        if (!physicsWidthPercent || physicsWidthPercent > 1 || physicsWidthPercent < 0) {
            physicsWidthPercent = 1;
        }
        if (!physicsHeightPercent || physicsHeightPercent > 1 || physicsHeightPercent < 0) {
            physicsHeightPercent = 1;
        }

        this.scene.physics.add.existing(this);

        /** @type {Phaser.Physics.Arcade.Body} */
        this.body; //Para que VSCode lintee

        //Esto cambia la caja de colisiones, no el sprite
        this.body.setSize(this.displayWidth * physicsWidthPercent, 
            this.displayHeight * physicsHeightPercent);

        if (yFixedDown) {
            this.body.setOffset(0, this.body.height);
        }
        else {
            this.body.setOffset(0, 0);
        }
    }
}