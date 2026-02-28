import Phaser from 'phaser';

export class HealthBar {
    /**
     * Reusable HP bar component.
     * @param {Phaser.Scene} scene
     * @param {number} x - Left edge x position
     * @param {number} y - Top edge y position
     * @param {number} width - Total bar width in pixels
     * @param {number} height - Bar height in pixels
     * @param {number} maxHp - Maximum hit points
     * @param {number} [color=0x44ff44] - Foreground bar color
     */
    constructor(scene, x, y, width, height, maxHp, color = 0x44ff44) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.color = color;

        // Dark red background
        this.bg = scene.add.rectangle(x, y, width, height, 0x440000)
            .setOrigin(0, 0);

        // Colored foreground (shrinks with damage)
        this.bar = scene.add.rectangle(x, y, width, height, color)
            .setOrigin(0, 0);

        // HP text centered on the bar
        this.text = scene.add.text(x + width / 2, y + height / 2, '', {
            fontSize: `${Math.max(12, height - 4)}px`,
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5, 0.5);

        this._updateText();
    }

    /**
     * Animate the bar to reflect a new HP value.
     * @param {number} current - New current HP (clamped to 0..maxHp)
     */
    setHp(current) {
        this.currentHp = Phaser.Math.Clamp(current, 0, this.maxHp);
        const targetWidth = (this.currentHp / this.maxHp) * this.width;

        this.scene.tweens.add({
            targets: this.bar,
            displayWidth: targetWidth,
            duration: 300,
            ease: 'Power2',
        });

        this._updateText();
    }

    /** @private */
    _updateText() {
        this.text.setText(`HP: ${this.currentHp}/${this.maxHp}`);
    }

    /** Remove all game objects from the scene. */
    destroy() {
        this.bg.destroy();
        this.bar.destroy();
        this.text.destroy();
    }
}
