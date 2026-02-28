import { describe, it, expect } from 'vitest';
import { aiDecide, getCounter } from './AISystem.js';

describe('getCounter', () => {
    it('counter for A is B (B beats A)', () => {
        expect(getCounter('A')).toBe('B');
    });
    it('counter for B is C (C beats B)', () => {
        expect(getCounter('B')).toBe('C');
    });
    it('counter for C is A (A beats C)', () => {
        expect(getCounter('C')).toBe('A');
    });
});

describe('aiDecide - standard difficulties', () => {
    it('first turn returns random slot with valid reaction time', () => {
        for (let i = 0; i < 50; i++) {
            const { slot, reactionTime } = aiDecide('medium', null, null, true);
            expect(['A', 'B', 'C']).toContain(slot);
            expect(reactionTime).toBeGreaterThanOrEqual(0.3);
            expect(reactionTime).toBeLessThanOrEqual(0.6);
        }
    });

    it('easy AI counters correctly ~40% of the time', () => {
        let correct = 0;
        const trials = 2000;
        for (let i = 0; i < trials; i++) {
            const { slot } = aiDecide('easy', 'A', null, false);
            if (slot === 'B') correct++;
        }
        const rate = correct / trials;
        expect(rate).toBeGreaterThan(0.3);
        expect(rate).toBeLessThan(0.55);
    });

    it('hard AI counters correctly ~80% of the time', () => {
        let correct = 0;
        const trials = 2000;
        for (let i = 0; i < trials; i++) {
            const { slot } = aiDecide('hard', 'A', null, false);
            if (slot === 'B') correct++;
        }
        const rate = correct / trials;
        expect(rate).toBeGreaterThan(0.7);
        expect(rate).toBeLessThan(0.9);
    });

    it('easy AI reaction times are in range', () => {
        for (let i = 0; i < 100; i++) {
            const { reactionTime } = aiDecide('easy', 'A', null, false);
            expect(reactionTime).toBeGreaterThanOrEqual(0.6);
            expect(reactionTime).toBeLessThanOrEqual(0.9);
        }
    });

    it('hard AI reaction times are in range', () => {
        for (let i = 0; i < 100; i++) {
            const { reactionTime } = aiDecide('hard', 'A', null, false);
            expect(reactionTime).toBeGreaterThanOrEqual(0.1);
            expect(reactionTime).toBeLessThanOrEqual(0.3);
        }
    });
});

describe('aiDecide - realistic difficulty', () => {
    it('predicts counter-to-counter when not doubting', () => {
        // AI used A → expects opponent to use B (counter) → AI should use C (beats B)
        let predictedCorrectly = 0;
        const trials = 2000;
        for (let i = 0; i < trials; i++) {
            const { slot } = aiDecide('realistic', 'B', 'A', false);
            if (slot === 'C') predictedCorrectly++;
        }
        // Should be ~75% (100% logic - 25% doubt)
        const rate = predictedCorrectly / trials;
        expect(rate).toBeGreaterThan(0.6);
        expect(rate).toBeLessThan(0.85);
    });

    it('reaction times are in realistic range', () => {
        for (let i = 0; i < 100; i++) {
            const { reactionTime } = aiDecide('realistic', 'A', 'B', false);
            expect(reactionTime).toBeGreaterThanOrEqual(0.2);
            expect(reactionTime).toBeLessThanOrEqual(0.5);
        }
    });

    it('first turn returns random slot', () => {
        const slots = new Set();
        for (let i = 0; i < 100; i++) {
            const { slot } = aiDecide('realistic', null, null, true);
            slots.add(slot);
        }
        expect(slots.size).toBe(3); // all slots should appear
    });
});
