import UIButton from './ui/uiButton.js'

/**
 * @param {Phaser.GameObjects.Sprite|Phaser.GameObjects.Image} gameObject El objeto que ya existe en la escena
 * @param {number} physicsWidthPercent Del 0 al 1, ancho relativo al sprite
 * @param {number} physicsHeightPercent Del 0 al 1, alto relativo al sprite
 * @param {boolean} yFixedDown Si la hitbox se pega abajo del sprite
 */
export function setupPhysicsBody(gameObject, physicsWidthPercent = 1, physicsHeightPercent = 1, 
    yFixedDown = true) {

    if (!gameObject.body) return;

    physicsWidthPercent = Phaser.Math.Clamp(physicsWidthPercent, 0, 2);
    physicsHeightPercent = Phaser.Math.Clamp(physicsHeightPercent, 0, 1);

    //Esto cambia la caja de colisiones, no el sprite
    gameObject.body.setSize(gameObject.displayWidth * physicsWidthPercent, 
        gameObject.displayHeight * physicsHeightPercent);

    if (yFixedDown) {
        gameObject.body.setOffset(gameObject.displayWidth/2 - gameObject.body.width/2, 
            gameObject.displayHeight - gameObject.body.height);
    }
    else {
        gameObject.body.setOffset(gameObject.displayWidth/2 - gameObject.body.width/2, 
            gameObject.displayHeight/2 - gameObject.body.height/2);
    }
}

/**
 * @param {Phaser.Scene} scene escena para añadir el botón
 */
export function addFullscreenButton(scene) {

    const width = scene.sys.game.config.width;
    const height = scene.sys.game.config.height;
    
    new UIButton(scene, width - 48, height - 44, 52, 'MainFont', '⛶', 
        (pointer, localX, localY, event) => {
                if (scene.scale.isFullscreen) {
                    scene.scale.stopFullscreen();
                } else {
                    scene.scale.startFullscreen();
                }

                event.stopPropagation();
                
        }, '#ffffff80', '#ffffffff');
}