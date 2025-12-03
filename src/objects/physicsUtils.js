/**
 * @param {Phaser.GameObjects.Sprite|Phaser.GameObjects.Image} gameObject El objeto que ya existe en la escena
 * @param {number} physicsWidthPercent Del 0 al 1, ancho relativo al sprite
 * @param {number} physicsHeightPercent Del 0 al 1, alto relativo al sprite
 * @param {boolean} isStatic Si el cuerpo es estático
 * @param {boolean} yFixedDown Si la hitbox se pega abajo del sprite
 */
export default function setupPhysicsBody(gameObject, physicsWidthPercent = 1, 
    physicsHeightPercent = 1, yFixedDown = true) {

    if (!physicsWidthPercent || physicsWidthPercent > 1 || physicsWidthPercent < 0) {
        physicsWidthPercent = 1;
    }
    if (!physicsHeightPercent || physicsHeightPercent > 1 || physicsHeightPercent < 0) {
        physicsHeightPercent = 1;
    }

    /** @type {Phaser.Physics.Arcade.Body} */
    gameObject.body; //Para que VSCode lintee

    //Esto cambia la caja de colisiones, no el sprite
    gameObject.body.setSize(gameObject.displayWidth * physicsWidthPercent, 
        gameObject.displayHeight * physicsHeightPercent);

    if (yFixedDown) {
        gameObject.body.setOffset((gameObject.displayWidth/2) * (1 - physicsWidthPercent), gameObject.body.height);
    }
    else {
        gameObject.body.setOffset((gameObject.displayWidth/2) * (1 - physicsWidthPercent), 
            (gameObject.displayWidth/2) * (1 - physicsWidthPercent));
    }

}