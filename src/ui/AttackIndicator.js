import Phaser from 'phaser';
import { ATTACK_SLOTS } from '../config/constants.js';

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 48;
const BUTTON_GAP = 6;
const DIMMED_ALPHA = 0.4;
const INDENT_PX = 10;
const RESULT_MARGIN = 8;

// Traffic light colors per slot
const SLOT_COLORS = {
    A: { bg: 0x442222, highlight: 0xcc3333 },  // Red
    B: { bg: 0x443d11, highlight: 0xccaa33 },  // Yellow
    C: { bg: 0x224422, highlight: 0x33cc33 },  // Green
};

const RESULT_COLORS = {
    HIT: '#44ff44',
    DRAW: '#ffcc00',
    MISS: '#ff4444',
};

// Map slot letters to button indices
const SLOT_INDEX = { A: 0, B: 1, C: 2 };

export class AttackIndicator {
    /**
     * Three attack option buttons for one player.
     *
     * @param {Phaser.Scene} scene
     * @param {number} x - Center x of the indicator column
     * @param {number} y - Top y of the first button
     * @param {object} monsterData - Entry from MONSTERS (must have .attacks)
     * @param {object|string[]} keyLabels - Either { A: 'A', B: 'S', C: 'D' } or ['A','S','D']
     * @param {number} indentDirection - +1 indent right (P1), -1 indent left (P2)
     */
    constructor(scene, x, y, monsterData, keyLabels, indentDirection = 0) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.monsterData = monsterData;
        this.keyLabels = keyLabels;
        this.indentDirection = indentDirection;
        this.lastAttackSlot = null;

        /** @type {{ bg: Phaser.GameObjects.Rectangle, label: Phaser.GameObjects.Text, result: Phaser.GameObjects.Text|null, slot: string, baseX: number }[]} */
        this.buttons = [];
        this.onAttackTap = null;

        ATTACK_SLOTS.forEach((slot, i) => {
            const attack = monsterData.attacks[slot];
            const bx = x;
            const by = y + i * (BUTTON_HEIGHT + BUTTON_GAP);
            const colors = SLOT_COLORS[slot];

            const bg = scene.add.rectangle(bx, by, BUTTON_WIDTH, BUTTON_HEIGHT, colors.bg)
                .setOrigin(0.5, 0);

            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerdown', () => {
                if (this.onAttackTap) this.onAttackTap(slot);
            });

            const keyLabel = Array.isArray(keyLabels) ? keyLabels[i] : keyLabels[slot];
            const labelText = `[${keyLabel}] ${attack.name} (${slot})`;
            const label = scene.add.text(bx, by + BUTTON_HEIGHT / 2, labelText, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#cccccc',
            }).setOrigin(0.5, 0.5);

            this.buttons.push({ bg, label, result: null, slot, baseX: bx });
        });
    }

    /**
     * Highlight the chosen attack slot with its traffic light color and indent.
     * @param {string} slot - 'A', 'B', or 'C'
     */
    highlight(slot) {
        const idx = SLOT_INDEX[slot];
        if (idx === undefined) return;
        const btn = this.buttons[idx];
        const colors = SLOT_COLORS[slot];
        btn.bg.fillColor = colors.highlight;
        btn.label.setColor('#ffffff');

        // Indent toward opponent
        const offset = INDENT_PX * this.indentDirection;
        btn.bg.x = btn.baseX + offset;
        btn.label.x = btn.baseX + offset;
    }

    /**
     * Persistently mark a slot as the last attack used.
     * @param {string} slot - 'A', 'B', or 'C'
     */
    markLastAttack(slot) {
        this.lastAttackSlot = slot;
        this.highlight(slot);
    }

    /**
     * Show the RPS outcome next to the chosen attack, toward the screen center.
     * @param {string} slot - 'A', 'B', or 'C'
     * @param {'win'|'draw'|'lose'|null} rpsResult - from CombatSystem
     */
    showResult(slot, rpsResult) {
        const idx = SLOT_INDEX[slot];
        if (idx === undefined) return;
        const btn = this.buttons[idx];

        if (btn.result) {
            btn.result.destroy();
        }

        // Map CombatSystem results to display labels
        let label = 'MISS';
        if (rpsResult === 'win') label = 'HIT';
        else if (rpsResult === 'draw') label = 'DRAW';

        const by = this.y + idx * (BUTTON_HEIGHT + BUTTON_GAP) + BUTTON_HEIGHT / 2;

        // Place result toward screen center, with margin from the indented button edge
        const edgeOffset = BUTTON_WIDTH / 2 + INDENT_PX + RESULT_MARGIN;
        let bx;
        let originX;
        if (this.indentDirection >= 0) {
            // P1: result to the right of attacks
            bx = this.x + edgeOffset;
            originX = 0;
        } else {
            // P2: result to the left of attacks
            bx = this.x - edgeOffset;
            originX = 1;
        }

        btn.result = this.scene.add.text(bx, by, label, {
            fontSize: '16px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: RESULT_COLORS[label] || '#ffffff',
        }).setOrigin(originX, 0.5);
    }

    /** Remove all highlights, indents, and result labels. */
    reset() {
        this.buttons.forEach((btn) => {
            const colors = SLOT_COLORS[btn.slot];
            btn.bg.fillColor = colors.bg;
            btn.bg.x = btn.baseX;
            btn.label.setColor('#cccccc');
            btn.label.x = btn.baseX;
            if (btn.result) {
                btn.result.destroy();
                btn.result = null;
            }
        });
    }

    /**
     * Dim or brighten the whole indicator.
     * @param {boolean} active
     */
    setActive(active) {
        const alpha = active ? 1 : DIMMED_ALPHA;
        this.buttons.forEach((btn) => {
            btn.bg.setAlpha(alpha);
            btn.label.setAlpha(alpha);
            if (btn.result) btn.result.setAlpha(alpha);
        });
    }

    /** Remove all game objects from the scene. */
    destroy() {
        this.buttons.forEach((btn) => {
            btn.bg.destroy();
            btn.label.destroy();
            if (btn.result) btn.result.destroy();
        });
        this.buttons = [];
    }
}
