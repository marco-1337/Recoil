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
const MAX_AMMO = 3;

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
   * @param {Phaser.GameObjects.Sprite} shotSprite
   * @param {number} shots Cantidad de tiros con los que empieza 
   */
    constructor(scene, x, y, physicsWidthPercent, physicsHeightPercent) {
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
        this.initAnimationsCallbacks();
        this.initMunitionUI();
        this.initSoundEffects();
    }

    destroy(fromScene) {

        if (this.shotSprite) {
            this.shotSprite.destroy(fromScene);
            this.shotSprite = null;
        }

        super.destroy(fromScene);
    }

    /**
     * Recoloca al jugador en un nuevo punto de spawn y lo spawnea ahí
     * @param {number} x 
     * @param {number} y 
     * @param {number} shots
     */
    setup(x, y, shots) {

        console.log(shots);

        this.spawnX = x;
        this.spawnY = y;

        this.setPosition(x, y);

        this.defaultShots = shots;

        if (this.UIMunition.length <= this.defaultShots) 
            this.defaultShots = this.UIMunition.length;
        else if ( this.defaultShots < 0) this.defaultShots = 0;

        this.changeState(PLAYER_STATES.SPAWN);
    }

    initSprites() {
        // SPRITE DE FONDO DEL ARMA
        this.setDepth(1);

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

        // EFFECTO DE DISPARO
        // No es parte del container porque quiero que se vea el efecto donde se ha disparado

        this.shootEffect = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'shoot_effect', 0);
        this.scene.add.existing(this.shootEffect);
        this.shootEffect.setActive(false);
        this.shootEffect.setVisible(false);
        this.shootEffect.setDepth(5);
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

    initAnimationsCallbacks() {

        // Deshabilitar sprites de brazos en el spawn
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_START, 
            (anim) => { 
                if (anim.key == 'spawn') this.setWeaponEnabled(false);
            }
        );

        // Habilitar sprites de brazos en el spawn
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'spawn',
            () => { 
                this.changeState(PLAYER_STATES.AIR);
                this.setWeaponEnabled(true);
                this.body.setAllowGravity(true);
            }
        );

        // Deshabilitar sprites de brazos en la muerte
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_START, 
            (anim) => { 
                if (anim.key == 'death') this.setWeaponEnabled(false);
            }
        );
        
        // Cambiar a spawn despues de morir visiblemente, esto se hace reseteando el nivel
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'death', 
            () => { this.scene.resetLevel()});

        // Desactivar sprite de efecto de tiro al terminar animación
        this.shootEffect.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'shoot',
            () => {
                this.shootEffect.setActive(false);
                this.shootEffect.setVisible(false);
            }
        );
    }

    initMunitionUI() {

        const width = this.scene.sys.game.config.width;
        const height = this.scene.sys.game.config.height;

        this.UIMunition = [];

        const texture = this.scene.textures.get('munition_UI');
        const iconWidth = texture.getSourceImage().width;
        const iconHeight = texture.getSourceImage().height;

        for (let i = 0; i < MAX_AMMO; ++i) {
            this.UIMunition.push(this.scene.add.image(iconWidth * 2.5 + iconWidth * 2.5 * i, 
                iconHeight, 'munition_UI')
                .setScrollFactor(0)
                .setDepth(100)
                .setScale(1.5)
                .setRotation(Phaser.Math.DegToRad(33))
                .setVisible(false));
        }
    }

    initSoundEffects() {
        this.deathSoundEffect = this.scene.sound.add('death', { loop: false });
		this.deathSoundEffect.setVolume(0.2);

        this.shootSoundEffect = this.scene.sound.add('shoot', { loop: false });
		this.shootSoundEffect.setVolume(0.1);
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

            if (this.shootFlag && this.canShoot && this.shots > 0) {
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
                    this.playerBody.play('spawn');
                    this.setPosition(this.spawnX, this.spawnY);
                    this.body.setVelocity(0)
                    this.body.setAcceleration(0);
                    this.body.setAllowGravity(false);

                    this.shots = this.defaultShots;
                    this.setCurrentMunitionVisible();
                    
                    break;

                case PLAYER_STATES.DEAD:
                    
                    this.deathSoundEffect.play();
                    this.playerBody.play('death');
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
        
        this.shootSoundEffect.play();

        const angle = Phaser.Math.Angle.Between(shootPoint.x, shootPoint.y, 
            this.pointer.worldX, this.pointer.worldY);
            
        // Como minimo siempre impulsa el retroceso de la escopeta, pero
        // si ya se lleva una velocidad fevorable al disparo, se suma. 
        // (Esto se hace en el setLength)
        //
        // Las velocidad en contra del tiro no se opone
        let impulse = new Phaser.Math.Vector2((this.body.velocity.x/2 - (Math.cos(angle) * SHOOT_VALUE)),
            this.body.velocity.y/2 - (Math.sin(angle) * SHOOT_VALUE));
        impulse.setLength(Math.max(SHOOT_VALUE, impulse.length()));

        this.body.setVelocity(impulse.x, impulse.y);
        this.canShoot = false;

        this.shots -= 1;
        this.UIMunition[this.shots].setVisible(false);

        this.scene.time.addEvent( {
                delay: SHOOT_INTERVAL, 
                callback: () => { this.canShoot = true; },
                loop: false
        });

        this.setShootEffect(angle);
    }

    setCurrentMunitionVisible() {


        let i;

        for (i = 0; i < this.shots && i < this.UIMunition.length; ++i) {
            this.UIMunition[i].setVisible(true);
        }

        for (; i < this.UIMunition.length; ++i) {
            this.UIMunition[i].setVisible(false);
        }
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
     * 
     * @param {number} rot rotacion del arma
     */
    setShootEffect(rot) {

        let angleVec = new Phaser.Math.Vector2(0, 0);
        angleVec.setToPolar(rot, 120);
        let effectPos = this.weapon.getWorldTransformMatrix().transformPoint(0., 0.);

        // Esto se hace porque effectPos += vec no debería funcionar, supongo que porque
        // effectPos es un vector2Alike, y no un vector2
        effectPos.x += angleVec.x;
        effectPos.y += angleVec.y;

        this.shootEffect.setActive(true);
        this.shootEffect.setVisible(true);
        this.shootEffect.setPosition(effectPos.x, effectPos.y);
        this.shootEffect.setRotation(rot);
        this.shootEffect.play('shoot');
    }

    /**
     * 
     * @param {number} munition
     */
    setMunition(munition) {
        this.shots = Phaser.Math.Clamp(munition, 0, MAX_AMMO);
        this.setCurrentMunitionVisible();
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