const HORIZONTAL_GROUND_ACCELERATION = 7000;
const HORIZONTAL_GROUND_DECELERATION = 8500;
const GROUND_HORIZONTAL_MAX_VELOCITY = 650;
const JUMP_HORIZONTAL_BOOST = 100;
const JUMP_HORIZONTAL_MAX_VELOCITY = 750;
const UNBOOSTED_MAX_SPEED = 1200;
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

export default class Player extends Phaser.GameObjects.Container  {

    /**
   * Constructor de la Plataforma
   * @param {Phaser.Scene} scene Escena a la que pertenece la plataforma
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} physicsWidthPercent Del 0 al 1, tamaño horizontal de la hitbox relativo al sprite 
   * @param {number} physicsHeightPercent Del 0 al 1, tamaño vertical de la hitbox relativo al sprite, la cantidad eliminada es quitada de la parte de arriba del sprite
   */
    constructor(scene, x, y, physicsWidthPercent, physicsHeightPercent) {
        super(scene, x, y);
        this.scene.add.existing(this); 

		this.scene.anims.create({
			key: 'background_weapon',
			frames: scene.anims.generateFrameNumbers('weapon', {start:1, end:1}),
			frameRate: 1000,
			repeat: -1
		});


    // FONDO DEL ARMA
        // Hay que añadirlo el primero porque si no phaser llora
        this.weaponBg = scene.add.sprite(0, 0, 'weapon');
        this.add(this.weaponBg);
        this.weaponBg.play('background_weapon');

    // CUERPO DEL JUADOR

        this.sprite = scene.add.sprite(0, 0, 'player');
        this.sprite.setDepth(10);
        this.add(this.sprite);

    // ANIMACIONES

        this.lookingAt = 1;
        this.grounded = false;

        this.scene.anims.create({
			key: 'idle',
			frames: scene.anims.generateFrameNumbers('player', {start:0, end:0}),
			frameRate: 5,
			repeat: -1
		});
		this.scene.anims.create({
			key: 'jump',
			frames: scene.anims.generateFrameNumbers('player', {start:1, end:1}),
			frameRate: 18,
			repeat: 0
		});
		this.scene.anims.create({
			key: 'run',
			frames: scene.anims.generateFrameNumbers('player', {start:2, end:6}),
			frameRate: 24,
			repeat: -1
		});
        this.scene.anims.create({
			key: 'runBackwards',
			frames: scene.anims.generateFrameNumbers('player', {start:6, end:2}),
			frameRate: 24,
			repeat: -1
		});

        this.sprite.play('idle');

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
        this.body.setSize(this.sprite.displayWidth * physicsWidthPercent, this.sprite.displayHeight * physicsHeightPercent);

        console.log(this.sprite.height, this.sprite.x - this.body.position.x, this.sprite.y - this.body.position.y);

        this.body.setOffset(-this.body.width/2, -this.body.height/2 + (this.sprite.displayHeight * (1-physicsHeightPercent))/2);

        this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;

        this.body.setMaxSpeed(UNBOOSTED_MAX_SPEED);

    // INPUT HORIZONTAL

        this.left = this.scene.input.keyboard.addKey('A');
        this.right = this.scene.input.keyboard.addKey('D');

        this.horizontalInput = 0;

        this.left.on('down', () => {
            this.addDirection(-1);
        });

        this.left.on('up', () => {
            this.addDirection(1);
        });

        this.right.on('down', () => {
            this.addDirection(1);
        });

        this.right.on('up', () => {
            this.addDirection(-1);
        });

    // INPUT SALTO

        this.jump = this.scene.input.keyboard.addKey('SPACE');
        this.jumpExecuted = false;

    // INPUT RATON

        this.pointer = this.scene.input.activePointer;

    // AÑADIR ARMA

        this.scene.anims.create({
			key: 'front_weapon',
			frames: scene.anims.generateFrameNumbers('weapon', {start:0, end:0}),
			frameRate: 1000,
			repeat: -1
		});

        this.weapon = scene.add.sprite(0, 0, 'weapon');
        this.add(this.weapon);
        this.weapon.play('front_weapon');
    }



    /**
    * @param {number} dir Direccion (1 o -1)
    **/
    addDirection(n) {
        this.horizontalInput += n;

        this.checkDirectionAnim();
    }

    checkDirectionAnim() {
        if (this.body.blocked.down) {
            let anim;

            if (this.horizontalInput !== 0) {
                anim = (this.lookingAt === this.horizontalInput) ? 'run' : 'runBackwards';
            }
            else {
                anim = 'idle';
            }
            this.sprite.play(anim);
        }
    }

    ground() {
        if (!this.grounded) {
            this.grounded = true;
            this.horizontalMaxVelocity = GROUND_HORIZONTAL_MAX_VELOCITY;
            this.checkDirectionAnim();
        }
    }

    preUpdate(t,dt) {
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

            this.sprite.play('jump');

            this.jumpExecuted = true; 
            this.grounded = false;
            this.body.setVelocityY(JUMP_VALUE);
            this.horizontalMaxVelocity = JUMP_HORIZONTAL_MAX_VELOCITY;

            if (this.body.velocity.x != 0) {
                this.body.setVelocityX(moveTowards(this.body.velocity.x, this.horizontalMaxVelocity * this.horizontalInput, JUMP_HORIZONTAL_BOOST));
            }
        }
        else if (this.body.blocked.down) {

            this.ground();

            if (!this.jump.isDown) {
                this.jumpExecuted = false; 
            }
        }

        // Direccion

        if (this.pointer.worldX < this.x) {
            this.lookingAt = -1;
            this.sprite.setFlipX(true);
        }
        else 
        {
            this.lookingAt = 1;
            this.sprite.setFlipX(false);
        }
    }
}