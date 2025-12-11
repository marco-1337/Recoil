import UIButton from '../ui/uiButton.js'
import {addFullscreenButton} from '../utils.js';
import {LEVELS_AMMOUNT} from './levelScene.js'

export default class MenuScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {

    }

    create() {

        addFullscreenButton(this);

        // Cursor por defecto
		this.input.setDefaultCursor('url(assets/images/recoil_cursor.cur), auto');

        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        const img = this.add.image(width/2, height/3, 'logo')
            .setScrollFactor(0)
            .setScale(0.5);

        let level = localStorage.getItem("level");

        let continueLabel = "[Continue]";
        let animateContinue = false;
        let continueCallback = () => {};
        let continueColor = '#808080ff';

        console.log(level);

        if (level && (level > 1 && level < LEVELS_AMMOUNT + 1)) {

            continueLabel = 'Continue: (' + level + ')';
            animateContinue = true
            continueCallback = () => { this.scene.start('LevelScene', {levelID: level})};
            continueColor = '#ffffffff';
        }

        this.firstButton = new UIButton(this, (width / 4) * 1.25, (height / 7) * 5, 90, 'MainFont', 
            'New game', () => { this.scene.start('LevelScene', {levelID: 1}) }, '#ffffffff', 
            '#ff4040ff');

        this.secondButton = new UIButton(this, (width / 4) * 2.9, (height / 7) * 5, 90, 'MainFont', 
            continueLabel, continueCallback, continueColor, '#ff0000ff', animateContinue);
    }

    update() {
        
    }
}