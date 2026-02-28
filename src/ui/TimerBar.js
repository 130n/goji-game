import Phaser from 'phaser';

export class TimerBar {
    /**
     * A countdown timer bar that shrinks over a given duration.
     * Color transitions: green > yellow > red as time runs out.
     *
     * @param {Phaser.Scene} scene
     * @param {number} x - Left edge x position
     * @param {number} y - Top edge y position
     * @param {number} width - Full bar width in pixels
     */
    constructor(scene, x, y, width) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 8;

        // Background track
        this.bg = scene.add.rectangle(x, y, width, this.height, 0x333333)
            .setOrigin(0, 0);

        // Foreground countdown bar
        this.bar = scene.add.rectangle(x, y, width, this.height, 0x44ff44)
            .setOrigin(0, 0);

        this._tween = null;
        this._colorTimer = null;
        this._onComplete = null;
        this._durationMs = 0;
        this._startTime = 0;
    }

    /**
     * Start the countdown.
     * @param {number} durationMs - Duration in milliseconds
     * @param {Function} [onComplete] - Called when the bar reaches zero
     */
    start(durationMs, onComplete) {
        this.stop();
        this.reset();

        this._durationMs = durationMs;
        this._startTime = this.scene.time.now;
        this._onComplete = onComplete || null;

        // Shrink the bar from full width to 0
        this._tween = this.scene.tweens.add({
            targets: this.bar,
            displayWidth: 0,
            duration: durationMs,
            ease: 'Linear',
            onComplete: () => {
                this._stopColorTimer();
                if (this._onComplete) {
                    this._onComplete();
                }
            },
        });

        // Update color based on remaining fraction
        this._colorTimer = this.scene.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => this._updateColor(),
        });
    }

    /**
     * Freeze the bar at its current position.
     * @returns {number} Elapsed time in seconds since start was called
     */
    stop() {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;
        }
        this._stopColorTimer();

        if (this._startTime > 0) {
            const elapsed = (this.scene.time.now - this._startTime) / 1000;
            return Math.min(elapsed, this._durationMs / 1000);
        }
        return 0;
    }

    /** Reset the bar to full width and green color. */
    reset() {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;
        }
        this._stopColorTimer();

        this.bar.displayWidth = this.width;
        this.bar.fillColor = 0x44ff44;
        this._startTime = 0;
        this._durationMs = 0;
        this._onComplete = null;
    }

    /** @private */
    _updateColor() {
        if (this._durationMs <= 0) return;

        const fraction = this.bar.displayWidth / this.width;

        if (fraction > 0.5) {
            this.bar.fillColor = 0x44ff44; // green
        } else if (fraction > 0.25) {
            this.bar.fillColor = 0xffcc00; // yellow
        } else {
            this.bar.fillColor = 0xff4444; // red
        }
    }

    /** @private */
    _stopColorTimer() {
        if (this._colorTimer) {
            this._colorTimer.destroy();
            this._colorTimer = null;
        }
    }

    /** Show or hide the timer bar. */
    setVisible(visible) {
        this.bg.setVisible(visible);
        this.bar.setVisible(visible);
    }

    /** Remove all game objects from the scene. */
    destroy() {
        this.stop();
        this.bg.destroy();
        this.bar.destroy();
    }
}
