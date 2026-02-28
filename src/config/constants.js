// Timing
export const TURN_TIMEOUT = 1.0; // seconds
export const FIRST_TURN_DAMAGE_MULTIPLIER = 0.5;
export const SAME_ATTACK_DAMAGE_MULTIPLIER = 0.3;
export const DRAW_BONUS_TIME = 0.5; // extra seconds granted to opponent after a DRAW

// Mecha Godzilla
export const MECHA_MALFUNCTION_DAMAGE = 3;
export const MECHA_MAX_CHARGE_MULTIPLIER = 1.6;

// RPS: key beats value (A beats C, B beats A, C beats B)
export const RPS_WINS = { A: 'C', B: 'A', C: 'B' };
export const ATTACK_SLOTS = ['A', 'B', 'C'];

// AI difficulty profiles
export const AI_PROFILES = {
    easy: { correctCounterRate: 0.40, reactionMin: 0.6, reactionMax: 0.9 },
    medium: { correctCounterRate: 0.60, reactionMin: 0.3, reactionMax: 0.6 },
    hard: { correctCounterRate: 0.80, reactionMin: 0.1, reactionMax: 0.3 },
    realistic: {
        doubtRate: 0.25,
        reactionMin: 0.2,
        reactionMax: 0.5,
        thinkInterval: 0.4,
        adjustWindow: 0.5, // fraction of thinkInterval where AI can change its mind
    },
};
