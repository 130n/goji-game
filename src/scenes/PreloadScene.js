import Phaser from 'phaser';
import { MONSTERS } from '../config/monsters.js';
import { MONSTER_ANIMS } from '../config/animations.js';
import { BATTLE_BG } from '../assets/sprites.js';

/**
 * Load an SVG data URL into a Phaser texture via Image element.
 * Phaser's built-in loader doesn't handle data URLs reliably.
 */
function loadSvgTexture(scene, key, dataUrl, width, height) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
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

    preload() {
        const centerX = 512;
        const centerY = 384;

        // Background
        this.add.rectangle(centerX, centerY, 1024, 768, 0x2a3050);

        // Title text
        this.add.text(centerX, centerY - 80, 'KAIJU CLASH', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // "Loading" label
        this._loadingText = this.add.text(centerX, centerY + 10, 'LOADING...', {
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

        this._barFill = this.add.rectangle(barX, barY, 0, barHeight, 0xff6600)
            .setOrigin(0, 0);

        // Progress events from Phaser loader
        this.load.on('progress', (value) => {
            this._barFill.width = barWidth * value;
            this._loadingText.setText(`LOADING... ${Math.floor(value * 100)}%`);
        });

        // Load PNG sprites for all monsters from public/sprites/
        const monsterIds = Object.keys(MONSTERS);
        for (const id of monsterIds) {
            this.load.image(`monster_${id}`, `sprites/${id}.png`);
        }

        // Load animation frames (monsters that have them)
        for (const [id, anim] of Object.entries(MONSTER_ANIMS)) {
            for (let i = 0; i < anim.idle; i++) {
                this.load.image(`anim_${id}_idle_${i}`, `sprites/anim/${id}_idle_${i}.png`);
            }
        }
    }

    create() {
        // Set NEAREST filter for pixel art sprites (crisp upscaling)
        const monsterIds = Object.keys(MONSTERS);
        for (const id of monsterIds) {
            const key = `monster_${id}`;
            if (this.textures.exists(key)) {
                this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
        }

        // Set NEAREST filter on animation frames too
        for (const [id, anim] of Object.entries(MONSTER_ANIMS)) {
            for (let i = 0; i < anim.idle; i++) {
                const key = `anim_${id}_idle_${i}`;
                if (this.textures.exists(key)) {
                    this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
                }
            }
        }

        // Load battle background SVG (no PNG version yet)
        loadSvgTexture(this, 'battle_bg', BATTLE_BG, 1024, 768).then(() => {
            this.time.delayedCall(200, () => {
                this.scene.start('Menu');
            });
        });
    }
}
