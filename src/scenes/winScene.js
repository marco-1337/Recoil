import UIButton from '../ui/uiButton.js'
import {addFullscreenButton} from '../utils.js';

/**
 * Escena de victoria. Muestra una animación y tiene un botón para volver al menú principal.
 */
export default class WinScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {

    }

    create() {

        addFullscreenButton(this);

        // Cursor por defecto
        this.input.setDefaultCursor('url(assets/images/recoil_cursor.cur), auto');

        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        let winSprite = this.add.sprite(width/2, height/5 * 2, 'win_sprite')
            .setScrollFactor(0)
            .setScale(1.75);

        // Animación de victoria, estilo GIF
        winSprite.play('win_screen');

        this.continueButton = new UIButton(this, width / 2, height / 5 * 4.25, 54, 'MainFont', 
            'Return to menu →', () => { this.scene.start('MenuScene') }, '#ffffff80', 
            '#800000ff');
    }

    update() {
        
    }
}