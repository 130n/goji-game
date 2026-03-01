import Phaser from 'phaser';

const BUTTON_STYLE = {
    fontSize: '28px',
    fontFamily: 'monospace',
    color: '#cccccc',
    stroke: '#000000',
    strokeThickness: 3,
};

const BUTTON_HOVER_COLOR = '#ffffff';
const BUTTON_SELECTED_COLOR = '#ff6600';
const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'realistic'];
const DIFFICULTY_LABELS = {
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD',
    realistic: 'REALISTIC',
};

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        const centerX = 512;

        // Background
        this.add.rectangle(centerX, 384, 1024, 768, 0x1a1a2e);

        // Title
        this.add.text(centerX, 100, 'KAIJU CLASH', {
            fontSize: '72px',
            fontFamily: 'monospace',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 8,
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(centerX, 170, 'MONSTER FIGHTING GAME', {
            fontSize: '22px',
            fontFamily: 'monospace',
            color: '#cc8844',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // Footer
        this.add.text(centerX, 720, 'A/S/D = P1 ATTACKS   J/K/L = P2 ATTACKS', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#666688',
        }).setOrigin(0.5);

        // State
        this.menuState = 'main'; // 'main' or 'difficulty'
        this.selectedIndex = 0;
        this.mainButtons = [];
        this.mainHitRects = [];
        this.difficultyButtons = [];
        this.difficultyHitRects = [];

        this.createMainButtons(centerX);
        this.createDifficultyButtons(centerX);
        this.setupInput();

        // Swipe detection for touch navigation
        this.input.on('pointerdown', (pointer) => {
            this.swipeStartY = pointer.y;
        });

        this.input.on('pointerup', (pointer) => {
            if (this.swipeStartY === undefined) return;
            const dy = pointer.y - this.swipeStartY;
            const MIN_SWIPE = 40;
            if (Math.abs(dy) > MIN_SWIPE) {
                this.moveSelection(dy > 0 ? 1 : -1);
            }
            this.swipeStartY = undefined;
        });

        this.updateHighlights();
    }

    createMainButtons(centerX) {
        const startY = 320;
        const gap = 70;

        const labels = ['1 PLAYER', '2 PLAYERS'];
        for (let i = 0; i < labels.length; i++) {
            const y = startY + i * gap;

            // Invisible hit rect: 400x55, centered on button position
            const hitRect = this.add.rectangle(centerX, y, 400, 55, 0x000000, 0)
                .setInteractive({ useHandCursor: true });

            hitRect.on('pointerover', () => {
                if (this.menuState === 'main') {
                    this.selectedIndex = i;
                    this.updateHighlights();
                }
            });

            hitRect.on('pointerdown', () => {
                if (this.menuState === 'main') {
                    this.selectedIndex = i;
                    this.confirmSelection();
                }
            });

            const text = this.add.text(centerX, y, labels[i], { ...BUTTON_STYLE })
                .setOrigin(0.5);

            this.mainHitRects.push(hitRect);
            this.mainButtons.push(text);
        }
    }

    createDifficultyButtons(centerX) {
        const startY = 300;
        const gap = 55;

        // Difficulty header
        this.difficultyHeader = this.add.text(centerX, startY - 50, 'SELECT DIFFICULTY', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffaa22',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setVisible(false);

        for (let i = 0; i < DIFFICULTY_OPTIONS.length; i++) {
            const y = startY + i * gap;
            const label = DIFFICULTY_LABELS[DIFFICULTY_OPTIONS[i]];

            // Invisible hit rect: 400x45, centered on button position
            const hitRect = this.add.rectangle(centerX, y, 400, 45, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .setVisible(false);

            hitRect.on('pointerover', () => {
                if (this.menuState === 'difficulty') {
                    this.selectedIndex = i;
                    this.updateHighlights();
                }
            });

            hitRect.on('pointerdown', () => {
                if (this.menuState === 'difficulty') {
                    this.selectedIndex = i;
                    this.confirmSelection();
                }
            });

            const text = this.add.text(centerX, y, label, {
                fontSize: '26px',
                fontFamily: 'monospace',
                color: '#cccccc',
                stroke: '#000000',
                strokeThickness: 3,
            })
                .setOrigin(0.5)
                .setVisible(false);

            this.difficultyHitRects.push(hitRect);
            this.difficultyButtons.push(text);
        }

        // Back hint
        this.backHint = this.add.text(centerX, startY + DIFFICULTY_OPTIONS.length * gap + 20, '[ ESC = BACK ]', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#666688',
        }).setOrigin(0.5).setVisible(false);
    }

    setupInput() {
        this.input.keyboard.on('keydown-UP', () => {
            this.moveSelection(-1);
        });
        this.input.keyboard.on('keydown-DOWN', () => {
            this.moveSelection(1);
        });
        this.input.keyboard.on('keydown-ENTER', () => {
            this.confirmSelection();
        });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.confirmSelection();
        });
        this.input.keyboard.on('keydown-ESC', () => {
            this.goBack();
        });
    }

    moveSelection(delta) {
        const buttons = this.menuState === 'main' ? this.mainButtons : this.difficultyButtons;
        this.selectedIndex = (this.selectedIndex + delta + buttons.length) % buttons.length;
        this.updateHighlights();
    }

    updateHighlights() {
        const isMain = this.menuState === 'main';

        // Update main buttons
        this.mainButtons.forEach((btn, i) => {
            if (isMain && i === this.selectedIndex) {
                btn.setColor(BUTTON_SELECTED_COLOR);
                btn.setFontSize('32px');
            } else {
                btn.setColor('#cccccc');
                btn.setFontSize('28px');
            }
        });

        // Update difficulty buttons
        this.difficultyButtons.forEach((btn, i) => {
            if (!isMain && i === this.selectedIndex) {
                btn.setColor(BUTTON_SELECTED_COLOR);
                btn.setFontSize('30px');
            } else {
                btn.setColor('#cccccc');
                btn.setFontSize('26px');
            }
        });
    }

    confirmSelection() {
        if (this.menuState === 'main') {
            if (this.selectedIndex === 0) {
                // 1 PLAYER -> show difficulty menu
                this.showDifficultyMenu();
            } else {
                // 2 PLAYERS -> go directly to select
                this.scene.start('Select', { mode: 'local', aiDifficulty: null });
            }
        } else if (this.menuState === 'difficulty') {
            const difficulty = DIFFICULTY_OPTIONS[this.selectedIndex];
            this.scene.start('Select', { mode: 'ai', aiDifficulty: difficulty });
        }
    }

    showDifficultyMenu() {
        this.menuState = 'difficulty';
        this.selectedIndex = 0;

        // Hide main buttons and hit rects
        this.mainButtons.forEach((btn) => btn.setVisible(false));
        this.mainHitRects.forEach((r) => r.setVisible(false));

        // Show difficulty buttons and hit rects
        this.difficultyHeader.setVisible(true);
        this.difficultyButtons.forEach((btn) => btn.setVisible(true));
        this.difficultyHitRects.forEach((r) => r.setVisible(true));
        this.backHint.setVisible(true);

        this.updateHighlights();
    }

    showMainMenu() {
        this.menuState = 'main';
        this.selectedIndex = 0;

        // Show main buttons and hit rects
        this.mainButtons.forEach((btn) => btn.setVisible(true));
        this.mainHitRects.forEach((r) => r.setVisible(true));

        // Hide difficulty buttons and hit rects
        this.difficultyHeader.setVisible(false);
        this.difficultyButtons.forEach((btn) => btn.setVisible(false));
        this.difficultyHitRects.forEach((r) => r.setVisible(false));
        this.backHint.setVisible(false);

        this.updateHighlights();
    }

    goBack() {
        if (this.menuState === 'difficulty') {
            this.showMainMenu();
        }
    }
}
