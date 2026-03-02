/**
 * Web Audio-based sound effects for battle.
 * Plays the Ifukube Godzilla march motif one note per attack,
 * plus hit thuds, menu blips, and victory arpeggios.
 */
export class AttackSound {
    constructor() {
        this._ctx = null;
        // Godzilla march motif: G3 G3 G3 G3 Bb3 Bb3
        this._notes = [196, 196, 196, 196, 233.08, 233.08];
        this._durations = [400, 150, 150, 150, 400, 400]; // ms
        this._noteIndex = 0;
    }

    _ensureContext() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
        return this._ctx;
    }

    /**
     * Play the next note in the Godzilla march sequence.
     */
    playNext() {
        const ctx = this._ensureContext();
        const freq = this._notes[this._noteIndex];
        const dur = this._durations[this._noteIndex] / 1000;
        this._noteIndex = (this._noteIndex + 1) % this._notes.length;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        // Low-pass for a heavier monster feel
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;

        // Envelope: quick attack, sustain, release
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
        gain.gain.setValueAtTime(0.25, now + dur * 0.7);
        gain.gain.linearRampToValueAtTime(0, now + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
    }

    /**
     * Play a low thud on hit.
     */
    playHit() {
        const ctx = this._ensureContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 60;

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    /**
     * Short click/blip for menu selection.
     */
    playBlip() {
        const ctx = this._ensureContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 880;

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Ascending arpeggio for victory.
     */
    playVictory() {
        const ctx = this._ensureContext();
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        const spacing = 0.12;

        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const start = ctx.currentTime + i * spacing;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.01);
            gain.gain.setValueAtTime(0.15, start + 0.1);
            gain.gain.linearRampToValueAtTime(0, start + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.25);
        });
    }
}

// Singleton for use across scenes
export const attackSound = new AttackSound();
