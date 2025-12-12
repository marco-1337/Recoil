const PLATFORM_SPEED = 200;
const PLATFORM_WAIT_TIME = 2500; // milisegundos

export default class Platform extends Phaser.GameObjects.Sprite {

    /**
   * Constructor de la Plataforma
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {Player} player Jugador del juego
   * @param {number} xStart Coordenada x
   * @param {number} yStart Coordenada y
   * @param {number} xEnd Coordenada x destino
   * @param {number} yEnd Coordenada y destino
   */
    constructor(scene, player, xStart, yStart, xEnd, yEnd) {
        super(scene, xStart, yStart, 'platform');
        this.scene.add.existing(this);

        this.xStart = xStart;
        this.yStart = yStart;
        this.xEnd = xEnd;
        this.yEnd = yEnd;

        this.scene.physics.add.existing(this);
        this.scene.physics.add.collider(this, player);

        /** @type {Phaser.Physics.Arcade.Body} */
        this.body;

        this.body
            .setAllowGravity(false)
            .setImmovable(true);

        this.velocity = new Phaser.Math.Vector2(xEnd, yEnd)
            .subtract(new Phaser.Math.Vector2(xStart, yStart))
            .normalize()
            .scale(PLATFORM_SPEED);
        
        this.body.setVelocity(this.velocity.x, this.velocity.y);

        this.defaultOrigin = new Phaser.Math.Vector2(xStart, yStart);
        this.defaultTarget = new Phaser.Math.Vector2(xEnd, yEnd);

        this.origin = new Phaser.Math.Vector2(xStart, yStart);
        this.target = new Phaser.Math.Vector2(xEnd, yEnd);
        this.previousDistance = new Phaser.Math.Vector2(this.x, this.y).distance(this.target);

        this.moving = true;
    }

    destroy() {
        if (this.waitTimer) {
            this.waitTimer.remove(false);
            this.waitTimer = null;
        }
        super.destroy();
    }

    preUpdate() {

        if (this.moving) {
            let distance = new Phaser.Math.Vector2(this.x, this.y).distance(this.target);

            // indica que la plataforma se pasa, asi que se reajusta y se para
            if (distance > this.previousDistance) {
                this.waitAndSwitch();
            }

            this.previousDistance = distance;
        }
    }

    waitAndSwitch() {

        this.hasReseted = false;
        this.moving = false;

        this.body.setVelocity(0);
        this.body.setAcceleration(0);
        this.setPosition(this.target.x , this.target.y);

        this.waitTimer = this.scene.time.delayedCall(PLATFORM_WAIT_TIME, () => { 
            
            if (!this.hasReseted) {
                this.moving = true;
                this.velocity.x *= -1;
                this.velocity.y *= -1;
                this.body.setVelocity(this.velocity.x , this.velocity.y); 
                let aux = this.origin.clone();
                this.origin.copy(this.target);
                this.target.copy(aux);
                this.previousDistance = new Phaser.Math.Vector2(this.x, this.y).distance(this.target);
            }
        });
    }

    reset() {

        if(this.waitTimer) { this.waitTimer.destroy(); }

        this.origin.copy(this.defaultOrigin);
        this.target.copy(this.defaultTarget);

        this.velocity = new Phaser.Math.Vector2(this.target.x, this.target.y)
            .subtract(new Phaser.Math.Vector2(this.origin.x, this.origin.y))
            .normalize()
            .scale(PLATFORM_SPEED);
        
        this.body.setVelocity(this.velocity.x, this.velocity.y);
        this.setPosition(this.origin.x , this.origin.y);
        this.moving = true;
        this.hasReseted = true;
        this.previousDistance = new Phaser.Math.Vector2(this.x, this.y).distance(this.target);
    }
}