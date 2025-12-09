export default class UIButton extends Phaser.GameObjects.Container {

    /**
   * @param {Phaser.Scene} scene Escena a la que pertenece el botón
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {number} fontSize Tamaño de la fuente del texto del botón
   * @param {string} font Fuente a usar en el texto del botón
   * @param {string} baseColor color por defecto del texto del botón
   * @param {string} highlightColor color por resaltado del texto del botón
   * @param {string} text texto del boton
   * @param {function} callback se llamara al levantar el click izquierdo sobre el boton
   * @param {boolean} animated indica si el botón hace animaciones on hover y on click
   */
    constructor(scene, x, y, fontSize, font, text, callback, baseColor, 
        highlightColor = baseColor, animated = true) {
        super(scene, x, y);

        /** @type {Phaser.GameObjects.Text} */
        this.text = this.scene.add.text(0, 0, text, {
                fontSize: fontSize,
                fontFamily: font,
                fill: baseColor
            }).setInteractive({cursor: 'pointer'})
            .setScrollFactor(0)// Dejar el cacharro en pantalla fijo
            .setDepth(100);

        this.add(this.text);
        this.scene.add.existing(this);
        this.text.setOrigin(0.5);
        this.text.setAlign('center');

        if (animated) {
            this.text.on('pointerover', (pointer) => {
                if (pointer.isDown) {
                    this.setScale(0.8);
                }
                else {
                    this.setScale(1.2);
                }
                this.text.setStyle({fill: highlightColor});
            });

            this.text.on('pointerout', () => {
                this.setScale(1);
                this.text.setStyle({fill: baseColor});
            });

            this.text.on('pointerdown', (pointer, localX, localY, event) => {
                this.setScale(0.8);
                event.stopPropagation(); // no propagar evento en click
                // para no disparar en el player u otras cosas
            });
        }
        
        this.text.on('pointerup', callback);
    }
}