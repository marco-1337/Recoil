import UIButton from '../ui/uiButton.js'
import {addFullscreenButton} from '../utils.js';
import {LEVELS_AMMOUNT} from './levelScene.js'

/**
 * Escena de menú.
 * 
 * Lo primero en verse en el juego. Desde aquí se puede empezar una nueva
 * partida o continuar una que esté a medias
 */
export default class MenuScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {}

    /**
     * Añade el logo sin texto y los botones de nueva partida y continuar
     */
    create() {

        addFullscreenButton(this);

        // Cursor por defecto
		this.input.setDefaultCursor('url(assets/images/recoil_cursor.cur), auto');

        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // Logo del juego
        this.add.image(width/2, height/3, 'logo')
            .setScrollFactor(0)
            .setScale(0.5);

        // Lee el almacenamiento local del usuario para saber si tiene partida a medias
        let level = localStorage.getItem("level");

        // Parametros por defecto del boton de continuar
        let continueLabel = "[Continue]";
        let animateContinue = false;
        let continueCallback = () => {};
        let continueColor = '#808080ff';

        // Si existe un nivel guardado válido habilita el botón, si no lo deja "inutilizado"
        if (level && (level > 1 && level < LEVELS_AMMOUNT + 1)) {
            continueLabel = 'Continue: (' + level + ')';
            animateContinue = true
            continueCallback = () => { this.scene.start('LevelScene', {levelID: level})};
            continueColor = '#ffffffff';
        }

        // Ambos botones llaman a iniciar LevelScene, con el nivel donde iniciarla como dato 
        // de llamada

        // Botón de nueva partida
        this.firstButton = new UIButton(this, (width / 4) * 1.25, (height / 7) * 5, 90, 'MainFont', 
            'New game', () => { this.scene.start('LevelScene', {levelID: 1}) }, '#ffffffff', 
            '#ff4040ff');

        // Botón de continuar
        this.secondButton = new UIButton(this, (width / 4) * 2.9, (height / 7) * 5, 90, 'MainFont', 
            continueLabel, continueCallback, continueColor, '#ff0000ff', animateContinue);
    }

    update() {}
}