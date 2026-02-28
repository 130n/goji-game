import Phaser from 'phaser';
import { createCombatState, resolveAttack } from '../systems/CombatSystem.js';
import { aiDecide } from '../systems/AISystem.js';
import { TURN_TIMEOUT, DRAW_BONUS_TIME, ATTACK_SLOTS } from '../config/constants.js';
import { HealthBar } from '../ui/HealthBar.js';
import { TimerBar } from '../ui/TimerBar.js';
import { AttackIndicator } from '../ui/AttackIndicator.js';
import { MonsterSprite } from '../ui/MonsterSprite.js';

// Battle phase constants
const PHASE = {
    INTRO: 'INTRO',
    TURN_START: 'TURN_START',
    AWAITING_INPUT: 'AWAITING_INPUT',
    RESOLVING: 'RESOLVING',
    TURN_RESULT: 'TURN_RESULT',
    CHECK_KO: 'CHECK_KO',
    FINISHED: 'FINISHED',
};

// Layout constants for 1024x768
const LAYOUT = {
    HP_BAR_Y: 30,
    NAME_Y: 60,
    MONSTER_Y: 300,
    P1_X: 200,
    P2_X: 824,
    CENTER_X: 512,
    TIMER_Y: 520,
    TIMER_WIDTH: 300,
    ATTACKS_Y: 580,
    HP_BAR_WIDTH: 300,
    HP_BAR_HEIGHT: 20,
};

// Player 1 key bindings: A, S, D -> slots A, B, C
const P1_KEY_MAP = { A: 'A', S: 'B', D: 'C' };
// Player 2 key bindings: J, K, L -> slots A, B, C
const P2_KEY_MAP = { J: 'A', K: 'B', L: 'C' };

const P1_KEY_LABELS = { A: 'A', B: 'S', C: 'D' };
const P2_KEY_LABELS = { A: 'J', B: 'K', C: 'L' };

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    init(data) {
        this.player1Data = data.player1;
        this.player2Data = data.player2;
        this.mode = data.mode || 'local';
        this.aiDifficulty = data.aiDifficulty || null;

        this.currentPhase = null;
        this.battleState = null;
        this.turnStartTime = 0;
        this.chargeStartTime = 0;
        this.isCharging = false;
        this.activeKeys = [];
        this.inputLocked = false;
        this.nextTurnBonusTime = 0;
        this.currentEffectiveTimeout = TURN_TIMEOUT;
    }

    create() {
        this.battleState = createCombatState(this.player1Data, this.player2Data);

        this.createBackground();
        this.createMonsterNames();
        this.createHealthBars();
        this.createMonsterSprites();
        this.createTimerBar();
        this.createAttackIndicators();
        this.createTurnText();
        this.createChargeMeter();

        this.setPhase(PHASE.INTRO);
    }

    // ----------------------------------------------------------------
    // UI CREATION
    // ----------------------------------------------------------------

    createBackground() {
        // Battle background (SVG or fallback)
        if (this.textures.exists('battle_bg')) {
            this.add.image(LAYOUT.CENTER_X, 384, 'battle_bg').setOrigin(0.5, 0.5);
        } else {
            this.add.rectangle(LAYOUT.CENTER_X, 384, 1024, 768, 0x1a1a2e);
            this.add.rectangle(LAYOUT.CENTER_X, 480, 900, 2, 0x333366, 0.5);
        }

        // Active-turn tint overlays (one per player side)
        this.p1BgTint = this.add.rectangle(256, 384, 512, 768, 0x3366ff)
            .setAlpha(0);
        this.p2BgTint = this.add.rectangle(768, 384, 512, 768, 0xff3333)
            .setAlpha(0);
    }

    createMonsterNames() {
        this.p1NameText = this.add.text(LAYOUT.P1_X, LAYOUT.NAME_Y, this.player1Data.name, {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#66ccff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        this.p2NameText = this.add.text(LAYOUT.P2_X, LAYOUT.NAME_Y, this.player2Data.name, {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#ff6666',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);
    }

    createHealthBars() {
        // P1 bar: left-aligned from P1_X
        this.p1HealthBar = new HealthBar(
            this, LAYOUT.P1_X - LAYOUT.HP_BAR_WIDTH / 2, LAYOUT.HP_BAR_Y,
            LAYOUT.HP_BAR_WIDTH, LAYOUT.HP_BAR_HEIGHT,
            this.player1Data.hp, 0x66ccff,
        );
        // P2 bar: right-aligned to P2_X
        this.p2HealthBar = new HealthBar(
            this, LAYOUT.P2_X - LAYOUT.HP_BAR_WIDTH / 2, LAYOUT.HP_BAR_Y,
            LAYOUT.HP_BAR_WIDTH, LAYOUT.HP_BAR_HEIGHT,
            this.player2Data.hp, 0xff6666,
        );
    }

    createMonsterSprites() {
        this.p1Sprite = new MonsterSprite(
            this, LAYOUT.P1_X, LAYOUT.MONSTER_Y,
            this.player1Data, 'right',
        );
        this.p2Sprite = new MonsterSprite(
            this, LAYOUT.P2_X, LAYOUT.MONSTER_Y,
            this.player2Data, 'left',
        );
    }

    createTimerBar() {
        // One timer per player side — only the active one is visible
        this.p1Timer = new TimerBar(
            this, LAYOUT.P1_X - LAYOUT.TIMER_WIDTH / 2, LAYOUT.TIMER_Y,
            LAYOUT.TIMER_WIDTH,
        );
        this.p2Timer = new TimerBar(
            this, LAYOUT.P2_X - LAYOUT.TIMER_WIDTH / 2, LAYOUT.TIMER_Y,
            LAYOUT.TIMER_WIDTH,
        );
        this.p1Timer.setVisible(false);
        this.p2Timer.setVisible(false);
    }

    createAttackIndicators() {
        this.p1Attacks = new AttackIndicator(
            this, LAYOUT.P1_X, LAYOUT.ATTACKS_Y,
            this.player1Data, P1_KEY_LABELS, 1,
        );
        this.p2Attacks = new AttackIndicator(
            this, LAYOUT.P2_X, LAYOUT.ATTACKS_Y,
            this.player2Data, P2_KEY_LABELS, -1,
        );
    }

    createTurnText() {
        this.turnInfoText = this.add.text(LAYOUT.CENTER_X, LAYOUT.ATTACKS_Y + 30, '', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setAlpha(0);

        this.centerText = this.add.text(LAYOUT.CENTER_X, LAYOUT.MONSTER_Y, '', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setAlpha(0);

        this.resultText = this.add.text(LAYOUT.CENTER_X, LAYOUT.MONSTER_Y - 80, '', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0);
    }

    createChargeMeter() {
        // Charge meter background (only visible for Mecha Godzilla)
        this.chargeMeterBg = this.add.rectangle(LAYOUT.CENTER_X, LAYOUT.TIMER_Y - 40, 200, 16, 0x333333)
            .setOrigin(0.5)
            .setAlpha(0);
        this.chargeMeterFill = this.add.rectangle(LAYOUT.CENTER_X - 100, LAYOUT.TIMER_Y - 40, 0, 14, 0xff00ff)
            .setOrigin(0, 0.5)
            .setAlpha(0);
        this.chargeMeterLabel = this.add.text(LAYOUT.CENTER_X, LAYOUT.TIMER_Y - 58, 'CHARGE', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff00ff',
        }).setOrigin(0.5).setAlpha(0);
    }

    // ----------------------------------------------------------------
    // STATE MACHINE
    // ----------------------------------------------------------------

    setPhase(phase) {
        this.currentPhase = phase;

        switch (phase) {
            case PHASE.INTRO:
                this.phaseIntro();
                break;
            case PHASE.TURN_START:
                this.phaseTurnStart();
                break;
            case PHASE.AWAITING_INPUT:
                this.phaseAwaitingInput();
                break;
            case PHASE.RESOLVING:
                // Handled by resolveCurrentTurn()
                break;
            case PHASE.TURN_RESULT:
                // Handled by showTurnResult()
                break;
            case PHASE.CHECK_KO:
                // Handled inline in resolveCurrentTurn
                break;
            case PHASE.FINISHED:
                this.phaseFinished();
                break;
        }
    }

    // ----------------------------------------------------------------
    // INTRO PHASE
    // ----------------------------------------------------------------

    phaseIntro() {
        this.p1Attacks.setActive(false);
        this.p2Attacks.setActive(false);

        this.centerText.setText('VS').setAlpha(0).setScale(0.5);

        this.tweens.add({
            targets: this.centerText,
            alpha: 1,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(900, () => {
                    this.tweens.add({
                        targets: this.centerText,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            this.setPhase(PHASE.TURN_START);
                        },
                    });
                });
            },
        });
    }

    // ----------------------------------------------------------------
    // TURN_START PHASE
    // ----------------------------------------------------------------

    phaseTurnStart() {
        const activeIdx = this.battleState.activePlayer;
        const playerLabel = activeIdx === 0 ? 'PLAYER 1' : 'PLAYER 2';

        // Only reset the ACTIVE player's panel (opponent keeps their result visible)
        const activeAttacks = activeIdx === 0 ? this.p1Attacks : this.p2Attacks;
        activeAttacks.reset();
        this.hideChargeMeter();

        // Show timer on active player's side only
        const activeTimer = activeIdx === 0 ? this.p1Timer : this.p2Timer;
        const inactiveTimer = activeIdx === 0 ? this.p2Timer : this.p1Timer;
        activeTimer.reset();
        activeTimer.setVisible(true);
        inactiveTimer.setVisible(false);

        // Background tint: subtle glow on active side
        this.p1BgTint.setAlpha(activeIdx === 0 ? 0.06 : 0);
        this.p2BgTint.setAlpha(activeIdx === 1 ? 0.06 : 0);

        // Active/inactive brightness
        if (activeIdx === 0) {
            this.p1Attacks.setActive(true);
            this.p2Attacks.setActive(false);
        } else {
            this.p1Attacks.setActive(false);
            this.p2Attacks.setActive(true);
        }

        // Show turn announcement
        this.turnInfoText
            .setText(`${playerLabel} ATTACK!`)
            .setAlpha(1)
            .setColor(activeIdx === 0 ? '#66ccff' : '#ff6666');

        // Flash the announcement
        this.tweens.add({
            targets: this.turnInfoText,
            alpha: { from: 1, to: 0.4 },
            yoyo: true,
            repeat: 1,
            duration: 200,
            onComplete: () => {
                this.turnInfoText.setAlpha(1);
            },
        });

        // Apply draw bonus time (if any) and reset
        this.currentEffectiveTimeout = TURN_TIMEOUT + this.nextTurnBonusTime;
        const hadBonus = this.nextTurnBonusTime > 0;
        this.nextTurnBonusTime = 0;

        // Start timer immediately — no delay
        this.turnStartTime = performance.now();
        activeTimer.start(this.currentEffectiveTimeout * 1000, () => {
            this.onTimerExpired();
        });

        // Show bonus time indicator
        if (hadBonus) {
            const bonusLabel = this.add.text(
                activeIdx === 0 ? LAYOUT.P1_X : LAYOUT.P2_X,
                LAYOUT.TIMER_Y - 20,
                `+${(this.currentEffectiveTimeout - TURN_TIMEOUT).toFixed(1)}s`,
                { fontSize: '16px', fontFamily: 'monospace', color: '#ffcc00', stroke: '#000000', strokeThickness: 2 },
            ).setOrigin(0.5).setAlpha(1);
            this.tweens.add({
                targets: bonusLabel,
                alpha: 0,
                y: LAYOUT.TIMER_Y - 40,
                duration: 800,
                delay: 300,
                onComplete: () => bonusLabel.destroy(),
            });
        }

        this.setPhase(PHASE.AWAITING_INPUT);
    }

    // ----------------------------------------------------------------
    // AWAITING_INPUT PHASE
    // ----------------------------------------------------------------

    phaseAwaitingInput() {
        const activeIdx = this.battleState.activePlayer;

        // AI mode: if player 2 is AI-controlled
        if (this.mode === 'ai' && activeIdx === 1) {
            this.handleAITurn();
            return;
        }

        // Local mode: bind keys for active player
        this.bindPlayerKeys(activeIdx);
    }

    bindPlayerKeys(playerIdx) {
        this.unbindAllKeys();
        this.inputLocked = false;
        this.isCharging = false;

        const keyMap = playerIdx === 0 ? P1_KEY_MAP : P2_KEY_MAP;
        const activeMonster = this.battleState.players[playerIdx];
        const isCharger = activeMonster.special === 'charge';

        for (const [keyName, slot] of Object.entries(keyMap)) {
            const keyCode = `keydown-${keyName}`;
            const keyUpCode = `keyup-${keyName}`;

            if (isCharger) {
                // Charge mechanic: keydown starts charge, keyup releases
                const downHandler = () => {
                    if (this.inputLocked || this.currentPhase !== PHASE.AWAITING_INPUT) return;
                    if (this.isCharging) return; // Already charging another key

                    this.isCharging = true;
                    this.chargeStartTime = performance.now();
                    this.showChargeMeter();
                    this.highlightAttackSlot(playerIdx, slot);
                };

                const upHandler = () => {
                    if (!this.isCharging || this.inputLocked) return;
                    if (this.currentPhase !== PHASE.AWAITING_INPUT) return;

                    this.inputLocked = true;
                    this.isCharging = false;

                    const chargeTime = (performance.now() - this.chargeStartTime) / 1000;
                    const reactionTime = (performance.now() - this.turnStartTime) / 1000;

                    this.hideChargeMeter();
                    this.unbindAllKeys();
                    this.resolveCurrentTurn(slot, reactionTime, chargeTime);
                };

                this.input.keyboard.on(keyCode, downHandler);
                this.input.keyboard.on(keyUpCode, upHandler);
                this.activeKeys.push({ event: keyCode, handler: downHandler });
                this.activeKeys.push({ event: keyUpCode, handler: upHandler });
            } else {
                // Standard input: single keypress
                const handler = () => {
                    if (this.inputLocked || this.currentPhase !== PHASE.AWAITING_INPUT) return;
                    this.inputLocked = true;

                    const reactionTime = (performance.now() - this.turnStartTime) / 1000;
                    this.highlightAttackSlot(playerIdx, slot);
                    this.unbindAllKeys();
                    this.resolveCurrentTurn(slot, reactionTime, null);
                };

                this.input.keyboard.on(keyCode, handler);
                this.activeKeys.push({ event: keyCode, handler });
            }
        }
    }

    unbindAllKeys() {
        for (const { event, handler } of this.activeKeys) {
            this.input.keyboard.off(event, handler);
        }
        this.activeKeys = [];
    }

    highlightAttackSlot(playerIdx, slot) {
        if (playerIdx === 0) {
            this.p1Attacks.highlight(slot);
        } else {
            this.p2Attacks.highlight(slot);
        }
    }

    // ----------------------------------------------------------------
    // CHARGE METER
    // ----------------------------------------------------------------

    showChargeMeter() {
        this.chargeMeterBg.setAlpha(1);
        this.chargeMeterFill.setAlpha(1);
        this.chargeMeterLabel.setAlpha(1);
        this.chargeMeterFill.width = 0;
    }

    hideChargeMeter() {
        this.chargeMeterBg.setAlpha(0);
        this.chargeMeterFill.setAlpha(0);
        this.chargeMeterLabel.setAlpha(0);
        this.isCharging = false;
    }

    update() {
        // Update charge meter fill while charging
        if (this.isCharging && this.currentPhase === PHASE.AWAITING_INPUT) {
            const elapsed = (performance.now() - this.chargeStartTime) / 1000;
            // Max visual fill at ~0.6s (maps to max multiplier of 1.6)
            const fillPct = Math.min(1, elapsed / 0.6);
            this.chargeMeterFill.width = 200 * fillPct;

            // Color shifts from magenta to yellow as charge builds
            const r = 255;
            const g = Math.floor(fillPct * 255);
            const b = Math.floor((1 - fillPct) * 255);
            this.chargeMeterFill.setFillStyle((r << 16) | (g << 8) | b);
        }
    }

    // ----------------------------------------------------------------
    // AI TURN
    // ----------------------------------------------------------------

    handleAITurn() {
        const aiPlayer = this.battleState.players[1];
        const opponent = this.battleState.players[0];
        const isFirstTurn = this.battleState.turnNumber === 0;

        const decision = aiDecide(
            this.aiDifficulty,
            opponent.lastAttack,
            aiPlayer.lastAttack,
            isFirstTurn,
        );

        console.log('[AI] turn=%d difficulty=%s opponentLast=%s aiLast=%s → slot=%s react=%.3fs',
            this.battleState.turnNumber, this.aiDifficulty,
            opponent.lastAttack, aiPlayer.lastAttack, decision.slot, decision.reactionTime);

        // Show thinking indicator
        this.turnInfoText.setText('...');

        // Simulate AI reaction delay
        this.time.delayedCall(decision.reactionTime * 1000, () => {
            if (this.currentPhase !== PHASE.AWAITING_INPUT) {
                console.warn('[AI] delayed callback skipped — phase is', this.currentPhase);
                return;
            }

            console.log('[AI] executing slot=%s', decision.slot);
            this.highlightAttackSlot(1, decision.slot);

            // For charge monsters, simulate a charge time
            let chargeTime = null;
            if (aiPlayer.special === 'charge') {
                chargeTime = 0.2 + Math.random() * 0.3; // AI charges 0.2-0.5s
            }

            this.resolveCurrentTurn(decision.slot, decision.reactionTime, chargeTime);
        });
    }

    // ----------------------------------------------------------------
    // TIMER EXPIRED
    // ----------------------------------------------------------------

    onTimerExpired() {
        if (this.currentPhase !== PHASE.AWAITING_INPUT) {
            return;
        }

        console.log('[TIMER] expired for player %d (turn %d)',
            this.battleState.activePlayer, this.battleState.turnNumber);

        this.inputLocked = true;
        this.unbindAllKeys();
        this.hideChargeMeter();

        // Auto-miss: use slot A with a reaction time at the timeout threshold
        this.resolveCurrentTurn(ATTACK_SLOTS[0], this.currentEffectiveTimeout, null);
    }

    // ----------------------------------------------------------------
    // RESOLVING PHASE
    // ----------------------------------------------------------------

    resolveCurrentTurn(slot, reactionTime, chargeTime) {
        // Stop the active timer
        const attackerIdx = this.battleState.activePlayer;
        const activeTimer = attackerIdx === 0 ? this.p1Timer : this.p2Timer;
        activeTimer.stop();

        // Resolve attack (mutates state, switches activePlayer)
        const result = resolveAttack(this.battleState, slot, reactionTime, chargeTime, this.currentEffectiveTimeout);

        // DRAW grants opponent extra time on their next turn (no damage bonus)
        if (result.rpsResult === 'draw') {
            this.nextTurnBonusTime = DRAW_BONUS_TIME;
        }

        // Mark last attack + show RPS result on panel
        const attackPanel = attackerIdx === 0 ? this.p1Attacks : this.p2Attacks;
        attackPanel.markLastAttack(slot);
        attackPanel.showResult(slot, result.rpsResult);

        // Fire-and-forget visual feedback
        this.showAttackVisuals(result, attackerIdx);

        // KO → brief delay for the hit to register, then FINISHED
        // Otherwise → immediately start opponent's turn
        if (this.battleState.phase === 'finished') {
            this.currentPhase = PHASE.RESOLVING;
            this.time.delayedCall(600, () => {
                this.setPhase(PHASE.FINISHED);
            });
        } else {
            this.setPhase(PHASE.TURN_START);
        }
    }

    /**
     * Non-blocking visual feedback: animations, damage, result text.
     * Does not delay the state machine.
     */
    showAttackVisuals(result, attackerIdx) {
        const defenderIdx = 1 - attackerIdx;

        // Attacker lunge
        const attackerSprite = attackerIdx === 0 ? this.p1Sprite : this.p2Sprite;
        attackerSprite.playAttackAnimation();

        // Result text (auto-fades)
        let resultLabel;
        let resultColor;
        if (result.reason === 'timeout') {
            resultLabel = 'TIMEOUT!';
            resultColor = '#888888';
        } else if (result.reason === 'first_turn') {
            resultLabel = 'FIRST STRIKE!';
            resultColor = '#ffcc00';
        } else if (result.rpsResult === 'win') {
            resultLabel = 'HIT!';
            resultColor = '#00ff00';
        } else if (result.rpsResult === 'draw') {
            resultLabel = 'CLASH!';
            resultColor = '#ffcc00';
        } else {
            resultLabel = 'MISS!';
            resultColor = '#ff4444';
        }

        this.resultText
            .setText(resultLabel)
            .setColor(resultColor)
            .setAlpha(1)
            .setScale(0.5);

        this.tweens.add({
            targets: this.resultText,
            scale: 1,
            duration: 150,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.resultText,
                    alpha: 0,
                    duration: 400,
                    delay: 150,
                });
            },
        });

        // Defender takes damage
        if (result.hit && result.damage > 0) {
            const defenderSprite = defenderIdx === 0 ? this.p1Sprite : this.p2Sprite;
            const defenderHealthBar = defenderIdx === 0 ? this.p1HealthBar : this.p2HealthBar;
            const defenderPlayer = this.battleState.players[defenderIdx];

            defenderSprite.playHitAnimation();
            defenderHealthBar.setHp(defenderPlayer.currentHp);

            const defenderX = defenderIdx === 0 ? LAYOUT.P1_X : LAYOUT.P2_X;
            this.showFloatingDamage(defenderX, LAYOUT.MONSTER_Y - 40, result.damage);
        }

        // Malfunction self-damage
        if (result.malfunctionDamage && result.malfunctionDamage > 0) {
            const atkSprite = attackerIdx === 0 ? this.p1Sprite : this.p2Sprite;
            const attackerHealthBar = attackerIdx === 0 ? this.p1HealthBar : this.p2HealthBar;
            const attackerPlayer = this.battleState.players[attackerIdx];

            atkSprite.playHitAnimation();
            attackerHealthBar.setHp(attackerPlayer.currentHp);

            const attackerX = attackerIdx === 0 ? LAYOUT.P1_X : LAYOUT.P2_X;
            this.showMalfunctionEffect(attackerX, LAYOUT.MONSTER_Y);
            this.showFloatingDamage(attackerX, LAYOUT.MONSTER_Y - 40, result.malfunctionDamage, '#ff00ff');
        }
    }

    showFloatingDamage(x, y, amount, color = '#ff4444') {
        const dmgText = this.add.text(x, y, `-${amount}`, {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: color,
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                dmgText.destroy();
            },
        });
    }

    showMalfunctionEffect(x, y) {
        const malfText = this.add.text(x, y + 50, 'MALFUNCTION!', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: malfText,
            alpha: 0,
            duration: 1200,
            onComplete: () => {
                malfText.destroy();
            },
        });
    }

    // CHECK_KO is handled inline in resolveCurrentTurn()

    // ----------------------------------------------------------------
    // FINISHED PHASE
    // ----------------------------------------------------------------

    phaseFinished() {
        this.unbindAllKeys();
        this.p1Timer.stop();
        this.p2Timer.stop();
        this.p1Timer.setVisible(false);
        this.p2Timer.setVisible(false);
        this.p1BgTint.setAlpha(0);
        this.p2BgTint.setAlpha(0);
        this.p1Attacks.setActive(false);
        this.p2Attacks.setActive(false);
        this.turnInfoText.setAlpha(0);
        this.resultText.setAlpha(0);

        // Show KO text
        this.centerText
            .setText('K.O.!')
            .setColor('#ff0000')
            .setAlpha(0)
            .setScale(0.3);

        this.tweens.add({
            targets: this.centerText,
            alpha: 1,
            scale: 1.2,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.centerText,
                    scale: 1,
                    duration: 200,
                });
            },
        });

        // Determine winner
        const winnerIdx = this.battleState.winner;
        const winnerData = winnerIdx === 0 ? this.player1Data : this.player2Data;
        const loserData = winnerIdx === 0 ? this.player2Data : this.player1Data;

        // Transition to VictoryScene after 2 seconds
        this.time.delayedCall(2000, () => {
            this.scene.start('Victory', {
                winner: winnerData,
                loser: loserData,
                winnerPlayer: winnerIdx + 1, // 1-indexed for display
                battleLog: this.battleState.log,
                mode: this.mode,
                aiDifficulty: this.aiDifficulty,
            });
        });
    }

    // ----------------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------------

    shutdown() {
        this.unbindAllKeys();
        this.p1Timer.stop();
        this.p2Timer.stop();
        this.p1HealthBar.destroy();
        this.p2HealthBar.destroy();
    }
}
