import { AI_PROFILES, RPS_WINS, ATTACK_SLOTS } from '../config/constants.js';

/**
 * Find the slot that beats the given slot.
 * If opponent used A, counter is B (B beats A).
 */
export function getCounter(slot) {
    for (const [key, beats] of Object.entries(RPS_WINS)) {
        if (beats === slot) return key;
    }
    return ATTACK_SLOTS[0]; // fallback
}

function randomSlot() {
    return ATTACK_SLOTS[Math.floor(Math.random() * ATTACK_SLOTS.length)];
}

function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Pick a random slot that is NOT the correct counter.
 */
function randomWrongSlot(correctCounter) {
    const wrong = ATTACK_SLOTS.filter((s) => s !== correctCounter);
    return wrong[Math.floor(Math.random() * wrong.length)];
}

/**
 * Standard AI decision (easy/medium/hard).
 * Picks the correct counter with a probability, otherwise a wrong slot.
 */
function standardDecide(difficulty, opponentLastAttack, isFirstTurn) {
    const profile = AI_PROFILES[difficulty];
    const reactionTime = randomInRange(profile.reactionMin, profile.reactionMax);

    if (isFirstTurn || opponentLastAttack === null) {
        return { slot: randomSlot(), reactionTime };
    }

    const counter = getCounter(opponentLastAttack);
    if (Math.random() < profile.correctCounterRate) {
        return { slot: counter, reactionTime };
    }

    return { slot: randomWrongSlot(counter), reactionTime };
}

/**
 * Realistic AI decision.
 * Reasons: "I used X → opponent will counter with Y → I should use Z"
 * Has a doubt factor where it falls back to random.
 */
function realisticDecide(aiLastAttack, opponentLastAttack, isFirstTurn) {
    const profile = AI_PROFILES.realistic;
    const reactionTime = randomInRange(profile.reactionMin, profile.reactionMax);

    if (isFirstTurn || opponentLastAttack === null) {
        return { slot: randomSlot(), reactionTime };
    }

    // Doubt: sometimes AI second-guesses itself
    if (Math.random() < profile.doubtRate) {
        return { slot: randomSlot(), reactionTime };
    }

    // Logical reasoning: "I used X, opponent will try to beat X with Y, so I use Z"
    if (aiLastAttack !== null) {
        const expectedOpponentMove = getCounter(aiLastAttack); // what opponent should play
        const counterToExpected = getCounter(expectedOpponentMove); // what beats that
        return { slot: counterToExpected, reactionTime };
    }

    // Fallback: just counter the opponent's last move
    return { slot: getCounter(opponentLastAttack), reactionTime };
}

/**
 * Main AI decision function.
 * @param {string} difficulty - 'easy' | 'medium' | 'hard' | 'realistic'
 * @param {string|null} opponentLastAttack - opponent's previous attack slot
 * @param {string|null} aiLastAttack - AI's own previous attack slot
 * @param {boolean} isFirstTurn
 * @returns {{ slot: string, reactionTime: number }}
 */
export function aiDecide(difficulty, opponentLastAttack, aiLastAttack, isFirstTurn) {
    if (difficulty === 'realistic') {
        return realisticDecide(aiLastAttack, opponentLastAttack, isFirstTurn);
    }
    return standardDecide(difficulty, opponentLastAttack, isFirstTurn);
}
