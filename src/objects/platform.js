const PLATFORM_SPEED = 200;
const PLATFORM_WAIT_TIME = 2500; // milisegundos

/**
 * Plataformas móviles. Se mueven a una velocidad fija y se quedan paradas en sus destinos
 * un tiempo fijo.
 */
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

        // La plataforma actúa como un cuerpo estático pese a ser dinámico
        this.body
            .setAllowGravity(false)
            .setImmovable(true);

        // Vector velocidad por defecto de la plataforma, se guarda para 
        // invertirlo al llegar a su destino
        this.velocity = new Phaser.Math.Vector2(xEnd, yEnd)
            .subtract(new Phaser.Math.Vector2(xStart, yStart))
            .normalize()
            .scale(PLATFORM_SPEED);
        
        this.body.setVelocity(this.velocity.x, this.velocity.y);

        // Guardado para reseteo
        this.defaultOrigin = new Phaser.Math.Vector2(xStart, yStart);
        this.defaultTarget = new Phaser.Math.Vector2(xEnd, yEnd);

        // Estas referencias se intercambian una vez llegadas al destino
        this.origin = new Phaser.Math.Vector2(xStart, yStart);
        this.target = new Phaser.Math.Vector2(xEnd, yEnd);

        // Se guarda para calcular si te pasas del destino y reajustar
        this.previousDistance = new Phaser.Math.Vector2(this.x, this.y).distance(this.target);

        // Indica si está en espera o si debe moverse
        this.moving = true;
    }

    destroy() {
        // Importante, si el callback se ha lanzado y no se destruye el timer
        // se ejecuta despues y puede causar errores de referencias nulas. Por eso
        // hay que borrarlo
        if (this.waitTimer) {
            this.waitTimer.remove(false);
            this.waitTimer = null;
        }
        super.destroy();
    }

    /**
     * Si la plataforma se tiene que mover la mueve. 
     * Comprueba si ha llegado a su destino
     */
    preUpdate() {

        if (this.moving) {
            let distance = new Phaser.Math.Vector2(this.x, this.y).distance(this.target);

            //Si la distancia es mayor que la distancia previa se ha pasado del destino, porque
            // la distancia hacia el target debería siempre decrecer 
            // Si se pasa se llama a waitAndSwitch
            if (distance > this.previousDistance) {
                this.waitAndSwitch();
            }

            this.previousDistance = distance;
        }
    }

    /**
     * Ajusta la plataforma al target por si se ha pasado.
     * 
     * Inicia el timer de espera, cuando se complete, swapea el destino, la velocidad
     * e inicia el movimiento
     */
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

    /**
     * Lo llama LevelScene. Resetea la plataforma al origen de construcción y
     * si el timer estaba esperando para lanzar el callback se cancela.
     */
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