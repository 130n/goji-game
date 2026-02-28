import Phaser from 'phaser';
import { MONSTER_SPRITES, BATTLE_BG } from '../assets/sprites.js';

/**
 * Load an SVG data URL into a Phaser texture via Image element.
 * Phaser's built-in loader doesn't handle data URLs reliably.
 */
function loadSvgTexture(scene, key, dataUrl, width, height) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // Draw onto a canvas at the target size for crisp rendering
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            scene.textures.addCanvas(key, canvas);
            resolve(true);
        };
        img.onerror = () => {
            console.warn(`Failed to load SVG texture: ${key}`);
            resolve(false);
        };
        img.src = dataUrl;
    });
}

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    create() {
        const centerX = 512;
        const centerY = 384;

        // Background
        this.add.rectangle(centerX, centerY, 1024, 768, 0x1a1a2e);

        // Title text
        this.add.text(centerX, centerY - 80, 'KAIJU CLASH', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // "Loading" label
        const loadingText = this.add.text(centerX, centerY + 10, 'LOADING...', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#cccccc',
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = 400;
        const barHeight = 24;
        const barX = centerX - barWidth / 2;
        const barY = centerY + 50;

        this.add.rectangle(centerX, barY + barHeight / 2, barWidth + 4, barHeight + 4, 0x333366)
            .setOrigin(0.5);

        const barFill = this.add.rectangle(barX, barY, 0, barHeight, 0xff6600)
            .setOrigin(0, 0);

        // Load all SVG textures manually (data URLs + Phaser loader don't mix)
        const spriteEntries = Object.entries(MONSTER_SPRITES);
        const total = spriteEntries.length + 1; // +1 for battle bg
        let loaded = 0;

        const onProgress = () => {
            loaded++;
            const pct = loaded / total;
            barFill.width = barWidth * pct;
            loadingText.setText(`LOADING... ${Math.floor(pct * 100)}%`);

            if (loaded >= total) {
                this.time.delayedCall(200, () => {
                    this.scene.start('Menu');
                });
            }
        };

        // Load monster sprites
        for (const [id, url] of spriteEntries) {
            loadSvgTexture(this, `monster_${id}`, url, 120, 150).then(onProgress);
        }

        // Load battle background
        loadSvgTexture(this, 'battle_bg', BATTLE_BG, 1024, 768).then(onProgress);
    }
}
