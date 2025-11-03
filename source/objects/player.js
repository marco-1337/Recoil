const HORIZONTAL_GROUND_ACCELERATION = 7000;
const HORIZONTAL_GROUND_DECELERATION = 8500;
const GROUND_HORIZONTAL_MAX_VELOCITY = 650;
const JUMP_HORIZONTAL_BOOST = 100;
const JUMP_HORIZONTAL_MAX_VELOCITY = 750;
const JUMP_VALUE = -1200;

/**
 * Mueve current hacia target a una velocidad máxima delta
 * @param {number} current - valor actual
 * @param {number} target - valor objetivo
 * @param {number} maxDelta - máximo cambio permitido
 * @returns {number} nuevo valor
 */
function moveTowards(current, target, maxDelta) {
    const delta = target - current;

    if (Math.abs(delta) <= maxDelta) {
        return target;
    }

    return current + Math.sign(delta) * maxDelta;
}

export default class Player extends Phaser.GameObjects.Sprite {

    /**
   * Constructor de la Plataforma
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} physicsWidthPercent Del 0 al 1, tamaño horizontal de la hitbox relativo al sprite 
   * @param {number} physicsHeightPercent Del 0 al 1, tamaño vertical de la hitbox relativo al sprite, la cantidad eliminada es quitada de la parte de arriba del sprite
   */
    constructor(scene, x, y, physicsWidthPercent, physicsHeightPercent) {
        super(scene, x, y, 'player');
        this.scene.add.existing(this); 

    // FÍSICAS

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
        this.body.setSize(this.displayWidth * physicsWidthPercent, this.displayHeight * physicsHeightPercent);

        this.body.setOffset((this.displayWidth - this.displayWidth*physicsWidthPercent)/2, this.displayHeight - this.displayHeight*physicsHeightPercent);

        this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;

    // INPUT HORIZONTAL

        this.left = this.scene.input.keyboard.addKey('A');
        this.right = this.scene.input.keyboard.addKey('D');

        this.horizontalInput = 0;

        this.left.on('down', () => {
            this.horizontalInput -= 1;
        });

        this.left.on('up', () => {
            this.horizontalInput += 1;
        });

        this.right.on('down', () => {
            this.horizontalInput += 1;
        });

        this.right.on('up', () => {
            this.horizontalInput -= 1;
        });

    // INPUT SALTO

        this.jump = this.scene.input.keyboard.addKey('SPACE');
        this.jumpExecuted = false;
    }

    preUpdate(t,dt) {
        super.preUpdate(t,dt);
        const deltaSeconds = dt / 1000;

        // Manejo movimiento horizontal
        if (this.horizontalInput != 0) {
            if (Math.sign(this.body.velocity.x) != this.horizontalInput) {
                this.body.velocity.x = 0;
            }

            this.body.setVelocityX(moveTowards(this.body.velocity.x, this.horizontalMaxVelocity * this.horizontalInput, HORIZONTAL_GROUND_ACCELERATION * deltaSeconds));
        }
        else {
            if (this.body.velocity.x != 0) {
                this.body.setVelocityX(moveTowards(this.body.velocity.x, 0, HORIZONTAL_GROUND_DECELERATION * deltaSeconds))
            }
            this.body.setAcceleration(0);
        }

        // Manejo del salto
        if (this.jump.isDown && !this.jumpExecuted && this.body.blocked.down) {
            this.jumpExecuted = true; 
            this.body.setVelocityY(JUMP_VALUE);
            this.horizontalMaxVelocity = JUMP_HORIZONTAL_MAX_VELOCITY;

            if (this.body.velocity.x != 0) {
                this.body.setVelocityX(moveTowards(this.body.velocity.x, this.horizontalMaxVelocity * this.horizontalInput, JUMP_HORIZONTAL_BOOST));
            }
        }
        else if (this.body.blocked.down) {

            this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;

            if (!this.jump.isDown) {
                this.jumpExecuted = false; 
            }
        }
    }
}