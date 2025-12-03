const HORIZONTAL_GROUND_ACCELERATION = 7000;
const HORIZONTAL_GROUND_DECELERATION = 8500;
const GROUND_HORIZONTAL_MAX_VELOCITY = 550;
const JUMP_HORIZONTAL_BOOST = 100;
const JUMP_HORIZONTAL_MAX_VELOCITY = 650;
const GROUND_MAX_SPEED = 1200;
const JUMP_VALUE = -1150;
const SHOOT_VALUE = 1700;
const AIR_MAX_SPEED = 2100;
const SHOOT_INTERVAL = 300;

export const PLAYER_STATES = Object.freeze({
        GROUNDED: 0,
        AIR: 1,
        DEAD: 2,
        SPAWN: 3
});

export default class Player extends Phaser.GameObjects.Container  {

    /**
   * Constructor del jugador
   * @param {Phaser.Scene} scene Escena a la que pertenece el jugador
   * @param {number} x Coordenada x inicial
   * @param {number} y Coordenada y inicial
   * @param {number} physicsWidthPercent Del 0 al 1, tamaño horizontal de la hitbox relativo al sprite 
   * @param {number} physicsHeightPercent Del 0 al 1, tamaño vertical de la hitbox relativo al sprite, 
   * la cantidad eliminada es quitada de la parte de arriba del sprite
   * @param {number} shots Cantidad de tiros con los que empieza 
   */
    constructor(scene, x, y, physicsWidthPercent, physicsHeightPercent, shots) {
        super(scene, x, y);

        this.spawnX = x;
        this.spawnY = y;

        this.scene.add.existing(this); 

        // PARÁMETROS
        this.horizontalInput = 0;
        this.lookingAt = 1;
        this.jumpExecuted = false;
        this.canShoot = true;

        this.initSprites();
        this.initPhysics(physicsWidthPercent, physicsHeightPercent);
        this.initInput();   

        this.playerBody.on(Phaser.Animations.Events.ANIMATION_START, 
            (anim) => { 
                if (anim.key == 'spawn') this.setWeaponEnabled(false);
            }
        );

        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'spawn',
            () => { 
                this.changeState(PLAYER_STATES.AIR);
                this.setWeaponEnabled(true);
                this.body.setAllowGravity(true);
            }
        );

        this.playerBody.on(Phaser.Animations.Events.ANIMATION_START, 
            (anim) => { 
                if (anim.key == 'death') this.setWeaponEnabled(false);
            }
        );

        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'death', 
            () => { this.changeState(PLAYER_STATES.SPAWN);});

        this.changeState(PLAYER_STATES.SPAWN);
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
        this.shootFlag = false;

        // esto está con un callback porque el callback me permite registrar el primer down
        // desde el reposo pero 
        this.scene.input.on('pointerdown', pointer => {

            if (pointer.leftButtonDown() && !this.leftClickPressed) {
                this.shootFlag = true;
                this.leftClickPressed = true;
            }
        });
        this.scene.input.on('pointerup', pointer => {

            if (!pointer.leftButtonDown()) {
                this.leftClickPressed = false;
            }
        });
    }

    preUpdate(t,dt) {
        const deltaSeconds = dt / 1000;

        if (this.state !== PLAYER_STATES.DEAD &&
            this.state !== PLAYER_STATES.SPAWN
        ) {  

            switch (this.state) {

                case PLAYER_STATES.GROUNDED:
                    
                    if (!this.body.onFloor()) {
                        this.changeState(PLAYER_STATES.AIR);
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

                        this.changeState(PLAYER_STATES.AIR);

                        this.body.setVelocityY(JUMP_VALUE);
                        
                        // Este boost ocurre solo una vez, por lo tanto no se aplica delta
                        if (this.body.velocity.x != 0) {
                            this.body.setVelocityX(this.moveTowards(this.body.velocity.x, 
                                this.horizontalMaxVelocity * this.horizontalInput, JUMP_HORIZONTAL_BOOST));
                        } 
                    }
                    else if (this.jump.isUp && this.jumpExecuted) this.jumpExecuted = false; 

                break;

                case PLAYER_STATES.AIR:

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
                        this.changeState(PLAYER_STATES.GROUNDED);
                    }

                break;
            }

            // Gestión del arma
            const shootPoint = this.weapon.getWorldTransformMatrix().transformPoint(0., 0.);
            this.pointer.updateWorldPoint(this.scene.cameras.main);

            if (this.shootFlag && this.canShoot) {
                this.handleShoot(shootPoint);
                this.shootFlag = false;
            }
            this.flipAndRotate(shootPoint);
        }
        
    }


    /**
     * Cambia al estado pasado
     * @param {number} newState estado al que se cambia
     */
    changeState(newState) {
        if (newState !== this.state && newState >= 0 && newState < Object.keys(PLAYER_STATES).length) {
            this.state = newState;
            
            switch (this.state) {
                case PLAYER_STATES.GROUNDED: 
            
                    this.shootFlag = false;
                    this.body.setMaxSpeed(GROUND_MAX_SPEED);
                    this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;
                    this.reloadAnimation();

                    break;

                case PLAYER_STATES.AIR: 

                    this.shootFlag = false;
                    this.jumpExecuted = true; 
                    this.body.setMaxSpeed(AIR_MAX_SPEED);
                    this.horizontalMaxVelocity = JUMP_HORIZONTAL_MAX_VELOCITY;

                    this.playerBody.play('jump');

                    break;

                case PLAYER_STATES.SPAWN:
                    this.playerBody.play("spawn");
                    this.setPosition(this.spawnX, this.spawnY);
                    this.body.setVelocity(0)
                    this.body.setAcceleration(0);
                    this.body.setAllowGravity(false);

                    break;

                case PLAYER_STATES.DEAD:
                    
                    this.playerBody.play("death");
                    this.body.setVelocity(0)
                    this.body.setAcceleration(0);
                    this.body.setAllowGravity(false);

                    break;
            }
        }
    }

    /**
     * @param {boolean} enable activar o desactivar el arma
     */
    setWeaponEnabled(enable) {
        this.weapon.setVisible(enable)
        this.weaponBg.setVisible(enable)

        if (enable) {
            const shootPoint = this.weapon.getWorldTransformMatrix().transformPoint(0., 0.);
            this.pointer.updateWorldPoint(this.scene.cameras.main);

            this.flipAndRotate(shootPoint);
        }
    }

    /**
     * Manejado del disparo
     * @param {Phaser.Types.Math.Vector2Like} shootPoint el punto desde donde se dispara
     */
    handleShoot(shootPoint) {

        this.changeState(PLAYER_STATES.AIR);
        
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
        this.canShoot = false;

        this.scene.time.addEvent( {
                delay: SHOOT_INTERVAL, 
                callback: () => { this.canShoot = true; },
                loop: false
        });
    }

    /**
     * Flipea arma y cuerpo y rota el arma según donde apunta el ratón
     * @param {Phaser.Types.Math.Vector2Like} shootPoint el punto desde donde se dispara
     */
    flipAndRotate(shootPoint) {
        
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
        if (this.state == PLAYER_STATES.GROUNDED) {
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