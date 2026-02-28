import { describe, it, expect } from 'vitest';
import { MONSTERS } from '../src/config/monsters.js';
import { createCombatState, resolveAttack } from '../src/systems/CombatSystem.js';
import { ATTACK_SLOTS } from '../src/config/constants.js';

const REACTION_PROFILES = {
    optimal: 0.1,
    medium: 0.5,
    slow: 0.9,
};

// Tighter band at optimal/medium, wider at slow (expected: HP dominates at slow speeds)
const BALANCE_THRESHOLDS = {
    optimal: { max: 0.70, min: 0.35 },
    medium: { max: 0.70, min: 0.30 },
    slow: { max: 0.90, min: 0.15 },
};

const SIMULATIONS_PER_MATCHUP = 500;
const MAX_TURNS = 200;

function simulateMatch(monster1, monster2, reactionTime) {
    const state = createCombatState(monster1, monster2);
    let turns = 0;

    while (state.phase !== 'finished' && turns < MAX_TURNS) {
        const slot = ATTACK_SLOTS[Math.floor(Math.random() * ATTACK_SLOTS.length)];
        const attacker = state.players[state.activePlayer];

        // Simulate Mecha Godzilla charge: random charge between 0.2-0.7s
        let chargeTime = null;
        if (attacker.special === 'charge') {
            chargeTime = 0.2 + Math.random() * 0.5;
        }

        resolveAttack(state, slot, reactionTime, chargeTime);
        turns++;
    }

    if (state.phase !== 'finished') return null;
    return state.winner;
}

const monsterIds = Object.keys(MONSTERS);

describe('Balance Matrix', () => {
    for (const [profileName, reactionTime] of Object.entries(REACTION_PROFILES)) {
        describe(`Reaction profile: ${profileName} (${reactionTime}s)`, () => {
            const winRates = {};
            const thresholds = BALANCE_THRESHOLDS[profileName];

            for (const id1 of monsterIds) {
                winRates[id1] = {};
                for (const id2 of monsterIds) {
                    if (id1 === id2) {
                        winRates[id1][id2] = 0.5;
                        continue;
                    }
                    let p1Wins = 0;
                    let completed = 0;
                    for (let i = 0; i < SIMULATIONS_PER_MATCHUP; i++) {
                        const winner = simulateMatch(MONSTERS[id1], MONSTERS[id2], reactionTime);
                        if (winner !== null) {
                            completed++;
                            if (winner === 0) p1Wins++;
                        }
                    }
                    winRates[id1][id2] = completed > 0 ? p1Wins / completed : 0.5;
                }
            }

            it(`no monster has >${thresholds.max * 100}% avg win rate (overpowered)`, () => {
                for (const id of monsterIds) {
                    const opponents = monsterIds.filter((opp) => opp !== id);
                    const avg = opponents.reduce((s, opp) => s + winRates[id][opp], 0) / opponents.length;
                    expect(avg, `${id} avg win rate ${(avg * 100).toFixed(1)}%`).toBeLessThan(thresholds.max);
                }
            });

            it(`no monster has <${thresholds.min * 100}% avg win rate (underpowered)`, () => {
                for (const id of monsterIds) {
                    const opponents = monsterIds.filter((opp) => opp !== id);
                    const avg = opponents.reduce((s, opp) => s + winRates[id][opp], 0) / opponents.length;
                    expect(avg, `${id} avg win rate ${(avg * 100).toFixed(1)}%`).toBeGreaterThan(thresholds.min);
                }
            });

            it('logs balance matrix for tuning', () => {
                console.log(`\n=== Balance Matrix: ${profileName} (${reactionTime}s) ===`);
                const header = [''.padEnd(14), ...monsterIds.map((id) => id.slice(0, 6).padEnd(7))].join('');
                console.log(header);
                for (const id1 of monsterIds) {
                    const row = [id1.padEnd(14), ...monsterIds.map((id2) => {
                        const wr = winRates[id1][id2];
                        return `${(wr * 100).toFixed(0)}%`.padEnd(7);
                    })].join('');
                    console.log(row);
                }
                const avgRates = monsterIds.map((id) => {
                    const opponents = monsterIds.filter((opp) => opp !== id);
                    const avg = opponents.reduce((s, opp) => s + winRates[id][opp], 0) / opponents.length;
                    return { id, avg: (avg * 100).toFixed(1) };
                });
                console.log('\nAverage win rates:');
                avgRates.sort((a, b) => b.avg - a.avg).forEach(({ id, avg }) => {
                    console.log(`  ${id.padEnd(14)} ${avg}%`);
                });
            });
        });
    }
});
