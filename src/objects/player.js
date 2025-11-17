const HORIZONTAL_GROUND_ACCELERATION = 7000;
const HORIZONTAL_GROUND_DECELERATION = 8500;
const GROUND_HORIZONTAL_MAX_VELOCITY = 650;
const JUMP_HORIZONTAL_BOOST = 100;
const JUMP_HORIZONTAL_MAX_VELOCITY = 750;
const GROUND_MAX_SPEED = 1200;
const JUMP_VALUE = -1200;
const SHOOT_VALUE = 1700;
const AIR_MAX_SPEED = 2100;

export default class Player extends Phaser.GameObjects.Container  {


    playerStates = {
        GROUNDED: 0,
        AIR: 1
    }

    /**
   * Constructor de la Plataforma
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} physicsWidthPercent Del 0 al 1, tamaño horizontal de la hitbox relativo al sprite 
   * @param {number} physicsHeightPercent Del 0 al 1, tamaño vertical de la hitbox relativo al sprite, 
   * la cantidad eliminada es quitada de la parte de arriba del sprite
   */
    constructor(scene, x, y, physicsWidthPercent, physicsHeightPercent) {
        super(scene, x, y);

        this.scene.add.existing(this); 

        this.state = this.playerStates.AIR;

        // PARÁMETROS
        this.horizontalInput = 0;
        this.lookingAt = 1;
        this.jumpExecuted = false;
        this.canShoot = true;
        this.timeToShoot = 1.;

        this.initSprites();
        this.initPhysics(physicsWidthPercent, physicsHeightPercent);
        this.initInput();
    }

    initSprites() {
        // SPRITE DE FONDO DEL ARMA

        this.weaponBg = this.scene.add.sprite(-1, 3, 'weapon');
        this.add(this.weaponBg);
        this.weaponBg.play('background_weapon');

        // SPRITE DEL CUERPO

        this.playerBody = this.scene.add.sprite(0, 0, 'player');
        this.add(this.playerBody);
        this.playerBody.play('idle');

        // SPRITE DEL ARMA

        this.weapon = this.scene.add.sprite(-1, 3, 'weapon');
        this.add(this.weapon);
        this.weapon.play('front_weapon');
    }

    /** 
   * @param {number} physicsWidthPercent Del 0 al 1, tamaño horizontal de la hitbox relativo al sprite
   * @param {number} physicsHeightPercent Del 0 al 1, tamaño vertical de la hitbox relativo al sprite, 
   *    la cantidad eliminada es quitada de la parte de arriba del sprite
    */
    initPhysics(physicsWidthPercent, physicsHeightPercent) {
        if (!physicsWidthPercent || physicsWidthPercent > 1 || physicsWidthPercent < 0) {
            physicsWidthPercent = 1;
        }
        if (!physicsHeightPercent || physicsHeightPercent > 1 || physicsHeightPercent < 0) {
            physicsHeightPercent = 1;
        }

        this.scene.physics.add.existing(this);

        /** @type {Phaser.Physics.Arcade.Body} */
        this.body; //Para que VSCode lintee

        this.body.setCollideWorldBounds(true);

        //Esto cambia la caja de colisiones, no el sprite
        this.body.setSize(this.playerBody.displayWidth * physicsWidthPercent, 
            this.playerBody.displayHeight * physicsHeightPercent);

        this.body.setOffset(-this.body.width/2, -this.body.height/2 + 
            (this.playerBody.displayHeight * (1-physicsHeightPercent))/2);

        this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;

        this.body.setMaxSpeed(GROUND_MAX_SPEED);
    }

    initInput() {
        this.left = this.scene.input.keyboard.addKey('A');
        this.right = this.scene.input.keyboard.addKey('D');

        this.leftPress = false;
        this.rightPress = false;

        this.left.on('down', () => {
            this.leftPress = true;
            this.reloadHorizontalDirection();
            this.reloadAnimation();
        });

        this.left.on('up', () => {
            this.leftPress = false;
            this.reloadHorizontalDirection();
            this.reloadAnimation();
        });

        this.right.on('down', () => {
            this.rightPress = true;
            this.reloadHorizontalDirection();
            this.reloadAnimation();
        });

        this.right.on('up', () => {
            this.rightPress = false;
            this.reloadHorizontalDirection();
            this.reloadAnimation();
        });

        // INPUT SALTO
        this.jump = this.scene.input.keyboard.addKey('SPACE');

        // INPUT RATON
        this.pointer = this.scene.input.activePointer;
        this.leftClickPressed = false;

        this.scene.input.on('pointerdown', pointer => {

            if (pointer.leftButtonDown()) {
                this.leftClickPressed = true;
            }
        });
    }

    preUpdate(t,dt) {
        const deltaSeconds = dt / 1000;

        switch (this.state) {

            case this.playerStates.GROUNDED:
                
                if (!this.body.onFloor()) {
                    this.changeState(this.playerStates.AIR);
                }

                if (this.horizontalInput != 0) {
                    if (Math.sign(this.body.velocity.x) != this.horizontalInput) {
                        this.body.setVelocityX(0);
                    }

                    this.body.setVelocityX(this.moveTowards(this.body.velocity.x, 
                        this.horizontalMaxVelocity * this.horizontalInput, 
                        HORIZONTAL_GROUND_ACCELERATION * deltaSeconds));
                    }
                else {
                    if (this.body.velocity.x != 0) {
                        this.body.setVelocityX(this.moveTowards(this.body.velocity.x, 0, 
                            HORIZONTAL_GROUND_DECELERATION * deltaSeconds));
                    }

                    this.body.setAcceleration(0);
                }

                // Manejo salto
                if (this.jump.isDown && !this.jumpExecuted) {

                    this.changeState(this.playerStates.AIR);

                    this.body.setVelocityY(JUMP_VALUE);
                    
                    // Este boost ocurre solo una vez, por lo tanto no se aplica delta
                    if (this.body.velocity.x != 0) {
                        this.body.setVelocityX(this.moveTowards(this.body.velocity.x, 
                            this.horizontalMaxVelocity * this.horizontalInput, JUMP_HORIZONTAL_BOOST));
                    } 
                }
                else if (this.jump.isUp && this.jumpExecuted) this.jumpExecuted = false; 

                break;

            case this.playerStates.AIR:

                if (this.horizontalInput != 0) { 
                    if (Math.sign(this.body.velocity.x) === this.horizontalInput &&
                        Math.abs(this.body.velocity.x) < this.horizontalMaxVelocity) {

                        this.body.setVelocityX(this.moveTowards(this.body.velocity.x, 
                        this.horizontalMaxVelocity * this.horizontalInput, 
                        HORIZONTAL_GROUND_ACCELERATION * deltaSeconds));
                    }
                    else if (Math.sign(this.body.velocity.x) !== this.horizontalInput) {
                        this.body.setVelocityX(this.body.velocity.x + this.moveTowards(0, 
                        this.horizontalMaxVelocity * this.horizontalInput, 
                        HORIZONTAL_GROUND_ACCELERATION * deltaSeconds));
                    }
                }
                else {
                    this.body.setAcceleration(0);
                }

                if (this.body.onFloor()) {
                    this.changeState(this.playerStates.GROUNDED);
                }

                break;
        }
        // ARMA

        const shootPoint = this.weapon.getWorldTransformMatrix().transformPoint(0., 0.);
        this.pointer.updateWorldPoint(this.scene.cameras.main);

        this.handleShoot(shootPoint);
        this.rotateWeapon(shootPoint);
    }


    /**
     * Cambia al estado pasado
     * @param {number} newState estado al que se cambia
     */
    changeState(newState) {
        if (newState !== this.state && newState >= 0 && newState < Object.keys(this.playerStates).length) {
            this.state = newState;
            
            switch (this.state) {
                case this.playerStates.GROUNDED: 
            
                    this.body.setMaxSpeed(GROUND_MAX_SPEED);
                    this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;
                    this.reloadAnimation();

                    break;
                case this.playerStates.AIR: 

                    this.jumpExecuted = true; 
                    this.body.setMaxSpeed(AIR_MAX_SPEED);
                    this.horizontalMaxVelocity = JUMP_HORIZONTAL_MAX_VELOCITY;

                    this.playerBody.play('jump');

                    break;
            }
        }
    }

    /**
     * Manejado del disparo
     * @param {Phaser.Types.Math.Vector2Like} shootPoint el punto desde donde se dispara
     */
    handleShoot(shootPoint) {

        if (this.leftClickPressed) { 

            this.changeState(this.playerStates.AIR);
            
            const angle = Phaser.Math.Angle.Between(shootPoint.x, shootPoint.y, 
                this.pointer.worldX, this.pointer.worldY);
                
            // Como minimo siempre impulsa el retroceso de la escopeta, pero
            // si ya se lleva una velocidad fevorable al disparo, se suma.
            //
            // Las velocidad en contra del tiro no se opone
            let impulse = new Phaser.Math.Vector2((this.body.velocity.x/2 - (Math.cos(angle) * SHOOT_VALUE)),
                this.body.velocity.y/2 - (Math.sin(angle) * SHOOT_VALUE));
            impulse.setLength(Math.max(SHOOT_VALUE, impulse.length()));

            this.body.setVelocity(impulse.x, impulse.y);

            this.leftClickPressed = false;
        }
    }

    /**
     * Rota el arma según donde apunta el ratón
     * @param {Phaser.Types.Math.Vector2Like} shootPoint el punto desde donde se dispara
     */
    rotateWeapon(shootPoint) {
        
        // Flips segun donde esté el ratón
        if (this.pointer.worldX < this.x) {
            this.lookingAt = -1;
            this.playerBody.setFlipX(true);
            this.weapon.setFlipY(true);
            this.weaponBg.setFlipY(true);
        }
        else {
            this.lookingAt = 1;
            this.playerBody.setFlipX(false);
            this.weapon.setFlipY(false);
            this.weaponBg.setFlipY(false);
        }

        // Rotación del arma apuntando al ratón

        const angle = Phaser.Math.Angle.Between(shootPoint.x, shootPoint.y, 
            this.pointer.worldX, this.pointer.worldY);

        this.weapon.setRotation(angle);
        this.weaponBg.setRotation(angle);
    }

    reloadHorizontalDirection() {
        if (this.rightPress && !this.leftPress) {
            this.horizontalInput = 1;
        }
        else if (!this.rightPress && this.leftPress){
            this.horizontalInput = -1;
        }
        else {
            this.horizontalInput = 0;
        }
    }

    reloadAnimation() {
        if (this.body.onFloor()) {
            let anim;

            if (this.horizontalInput !== 0) {
                anim = (this.lookingAt === this.horizontalInput) ? 'run' : 'runBackwards';
            }
            else {
                anim = 'idle';
            }
            this.playerBody.play(anim);
        }
    }

    /**
     * Mueve al jugador a la posición indicada y reinicia sus valores de movimiento y sprites
     * @param {number} current - valor actual
     * @param {number} target - valor objetivo
     * @param {number} maxDelta - máximo cambio permitido
     * @returns {number} nuevo valor
     */
    relocateAndResetMovement() {

    }

    /**
     * Mueve current hacia target a una velocidad máxima delta
     * @param {number} current - valor actual
     * @param {number} target - valor objetivo
     * @param {number} maxDelta - máximo cambio permitido
     * @returns {number} nuevo valor
     */
    moveTowards(current, target, maxDelta) {
        const delta = target - current;

        if (Math.abs(delta) <= maxDelta) {
            return target;
        }

        return current + Math.sign(delta) * maxDelta;
    }
}