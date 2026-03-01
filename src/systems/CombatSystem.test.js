import { describe, it, expect } from 'vitest';
import {
    resolveRPS,
    calculateDamage,
    getTimeMultiplier,
    createCombatState,
    resolveAttack,
} from './CombatSystem.js';
import { MONSTERS } from '../config/monsters.js';

describe('resolveRPS', () => {
    it('A beats C', () => expect(resolveRPS('A', 'C')).toBe('win'));
    it('B beats A', () => expect(resolveRPS('B', 'A')).toBe('win'));
    it('C beats B', () => expect(resolveRPS('C', 'B')).toBe('win'));
    it('A vs A is draw', () => expect(resolveRPS('A', 'A')).toBe('draw'));
    it('B vs B is draw', () => expect(resolveRPS('B', 'B')).toBe('draw'));
    it('C vs C is draw', () => expect(resolveRPS('C', 'C')).toBe('draw'));
    it('A loses to B', () => expect(resolveRPS('A', 'B')).toBe('lose'));
    it('B loses to C', () => expect(resolveRPS('B', 'C')).toBe('lose'));
    it('C loses to A', () => expect(resolveRPS('C', 'A')).toBe('lose'));
});

describe('getTimeMultiplier', () => {
    it('instant reaction gives 1.0', () => {
        expect(getTimeMultiplier(0)).toBe(1.0);
    });
    it('0.5s gives 0.5', () => {
        expect(getTimeMultiplier(0.5)).toBeCloseTo(0.5);
    });
    it('1.0s gives 0.0', () => {
        expect(getTimeMultiplier(1.0)).toBe(0);
    });
    it('over timeout gives 0', () => {
        expect(getTimeMultiplier(1.5)).toBe(0);
    });
});

describe('calculateDamage', () => {
    it('winning RPS with instant reaction gives full damage', () => {
        const dmg = calculateDamage({
            baseDamage: 15, speedBonus: 1.0, reactionTime: 0,
            isFirstTurn: false, rpsResult: 'win',
        });
        expect(dmg).toBe(15);
    });

    it('winning RPS at 0.5s gives half damage', () => {
        const dmg = calculateDamage({
            baseDamage: 15, speedBonus: 1.0, reactionTime: 0.5,
            isFirstTurn: false, rpsResult: 'win',
        });
        expect(dmg).toBe(8); // 15 * 1.0 * 0.5 = 7.5 → 8
    });

    it('speed bonus multiplies damage', () => {
        const dmg = calculateDamage({
            baseDamage: 13, speedBonus: 1.5, reactionTime: 0,
            isFirstTurn: false, rpsResult: 'win',
        });
        expect(dmg).toBe(20); // 13 * 1.5 = 19.5 → 20
    });

    it('losing RPS gives 0 damage', () => {
        const dmg = calculateDamage({
            baseDamage: 15, speedBonus: 1.0, reactionTime: 0,
            isFirstTurn: false, rpsResult: 'lose',
        });
        expect(dmg).toBe(0);
    });

    it('draw gives 30% base damage', () => {
        const dmg = calculateDamage({
            baseDamage: 15, speedBonus: 1.0, reactionTime: 0,
            isFirstTurn: false, rpsResult: 'draw',
        });
        expect(dmg).toBe(5); // 15 * 0.3 = 4.5 → 5
    });

    it('first turn gives 50% base damage regardless of speed', () => {
        const dmg = calculateDamage({
            baseDamage: 15, speedBonus: 1.5, reactionTime: 0.9,
            isFirstTurn: true, rpsResult: null,
        });
        expect(dmg).toBe(8); // 15 * 0.5 = 7.5 → 8
    });

    it('timeout gives 0 damage even on win', () => {
        const dmg = calculateDamage({
            baseDamage: 15, speedBonus: 1.0, reactionTime: 1.0,
            isFirstTurn: false, rpsResult: 'win',
        });
        expect(dmg).toBe(0);
    });

    it('Mecha Godzilla charge multiplies damage', () => {
        const dmg = calculateDamage({
            baseDamage: 16, speedBonus: 1.0, reactionTime: 0,
            isFirstTurn: false, rpsResult: 'win', chargeTime: 0.5,
        });
        expect(dmg).toBe(24); // 16 * 1.0 * 1.0 * 1.5 = 24
    });

    it('Mecha charge caps at 1.6x', () => {
        const dmg = calculateDamage({
            baseDamage: 16, speedBonus: 1.0, reactionTime: 0,
            isFirstTurn: false, rpsResult: 'win', chargeTime: 5.0,
        });
        expect(dmg).toBe(26); // 16 * 1.6 = 25.6 → 26
    });
});

describe('createCombatState', () => {
    it('creates valid initial state', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        expect(state.players[0].currentHp).toBe(100);
        expect(state.players[1].currentHp).toBe(100);
        expect(state.turnNumber).toBe(0);
        expect(state.activePlayer).toBe(0);
        expect(state.phase).toBe('awaiting_input');
        expect(state.winner).toBeNull();
    });
});

describe('resolveAttack', () => {
    it('first turn deals 50% base damage', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        const result = resolveAttack(state, 'A', 0.1);
        expect(result.hit).toBe(true);
        expect(result.damage).toBe(10); // 20 * 0.5 = 10
        expect(result.reason).toBe('first_turn');
        expect(state.players[1].currentHp).toBe(90);
        expect(state.activePlayer).toBe(1); // switched to P2
        expect(state.turnNumber).toBe(1);
    });

    it('winning RPS deals full damage', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        // P1 opens with A
        resolveAttack(state, 'A', 0.1);
        // P2 counters with B (B beats A) at instant speed
        const result = resolveAttack(state, 'B', 0.0);
        expect(result.rpsResult).toBe('win');
        expect(result.damage).toBe(20); // 20 * 1.0 * 1.0
        expect(state.players[0].currentHp).toBe(80);
    });

    it('same attack deals reduced damage', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        resolveAttack(state, 'A', 0.1); // P1 uses A
        const result = resolveAttack(state, 'A', 0.1); // P2 also uses A
        expect(result.rpsResult).toBe('draw');
        expect(result.damage).toBe(6); // 20 * 0.3 = 6
    });

    it('losing RPS deals 0 damage', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        resolveAttack(state, 'A', 0.1); // P1 uses A
        const result = resolveAttack(state, 'C', 0.1); // P2 uses C (A beats C → P2 loses)
        expect(result.rpsResult).toBe('lose');
        expect(result.damage).toBe(0);
    });

    it('timeout results in miss', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        resolveAttack(state, 'A', 0.1); // P1 opens
        const result = resolveAttack(state, 'B', 1.5); // P2 times out
        expect(result.hit).toBe(false);
        expect(result.reason).toBe('timeout');
    });

    it('Mecha Godzilla malfunction on losing RPS', () => {
        const state = createCombatState(MONSTERS.mechagodzilla, MONSTERS.godzilla);
        resolveAttack(state, 'A', 0.1); // Mecha opens with A
        resolveAttack(state, 'B', 0.1); // Godzilla wins with B
        // Now Mecha's turn again - use C which loses to B? No, B beats A.
        // P1 (Mecha) needs to attack, defender (Godzilla) used B
        // If Mecha uses A (A loses to B? No: RPS_WINS.A = C, so A beats C. A vs B → lose)
        const result = resolveAttack(state, 'A', 0.1, 0.5); // Mecha uses A vs Godzilla's B
        expect(result.rpsResult).toBe('lose');
        expect(result.malfunctionDamage).toBe(3);
        // 100 initial - 18 (Godzilla's turn 1 hit: 20 * 1.0 * 0.9 = 18) - 3 malfunction = 79
        expect(state.players[0].currentHp).toBe(79);
    });

    it('game ends when HP reaches 0', () => {
        const state = createCombatState(
            { ...MONSTERS.godzilla, hp: 10, baseDamage: 100 },
            { ...MONSTERS.kingkong, hp: 10, baseDamage: 100 },
        );
        // P1 opens - 100 * 0.5 = 50 → KO
        const result = resolveAttack(state, 'A', 0.1);
        expect(result.damage).toBe(50);
        expect(state.players[1].currentHp).toBe(0);
        expect(state.phase).toBe('finished');
        expect(state.winner).toBe(0);
    });

    it('cannot attack after game is finished', () => {
        const state = createCombatState(MONSTERS.godzilla, MONSTERS.kingkong);
        state.phase = 'finished';
        state.winner = 0;
        const result = resolveAttack(state, 'A', 0.1);
        expect(result.reason).toBe('game_over');
    });

    it('speed monster benefits from fast reactions', () => {
        const state = createCombatState(MONSTERS.mothra, MONSTERS.godzilla);
        resolveAttack(state, 'A', 0.1); // Mothra opens
        resolveAttack(state, 'A', 0.1); // Godzilla responds (draw)
        // Mothra's turn: counter Godzilla's A with B
        const result = resolveAttack(state, 'B', 0.0); // instant
        expect(result.damage).toBe(27); // 17 * 1.6 * 1.0 = 27.2 → 27
    });

    it('tank has less speed bonus impact', () => {
        const state = createCombatState(MONSTERS.gamera, MONSTERS.godzilla);
        resolveAttack(state, 'A', 0.1); // Gamera opens
        resolveAttack(state, 'A', 0.1); // Godzilla responds (draw)
        // Gamera counters with B
        const result = resolveAttack(state, 'B', 0.0);
        expect(result.damage).toBe(14); // 18 * 0.8 * 1.0 = 14.4 → 14
    });
});
