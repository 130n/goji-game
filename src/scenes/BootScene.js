import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    create() {
        this.add.text(512, 340, 'KAIJU CLASH', {
            fontSize: '72px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(512, 420, 'MONSTER FIGHTING GAME', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#cc8844',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // Show title briefly then transition to Preload
        this.time.delayedCall(800, () => {
            this.scene.start('Preload');
        });
    }
}
