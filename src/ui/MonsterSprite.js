import Phaser from 'phaser';
import { getIdleFrameKeys, MONSTER_ANIMS } from '../config/animations.js';

const CATEGORY_COLORS = {
    balanced: 0x4488ff,
    tank: 0x44aa44,
    speed: 0xffaa22,
    bruiser: 0xff4444,
    charger: 0xaa44ff,
};

const SPRITE_WIDTH = 120;
const SPRITE_HEIGHT = 150;
const LUNGE_DISTANCE = 40;

export class MonsterSprite {
    /**
     * Visual wrapper for a monster on the battle screen.
     *
     * @param {Phaser.Scene} scene
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {object} monsterData - Entry from MONSTERS
     * @param {'left'|'right'} facing - Direction the monster faces
     */
    constructor(scene, x, y, monsterData, facing) {
        this.scene = scene;
        this.baseX = x;
        this.baseY = y;
        this.monsterData = monsterData;
        this.facing = facing;
        this.useSprite = false;

        // Check for animation frames
        this.frameKeys = getIdleFrameKeys(monsterData.id);
        this._animTimer = null;
        this._frameIdx = 0;

        const spriteKey = this.frameKeys ? this.frameKeys[0] : `monster_${monsterData.id}`;
        if (scene.textures.exists(spriteKey)) {
            this.body = scene.add.image(x, y, spriteKey).setOrigin(0.5, 0.5);
            // Scale to fit within SPRITE_WIDTH x SPRITE_HEIGHT keeping aspect ratio
            const tex = scene.textures.get(spriteKey);
            const srcW = tex.getSourceImage().width;
            const srcH = tex.getSourceImage().height;
            this._baseScale = Math.min(SPRITE_WIDTH / srcW, SPRITE_HEIGHT / srcH);
            this.body.setScale(this._baseScale);
            this.useSprite = true;
        } else {
            const color = CATEGORY_COLORS[monsterData.category] || 0x888888;
            this.body = scene.add.rectangle(x, y, SPRITE_WIDTH, SPRITE_HEIGHT, color)
                .setOrigin(0.5, 0.5);
        }

        // Flip for facing direction
        this.setFlipped(facing);

        // Monster name below the body
        this.nameText = scene.add.text(x, y + SPRITE_HEIGHT / 2 + 10, monsterData.name, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5, 0);

        // Category label below the name
        this.categoryText = scene.add.text(x, y + SPRITE_HEIGHT / 2 + 34, monsterData.category.toUpperCase(), {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
        }).setOrigin(0.5, 0);

        // Start idle animation
        this.playIdleAnimation();
    }

    playAttackAnimation() {
        const direction = this.facing === 'right' ? 1 : -1;
        const targetX = this.baseX + LUNGE_DISTANCE * direction;

        this.scene.tweens.add({
            targets: this.body,
            x: targetX,
            duration: 120,
            ease: 'Power2',
            yoyo: true,
        });
    }

    playHitAnimation() {
        const recoilDirection = this.facing === 'right' ? -1 : 1;

        // Flash red via tint (works for both images and rectangles)
        if (this.useSprite) {
            this.body.setTint(0xff0000);
            this.scene.time.delayedCall(200, () => {
                this.body.clearTint();
            });
        } else {
            const originalColor = CATEGORY_COLORS[this.monsterData.category] || 0x888888;
            this.body.fillColor = 0xff0000;
            this.scene.time.delayedCall(200, () => {
                this.body.fillColor = originalColor;
            });
        }

        // Recoil
        this.scene.tweens.add({
            targets: this.body,
            x: this.baseX + 12 * recoilDirection,
            duration: 100,
            ease: 'Power1',
            yoyo: true,
        });
    }

    playIdleAnimation() {
        if (this._idleTween) {
            this._idleTween.stop();
        }

        this._idleTween = this.scene.tweens.add({
            targets: this.body,
            y: this.baseY - 4,
            duration: 1200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });

        // Start frame animation if available
        this._startFrameAnim();
    }

    _startFrameAnim() {
        if (this._animTimer) {
            this._animTimer.remove();
            this._animTimer = null;
        }

        if (!this.frameKeys || this.frameKeys.length < 2) return;

        const anim = MONSTER_ANIMS[this.monsterData.id];
        this._frameIdx = 0;
        this._animTimer = this.scene.time.addEvent({
            delay: 1000 / (anim?.frameRate || 6),
            loop: true,
            callback: () => {
                this._frameIdx = (this._frameIdx + 1) % this.frameKeys.length;
                const key = this.frameKeys[this._frameIdx];
                if (this.body && this.scene.textures.exists(key)) {
                    this.body.setTexture(key);
                    const tex = this.scene.textures.get(key);
                    const srcW = tex.getSourceImage().width;
                    const srcH = tex.getSourceImage().height;
                    this._baseScale = Math.min(SPRITE_WIDTH / srcW, SPRITE_HEIGHT / srcH);
                    this.body.setScale(this._baseScale);
                }
            },
        });
    }

    setFlipped(facing) {
        this.facing = facing;
        if (this.useSprite) {
            this.body.setFlipX(facing === 'left');
        } else {
            this.body.setScale(facing === 'left' ? -1 : 1, 1);
        }
    }

    getDisplayHeight() {
        if (this.useSprite) {
            return this.body.displayHeight;
        }
        return SPRITE_HEIGHT;
    }

    destroy() {
        if (this._idleTween) {
            this._idleTween.stop();
            this._idleTween = null;
        }
        if (this._animTimer) {
            this._animTimer.remove();
            this._animTimer = null;
        }
        this.body.destroy();
        this.nameText.destroy();
        this.categoryText.destroy();
    }
}
