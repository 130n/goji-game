import Phaser from 'phaser';

const CATEGORY_COLORS = {
    balanced: 0x4488ff,
    tank: 0x44aa44,
    speed: 0xffaa22,
    bruiser: 0xff4444,
    charger: 0xaa44ff,
};

export class VictoryScene extends Phaser.Scene {
    constructor() {
        super('Victory');
    }

    init(data) {
        this.winnerData = data.winner;
        this.loserData = data.loser;
        this.winnerPlayer = data.winnerPlayer; // 1 or 2
        this.battleLog = data.battleLog || [];
        this.mode = data.mode || 'local';
        this.aiDifficulty = data.aiDifficulty || null;
    }

    create() {
        const centerX = 512;

        // Background
        this.add.rectangle(centerX, 384, 1024, 768, 0x1a1a2e);

        // "PLAYER N WINS!" title
        const winText = this.add.text(centerX, 80, `PLAYER ${this.winnerPlayer} WINS!`, {
            fontSize: '52px',
            fontFamily: 'monospace',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        // Animate title in
        this.tweens.add({
            targets: winText,
            alpha: 1,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut',
        });

        // Winner monster name
        const winnerName = this.add.text(centerX, 160, this.winnerData.name.toUpperCase(), {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: winnerName,
            alpha: 1,
            duration: 400,
            delay: 300,
        });

        // Winner monster colored rectangle
        const winnerColor = CATEGORY_COLORS[this.winnerData.category] || 0x888888;
        const winnerRect = this.add.rectangle(centerX, 320, 140, 140, winnerColor)
            .setStrokeStyle(3, 0xffd700)
            .setAlpha(0)
            .setScale(0.3);

        // Winner label inside rectangle
        const winnerInitial = this.add.text(centerX, 320, this.winnerData.name.charAt(0), {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setAlpha(0);

        // Animate winner rect: scale up with bounce
        this.tweens.add({
            targets: [winnerRect, winnerInitial],
            alpha: 1,
            scale: 1,
            duration: 700,
            delay: 400,
            ease: 'Back.easeOut',
        });

        // Victory pulsing animation on the rectangle
        this.tweens.add({
            targets: winnerRect,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: 1100,
            ease: 'Sine.easeInOut',
        });

        // Gold star particles around the winner
        this.createVictoryStars(centerX, 320);

        // "defeated" text
        this.add.text(centerX, 430, 'defeated', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#666688',
        }).setOrigin(0.5);

        // Loser monster name (dimmed)
        this.add.text(centerX, 465, this.loserData.name, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#555566',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // Buttons
        this.createButtons(centerX);

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-R', () => this.rematch());
        this.input.keyboard.on('keydown-M', () => this.mainMenu());
        this.input.keyboard.on('keydown-ENTER', () => this.rematch());
        this.input.keyboard.on('keydown-ESC', () => this.mainMenu());
    }

    createVictoryStars(cx, cy) {
        // Create procedural gold stars/sparkles around winner
        const starCount = 12;
        const radius = 110;

        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            const star = this.add.text(x, y, '*', {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: '#ffd700',
            }).setOrigin(0.5).setAlpha(0);

            // Staggered fade-in with twinkle
            this.tweens.add({
                targets: star,
                alpha: { from: 0, to: 1 },
                scale: { from: 0.3, to: 1.2 },
                duration: 400,
                delay: 600 + i * 80,
                onComplete: () => {
                    // Continuous twinkle
                    this.tweens.add({
                        targets: star,
                        alpha: { from: 1, to: 0.3 },
                        scale: { from: 1.2, to: 0.8 },
                        duration: 600 + Math.random() * 400,
                        yoyo: true,
                        repeat: -1,
                        delay: Math.random() * 300,
                    });
                },
            });
        }
    }

    createButtons(centerX) {
        const buttonY = 580;
        const buttonGap = 200;

        // REMATCH button
        const rematchBtn = this.add.text(centerX - buttonGap / 2, buttonY, 'REMATCH', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 3,
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        rematchBtn.on('pointerover', () => rematchBtn.setColor('#ffaa44'));
        rematchBtn.on('pointerout', () => rematchBtn.setColor('#ff6600'));
        rematchBtn.on('pointerdown', () => this.rematch());

        // Keyboard hint
        this.add.text(centerX - buttonGap / 2, buttonY + 30, '[R]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#555577',
        }).setOrigin(0.5);

        // MAIN MENU button
        const menuBtn = this.add.text(centerX + buttonGap / 2, buttonY, 'MAIN MENU', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#4488ff',
            stroke: '#000000',
            strokeThickness: 3,
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setColor('#66aaff'));
        menuBtn.on('pointerout', () => menuBtn.setColor('#4488ff'));
        menuBtn.on('pointerdown', () => this.mainMenu());

        // Keyboard hint
        this.add.text(centerX + buttonGap / 2, buttonY + 30, '[M]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#555577',
        }).setOrigin(0.5);
    }

    rematch() {
        this.scene.start('Select', {
            mode: this.mode,
            aiDifficulty: this.mode === 'ai' ? this.aiDifficulty : null,
        });
    }

    mainMenu() {
        this.scene.start('Menu');
    }
}
