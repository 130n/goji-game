import Phaser from 'phaser';
import { MONSTERS } from '../config/monsters.js';
import { getIdleFrameKeys, MONSTER_ANIMS } from '../config/animations.js';

const CATEGORY_COLORS = {
    balanced: 0x4488ff,
    tank: 0x44aa44,
    speed: 0xffaa22,
    bruiser: 0xff4444,
    charger: 0xaa44ff,
};

const CARD_WIDTH = 160;
const CARD_HEIGHT = 140;
const CARD_GAP_X = 20;
const CARD_GAP_Y = 12;
const GRID_COLS = 3;
const SPRITE_MAX_W = 55;
const SPRITE_MAX_H = 55;

const GRID_CENTER_X = 512;
const P1_PREVIEW_X = 126;
const P2_PREVIEW_X = 898;
const PREVIEW_Y = 320;
const PREVIEW_SPRITE_MAX = 120;

const SEL_STATE = {
    P1_SELECTING: 'P1_SELECTING',
    P2_SELECTING: 'P2_SELECTING',
    READY: 'READY',
};

export class SelectScene extends Phaser.Scene {
    constructor() {
        super('Select');
    }

    init(data) {
        this.mode = data.mode || 'local';
        this.aiDifficulty = data.aiDifficulty || null;
    }

    create() {
        this.monsterList = Object.values(MONSTERS);

        this.add.rectangle(512, 384, 1024, 768, 0x2a3050);

        this.add.text(GRID_CENTER_X, 40, 'SELECT YOUR MONSTER', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.selectionState = SEL_STATE.P1_SELECTING;
        this.p1CursorIndex = 0;
        this.p2CursorIndex = 0;
        this.p1Selection = null;
        this.p2Selection = null;

        this.cursorBlinkTween = null;

        this.cards = [];
        this.createGrid();
        this.createPreviewPanels();
        this.createSelectionInfo();
        this.createFightButton();
        this.createInstructions();
        this.setupInput();
        this.updateCursors();
    }

    createGrid() {
        const gridWidth = GRID_COLS * CARD_WIDTH + (GRID_COLS - 1) * CARD_GAP_X;
        const startX = GRID_CENTER_X - gridWidth / 2 + CARD_WIDTH / 2;
        const startY = 100 + CARD_HEIGHT / 2;

        for (let i = 0; i < this.monsterList.length; i++) {
            const monster = this.monsterList[i];
            const col = i % GRID_COLS;
            const row = Math.floor(i / GRID_COLS);
            const x = startX + col * (CARD_WIDTH + CARD_GAP_X);
            const y = startY + row * (CARD_HEIGHT + CARD_GAP_Y);
            this.cards.push(this.createCard(x, y, monster, i));
        }
    }

    createCard(x, y, monster, index) {
        const categoryColor = CATEGORY_COLORS[monster.category] || 0x888888;

        const bg = this.add.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x334466)
            .setStrokeStyle(2, 0x556688);

        const stripe = this.add.rectangle(x, y - CARD_HEIGHT / 2 + 8, CARD_WIDTH - 8, 14, categoryColor)
            .setAlpha(0.8);

        const spriteKey = `monster_${monster.id}`;
        if (this.textures.exists(spriteKey)) {
            const img = this.add.image(x, y - 18, spriteKey).setOrigin(0.5);
            const tex = this.textures.get(spriteKey);
            const scale = Math.min(SPRITE_MAX_W / tex.getSourceImage().width, SPRITE_MAX_H / tex.getSourceImage().height);
            img.setScale(scale);
        }

        const nameText = this.add.text(x, y + 22, monster.name, {
            fontSize: '14px', fontFamily: 'monospace', color: '#ffffff',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5);

        const statsText = this.add.text(x, y + 40, `HP:${monster.hp} DMG:${monster.baseDamage} SPD:${monster.speedBonus}`, {
            fontSize: '10px', fontFamily: 'monospace', color: '#aaaacc',
        }).setOrigin(0.5);

        const catText = this.add.text(x, y + 56, monster.category.toUpperCase(), {
            fontSize: '10px', fontFamily: 'monospace',
            color: Phaser.Display.Color.IntegerToColor(categoryColor).rgba,
        }).setOrigin(0.5);

        const p1Border = this.add.rectangle(x, y, CARD_WIDTH + 6, CARD_HEIGHT + 6)
            .setStrokeStyle(3, 0x4488ff).setFillStyle().setAlpha(0);
        const p2Border = this.add.rectangle(x, y, CARD_WIDTH + 6, CARD_HEIGHT + 6)
            .setStrokeStyle(3, 0xff4444).setFillStyle().setAlpha(0);
        const p1Cursor = this.add.rectangle(x, y, CARD_WIDTH + 10, CARD_HEIGHT + 10)
            .setStrokeStyle(2, 0x66ccff).setFillStyle().setAlpha(0);
        const p2Cursor = this.add.rectangle(x, y, CARD_WIDTH + 10, CARD_HEIGHT + 10)
            .setStrokeStyle(2, 0xff6666).setFillStyle().setAlpha(0);

        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => this.onCardClicked(index));
        bg.on('pointerover', () => this.onCardHover(index));

        return { x, y, bg, stripe, nameText, statsText, catText, p1Border, p2Border, p1Cursor, p2Cursor, monster, index };
    }

    // ----------------------------------------------------------------
    // PREVIEW PANELS
    // ----------------------------------------------------------------

    createPreviewPanels() {
        this.p1Preview = this.createSinglePreview(P1_PREVIEW_X, 'PLAYER 1', '#66ccff', 0x4488ff);
        this.p2Preview = this.createSinglePreview(P2_PREVIEW_X, 'PLAYER 2', '#ff6666', 0xff4444);
    }

    createSinglePreview(px, label, labelColor, borderColor) {
        const py = PREVIEW_Y;
        const panel = {
            px, py,
            bg: this.add.rectangle(px, py, 200, 340, 0x283048)
                .setStrokeStyle(2, 0x445577).setAlpha(0),
            playerLabel: this.add.text(px, py - 155, label, {
                fontSize: '16px', fontFamily: 'monospace',
                color: labelColor, stroke: '#000000', strokeThickness: 2,
            }).setOrigin(0.5).setAlpha(0),
            sprite: null,
            nameText: this.add.text(px, py + 85, '', {
                fontSize: '18px', fontFamily: 'monospace',
                color: '#ffffff', stroke: '#000000', strokeThickness: 3,
            }).setOrigin(0.5).setAlpha(0),
            categoryText: this.add.text(px, py + 110, '', {
                fontSize: '12px', fontFamily: 'monospace', color: '#aaaaaa',
            }).setOrigin(0.5).setAlpha(0),
            statsText: this.add.text(px, py + 130, '', {
                fontSize: '11px', fontFamily: 'monospace', color: '#aaaacc',
                align: 'center',
            }).setOrigin(0.5).setAlpha(0),
        };
        return panel;
    }

    updateSinglePreview(panel, monster, flipX) {
        if (panel.sprite) {
            panel.sprite.destroy();
            panel.sprite = null;
        }
        if (panel.animTimer) {
            panel.animTimer.remove();
            panel.animTimer = null;
        }

        if (!monster) {
            panel.bg.setAlpha(0);
            panel.playerLabel.setAlpha(0);
            panel.nameText.setAlpha(0);
            panel.categoryText.setAlpha(0);
            panel.statsText.setAlpha(0);
            return;
        }

        const { px, py } = panel;
        const spriteKey = `monster_${monster.id}`;
        const frameKeys = getIdleFrameKeys(monster.id);

        panel.bg.setAlpha(1);
        panel.playerLabel.setAlpha(1);

        // Use first animation frame if available, otherwise static sprite
        const displayKey = frameKeys ? frameKeys[0] : spriteKey;

        if (this.textures.exists(displayKey)) {
            panel.sprite = this.add.image(px, py - 20, displayKey).setOrigin(0.5);
            const tex = this.textures.get(displayKey);
            const srcW = tex.getSourceImage().width;
            const srcH = tex.getSourceImage().height;
            const scale = Math.min(PREVIEW_SPRITE_MAX / srcW, PREVIEW_SPRITE_MAX / srcH);
            panel.sprite.setScale(scale);
            if (flipX) panel.sprite.setFlipX(true);

            // Start frame animation if available
            if (frameKeys && frameKeys.length > 1) {
                const anim = MONSTER_ANIMS[monster.id];
                let frameIdx = 0;
                panel.animTimer = this.time.addEvent({
                    delay: 1000 / (anim?.frameRate || 6),
                    loop: true,
                    callback: () => {
                        frameIdx = (frameIdx + 1) % frameKeys.length;
                        if (panel.sprite && this.textures.exists(frameKeys[frameIdx])) {
                            panel.sprite.setTexture(frameKeys[frameIdx]);
                            // Recompute scale for this frame (frames may differ slightly in size)
                            const t = this.textures.get(frameKeys[frameIdx]);
                            const sw = t.getSourceImage().width;
                            const sh = t.getSourceImage().height;
                            const s = Math.min(PREVIEW_SPRITE_MAX / sw, PREVIEW_SPRITE_MAX / sh);
                            panel.sprite.setScale(s);
                        }
                    },
                });
            }
        }

        const catColor = CATEGORY_COLORS[monster.category] || 0x888888;
        panel.nameText.setText(monster.name).setAlpha(1);
        panel.categoryText
            .setText(monster.category.toUpperCase())
            .setColor(Phaser.Display.Color.IntegerToColor(catColor).rgba)
            .setAlpha(1);
        panel.statsText
            .setText(`HP: ${monster.hp}  DMG: ${monster.baseDamage}\nSPD: ${monster.speedBonus}x`)
            .setAlpha(1);
    }

    updatePreviews() {
        // P1 preview: show cursor during P1_SELECTING, locked selection after
        const p1Monster = this.selectionState === SEL_STATE.P1_SELECTING
            ? this.monsterList[this.p1CursorIndex]
            : this.p1Selection;
        this.updateSinglePreview(this.p1Preview, p1Monster, false);

        // P2 preview: show cursor during P2_SELECTING, locked selection after, hidden before
        let p2Monster = null;
        if (this.selectionState === SEL_STATE.P2_SELECTING) {
            p2Monster = this.monsterList[this.p2CursorIndex];
        } else if (this.selectionState === SEL_STATE.READY) {
            p2Monster = this.p2Selection;
        }
        this.updateSinglePreview(this.p2Preview, p2Monster, true);
    }

    // ----------------------------------------------------------------
    // SELECTION INFO & BUTTONS
    // ----------------------------------------------------------------

    createSelectionInfo() {
        this.selectionInfoText = this.add.text(512, 575, '', {
            fontSize: '22px', fontFamily: 'monospace',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.instructionText = this.add.text(512, 610, '', {
            fontSize: '16px', fontFamily: 'monospace', color: '#888899',
        }).setOrigin(0.5);

        this.updateSelectionInfo();
    }

    createFightButton() {
        this.fightButton = this.add.text(512, 660, 'FIGHT!', {
            fontSize: '36px', fontFamily: 'monospace',
            color: '#ff6600', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

        this.fightButton.on('pointerdown', () => {
            if (this.selectionState === SEL_STATE.READY) this.startBattle();
        });
        this.fightButton.on('pointerover', () => {
            if (this.selectionState === SEL_STATE.READY) this.fightButton.setColor('#ffaa00');
        });
        this.fightButton.on('pointerout', () => this.fightButton.setColor('#ff6600'));
    }

    createInstructions() {
        this.controlHint = this.add.text(512, 740, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#555577',
        }).setOrigin(0.5);
        this.updateControlHint();
    }

    // ----------------------------------------------------------------
    // INPUT
    // ----------------------------------------------------------------

    setupInput() {
        this.input.keyboard.on('keydown-W', () => this.moveCursor('up'));
        this.input.keyboard.on('keydown-S', () => this.moveCursor('down'));
        this.input.keyboard.on('keydown-A', () => this.moveCursor('left'));
        this.input.keyboard.on('keydown-D', () => this.moveCursor('right'));
        this.input.keyboard.on('keydown-SPACE', () => this.confirmCurrent());

        this.input.keyboard.on('keydown-UP', () => this.moveCursor('up'));
        this.input.keyboard.on('keydown-DOWN', () => this.moveCursor('down'));
        this.input.keyboard.on('keydown-LEFT', () => this.moveCursor('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.moveCursor('right'));
        this.input.keyboard.on('keydown-ENTER', () => this.confirmCurrent());

        this.input.keyboard.on('keydown-ESC', () => this.goBack());
    }

    moveCursor(direction) {
        if (this.selectionState === SEL_STATE.READY) return;

        const isP1 = this.selectionState === SEL_STATE.P1_SELECTING;
        let idx = isP1 ? this.p1CursorIndex : this.p2CursorIndex;
        const col = idx % GRID_COLS;
        const row = Math.floor(idx / GRID_COLS);
        const rows = Math.ceil(this.monsterList.length / GRID_COLS);

        switch (direction) {
            case 'up':    if (row > 0) idx -= GRID_COLS; break;
            case 'down':  if (row < rows - 1 && idx + GRID_COLS < this.monsterList.length) idx += GRID_COLS; break;
            case 'left':  if (col > 0) idx -= 1; break;
            case 'right': if (col < GRID_COLS - 1 && idx + 1 < this.monsterList.length) idx += 1; break;
        }

        if (isP1) this.p1CursorIndex = idx;
        else this.p2CursorIndex = idx;
        this.updateCursors();
    }

    onCardHover(index) {
        if (this.selectionState === SEL_STATE.P1_SELECTING) this.p1CursorIndex = index;
        else if (this.selectionState === SEL_STATE.P2_SELECTING) this.p2CursorIndex = index;
        this.updateCursors();
    }

    onCardClicked(index) {
        if (this.selectionState === SEL_STATE.P1_SELECTING) {
            if (this.p1CursorIndex === index) {
                this.confirmCurrent();
            } else {
                this.p1CursorIndex = index;
                this.updateCursors();
            }
        } else if (this.selectionState === SEL_STATE.P2_SELECTING) {
            if (this.p2CursorIndex === index) {
                this.confirmCurrent();
            } else {
                this.p2CursorIndex = index;
                this.updateCursors();
            }
        }
    }

    confirmCurrent() {
        if (this.selectionState === SEL_STATE.P1_SELECTING) {
            this.p1Selection = this.monsterList[this.p1CursorIndex];
            this.showSelectionFlash(this.p1CursorIndex, 0x4488ff);

            if (this.mode === 'ai') {
                const aiIdx = Phaser.Math.Between(0, this.monsterList.length - 1);
                this.p2CursorIndex = aiIdx;
                this.p2Selection = this.monsterList[aiIdx];
                this.time.delayedCall(300, () => {
                    this.showSelectionFlash(aiIdx, 0xff4444);
                    this.selectionState = SEL_STATE.READY;
                    this.updateCursors();
                    this.updateSelectionInfo();
                    this.updateControlHint();
                    this.showFightButton();
                });
            } else {
                this.selectionState = SEL_STATE.P2_SELECTING;
                this.updateCursors();
                this.updateSelectionInfo();
                this.updateControlHint();
            }
        } else if (this.selectionState === SEL_STATE.P2_SELECTING) {
            this.p2Selection = this.monsterList[this.p2CursorIndex];
            this.showSelectionFlash(this.p2CursorIndex, 0xff4444);
            this.selectionState = SEL_STATE.READY;
            this.updateCursors();
            this.updateSelectionInfo();
            this.updateControlHint();
            this.showFightButton();
        } else if (this.selectionState === SEL_STATE.READY) {
            this.startBattle();
        }
    }

    // ----------------------------------------------------------------
    // UI UPDATES
    // ----------------------------------------------------------------

    showSelectionFlash(cardIndex, color) {
        const card = this.cards[cardIndex];
        const flash = this.add.rectangle(card.x, card.y, CARD_WIDTH + 12, CARD_HEIGHT + 12)
            .setStrokeStyle(4, color).setFillStyle(color, 0.15);
        this.tweens.add({
            targets: flash, alpha: 0, duration: 400,
            onComplete: () => flash.destroy(),
        });
    }

    showFightButton() {
        this.fightButton.setAlpha(0);
        this.tweens.add({ targets: this.fightButton, alpha: 1, duration: 300, ease: 'Power2' });
        this.tweens.add({
            targets: this.fightButton, scale: 1.1, duration: 500,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
    }

    updateCursors() {
        // Kill previous blink tween
        if (this.cursorBlinkTween) {
            this.cursorBlinkTween.stop();
            this.cursorBlinkTween = null;
        }

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];

            // Active cursor (blinking)
            const showP1Cursor = this.selectionState === SEL_STATE.P1_SELECTING && i === this.p1CursorIndex;
            const showP2Cursor = this.selectionState === SEL_STATE.P2_SELECTING && i === this.p2CursorIndex;
            card.p1Cursor.setAlpha(showP1Cursor ? 1 : 0);
            card.p2Cursor.setAlpha(showP2Cursor ? 1 : 0);

            // Confirmed borders — solid with double frame
            const p1Confirmed = this.p1Selection && this.p1Selection.id === card.monster.id;
            const p2Confirmed = this.p2Selection && this.p2Selection.id === card.monster.id;
            card.p1Border.setAlpha(p1Confirmed ? 1 : 0);
            card.p2Border.setAlpha(p2Confirmed ? 1 : 0);

            // Double frame for confirmed selections (create inner borders lazily)
            if (!card.p1InnerBorder) {
                card.p1InnerBorder = this.add.rectangle(card.x, card.y, CARD_WIDTH - 2, CARD_HEIGHT - 2)
                    .setStrokeStyle(2, 0x4488ff).setFillStyle().setAlpha(0);
                card.p2InnerBorder = this.add.rectangle(card.x, card.y, CARD_WIDTH - 2, CARD_HEIGHT - 2)
                    .setStrokeStyle(2, 0xff4444).setFillStyle().setAlpha(0);
            }
            card.p1InnerBorder.setAlpha(p1Confirmed ? 1 : 0);
            card.p2InnerBorder.setAlpha(p2Confirmed ? 1 : 0);
        }

        // Blink the active cursor
        const activeCursorTarget = this.selectionState === SEL_STATE.P1_SELECTING
            ? this.cards[this.p1CursorIndex]?.p1Cursor
            : this.selectionState === SEL_STATE.P2_SELECTING
                ? this.cards[this.p2CursorIndex]?.p2Cursor
                : null;

        if (activeCursorTarget) {
            this.cursorBlinkTween = this.tweens.add({
                targets: activeCursorTarget,
                alpha: { from: 1, to: 0.3 },
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
        }

        this.updatePreviews();
    }

    updateSelectionInfo() {
        const p1Name = this.p1Selection ? this.p1Selection.name : '???';
        const p2Name = this.p2Selection ? this.p2Selection.name : '???';
        this.selectionInfoText.setText(`P1: ${p1Name}  vs  P2: ${p2Name}`);

        if (this.selectionState === SEL_STATE.P1_SELECTING) {
            this.instructionText.setText('PLAYER 1 - Choose your monster');
        } else if (this.selectionState === SEL_STATE.P2_SELECTING) {
            this.instructionText.setText('PLAYER 2 - Choose your monster');
        } else {
            this.instructionText.setText('Press ENTER or click FIGHT to begin!');
        }
    }

    updateControlHint() {
        if (this.selectionState === SEL_STATE.P1_SELECTING) {
            this.controlHint.setText('WASD = Move   SPACE = Select   ESC = Back');
        } else if (this.selectionState === SEL_STATE.P2_SELECTING) {
            this.controlHint.setText('Arrows = Move   ENTER = Select   ESC = Back');
        } else {
            this.controlHint.setText('ENTER = Fight!   ESC = Back');
        }
    }

    goBack() {
        if (this.selectionState === SEL_STATE.P2_SELECTING) {
            this.p1Selection = null;
            this.selectionState = SEL_STATE.P1_SELECTING;
            this.updateCursors();
            this.updateSelectionInfo();
            this.updateControlHint();
        } else if (this.selectionState === SEL_STATE.READY) {
            this.p2Selection = null;
            this.fightButton.setAlpha(0);
            this.tweens.killTweensOf(this.fightButton);
            this.fightButton.setScale(1);
            if (this.mode === 'ai') {
                this.p1Selection = null;
                this.selectionState = SEL_STATE.P1_SELECTING;
            } else {
                this.selectionState = SEL_STATE.P2_SELECTING;
            }
            this.updateCursors();
            this.updateSelectionInfo();
            this.updateControlHint();
        } else {
            this.scene.start('Menu');
        }
    }

    startBattle() {
        this.scene.start('Battle', {
            player1: this.p1Selection,
            player2: this.p2Selection,
            mode: this.mode,
            aiDifficulty: this.aiDifficulty,
        });
    }
}
