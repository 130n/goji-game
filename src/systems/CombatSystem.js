import {
    RPS_WINS,
    TURN_TIMEOUT,
    FIRST_TURN_DAMAGE_MULTIPLIER,
    SAME_ATTACK_DAMAGE_MULTIPLIER,
    MECHA_MALFUNCTION_DAMAGE,
    MECHA_MAX_CHARGE_MULTIPLIER,
} from '../config/constants.js';

/**
 * Resolve RPS outcome for attacker vs defender's previous attack.
 * @returns {'win' | 'lose' | 'draw'}
 */
export function resolveRPS(attackerSlot, defenderPreviousSlot) {
    if (attackerSlot === defenderPreviousSlot) return 'draw';
    if (RPS_WINS[attackerSlot] === defenderPreviousSlot) return 'win';
    return 'lose';
}

/**
 * Calculate time multiplier from reaction time.
 * Faster reaction = higher multiplier (1.0 at 0s, 0.0 at 1s).
 */
export function getTimeMultiplier(reactionTime) {
    return Math.max(0, 1.0 - reactionTime / TURN_TIMEOUT);
}

/**
 * Calculate final damage for an attack.
 * @param {object} params
 * @param {number} params.baseDamage - Monster's base damage
 * @param {number} params.speedBonus - Monster's speed bonus multiplier
 * @param {number} params.reactionTime - Time taken to press key (seconds)
 * @param {boolean} params.isFirstTurn - Whether this is the opening attack
 * @param {'win'|'draw'|'lose'|null} params.rpsResult - RPS outcome (null for first turn)
 * @param {number|null} params.chargeTime - Seconds held for Mecha Godzilla charge
 * @returns {number} Final damage (rounded)
 */
export function calculateDamage({
    baseDamage,
    speedBonus,
    reactionTime,
    isFirstTurn,
    rpsResult,
    chargeTime = null,
}) {
    if (rpsResult === 'lose') return 0;
    if (reactionTime >= TURN_TIMEOUT) return 0;

    const timeMultiplier = getTimeMultiplier(reactionTime);

    if (isFirstTurn) {
        return Math.round(baseDamage * FIRST_TURN_DAMAGE_MULTIPLIER);
    }

    if (rpsResult === 'draw') {
        return Math.round(baseDamage * SAME_ATTACK_DAMAGE_MULTIPLIER);
    }

    // rpsResult === 'win'
    let damage = baseDamage * speedBonus * timeMultiplier;

    if (chargeTime !== null) {
        const chargeMultiplier = Math.min(
            MECHA_MAX_CHARGE_MULTIPLIER,
            1.0 + chargeTime,
        );
        damage *= chargeMultiplier;
    }

    return Math.round(damage);
}

/**
 * Create initial combat state for a match.
 */
export function createCombatState(monster1Data, monster2Data) {
    return {
        players: [
            { ...monster1Data, currentHp: monster1Data.hp, lastAttack: null },
            { ...monster2Data, currentHp: monster2Data.hp, lastAttack: null },
        ],
        turnNumber: 0,
        activePlayer: 0,
        phase: 'awaiting_input', // 'awaiting_input' | 'resolving' | 'finished'
        winner: null,
        log: [],
    };
}

/**
 * Resolve a single attack action and advance state.
 * Returns a result object describing what happened.
 *
 * @param {object} state - Combat state
 * @param {string} attackSlot - 'A', 'B', or 'C'
 * @param {number} reactionTime - Seconds taken to press key
 * @param {number|null} chargeTime - Charge hold time (Mecha only)
 * @param {number} effectiveTimeout - Timeout threshold (may be extended by draw bonus)
 */
export function resolveAttack(state, attackSlot, reactionTime, chargeTime = null, effectiveTimeout = TURN_TIMEOUT) {
    if (state.phase === 'finished') {
        return { hit: false, damage: 0, reason: 'game_over', state };
    }

    const attacker = state.players[state.activePlayer];
    const defender = state.players[1 - state.activePlayer];
    const isFirstTurn = state.turnNumber === 0;

    // Timeout check (uses effectiveTimeout, may be extended after a DRAW)
    if (reactionTime >= effectiveTimeout) {
        const result = {
            hit: false,
            damage: 0,
            reason: 'timeout',
            attackSlot,
            rpsResult: null,
        };
        attacker.lastAttack = attackSlot;
        state.log.push({ turn: state.turnNumber, player: state.activePlayer, ...result });
        advanceTurn(state);
        return { ...result, state };
    }

    // RPS resolution
    let rpsResult = null;
    if (!isFirstTurn) {
        rpsResult = resolveRPS(attackSlot, defender.lastAttack);
    }

    // Damage calculation
    const damage = calculateDamage({
        baseDamage: attacker.baseDamage,
        speedBonus: attacker.speedBonus,
        reactionTime,
        isFirstTurn,
        rpsResult,
        chargeTime: attacker.special === 'charge' ? chargeTime : null,
    });

    // Mecha malfunction: self-damage on wrong attack
    let malfunctionDamage = 0;
    if (attacker.special === 'charge' && rpsResult === 'lose') {
        malfunctionDamage = MECHA_MALFUNCTION_DAMAGE;
        attacker.currentHp = Math.max(0, attacker.currentHp - malfunctionDamage);
    }

    // Apply damage to defender
    if (damage > 0) {
        defender.currentHp = Math.max(0, defender.currentHp - damage);
    }

    const hit = damage > 0;
    const reason = isFirstTurn
        ? 'first_turn'
        : rpsResult === 'win'
          ? 'win'
          : rpsResult === 'draw'
            ? 'draw'
            : 'lose';

    const result = {
        hit,
        damage,
        reason,
        attackSlot,
        rpsResult,
        malfunctionDamage,
    };

    attacker.lastAttack = attackSlot;
    state.log.push({ turn: state.turnNumber, player: state.activePlayer, ...result });

    // Check for KO
    if (defender.currentHp <= 0) {
        state.phase = 'finished';
        state.winner = state.activePlayer;
    } else if (attacker.currentHp <= 0) {
        // Mecha malfunction KO
        state.phase = 'finished';
        state.winner = 1 - state.activePlayer;
    } else {
        advanceTurn(state);
    }

    return { ...result, state };
}

function advanceTurn(state) {
    state.activePlayer = 1 - state.activePlayer;
    state.turnNumber++;
}
