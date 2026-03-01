# Mobile Touch Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the game playable on mobile via touch while preserving keyboard controls.

**Architecture:** Add swipe navigation + larger hit areas to MenuScene, touch interactivity to AttackIndicator buttons, fix SelectScene two-tap flow with blinking/confirmed cursor states, and add a CSS rotate-hint overlay for portrait mode. VictoryScene already has full touch support.

**Tech Stack:** Phaser 3 (setInteractive, pointer events), vanilla CSS/HTML

---

### Task 1: Rotate Hint Overlay

**Files:**
- Modify: `index.html`
- Modify: `public/style.css`

**Step 1: Add rotate overlay HTML**

In `index.html`, add after the game-container div:

```html
<div id="rotate-hint">
    <div class="rotate-content">
        <div class="rotate-icon">⤾</div>
        <div class="rotate-text">ROTATE YOUR DEVICE</div>
    </div>
</div>
```

**Step 2: Add rotate overlay CSS**

In `public/style.css`, add:

```css
#rotate-hint {
    display: none;
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    z-index: 9999;
    justify-content: center;
    align-items: center;
    color: #ff6600;
    font-family: monospace;
    font-size: 24px;
    text-align: center;
}

.rotate-icon {
    font-size: 72px;
    margin-bottom: 20px;
    animation: rotate-pulse 2s ease-in-out infinite;
}

.rotate-text {
    letter-spacing: 2px;
}

@keyframes rotate-pulse {
    0%, 100% { transform: rotate(0deg); opacity: 0.7; }
    50% { transform: rotate(90deg); opacity: 1; }
}

@media (orientation: portrait) {
    #rotate-hint {
        display: flex;
    }
}
```

**Step 3: Verify manually**

Run: `npm run dev`
Open on mobile or use Chrome DevTools responsive mode in portrait. Overlay should appear. Switch to landscape — overlay should hide.

**Step 4: Commit**

```bash
git add index.html public/style.css
git commit -m "feat: add rotate-device overlay for portrait mode"
```

---

### Task 2: MenuScene Swipe Navigation + Larger Hit Areas

**Files:**
- Modify: `src/scenes/MenuScene.js`

MenuScene already has `pointerdown` on text objects, but the hit areas are tiny (just the text bounds). Add invisible background rects as larger tap targets, and add swipe up/down to change selection.

**Step 1: Add larger hit areas behind menu buttons**

In `createMainButtons`, create a hit rect behind each text:

```javascript
const hitArea = this.add.rectangle(centerX, y, 400, 55, 0x000000, 0)
    .setInteractive({ useHandCursor: true });

hitArea.on('pointerover', () => {
    if (this.menuState === 'main') {
        this.selectedIndex = i;
        this.updateHighlights();
    }
});

hitArea.on('pointerdown', () => {
    if (this.menuState === 'main') {
        this.selectedIndex = i;
        this.confirmSelection();
    }
});
```

Do the same in `createDifficultyButtons` with width 400, height 45.

Remove the existing `setInteractive`/`pointerover`/`pointerdown` from the text objects (move them to the hit rects). Keep the text objects non-interactive.

**Step 2: Add swipe detection**

In `create()`, after `this.setupInput()`, add swipe detection:

```javascript
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
```

This fires on any swipe on the full scene — swipe down = next option, swipe up = previous.

**Step 3: Verify manually**

Run: `npm run dev`
- Tap on menu button area (not just text) → selects and confirms
- Swipe up/down → changes highlighted option
- Keyboard still works

**Step 4: Commit**

```bash
git add src/scenes/MenuScene.js
git commit -m "feat: larger tap areas and swipe navigation for menu"
```

---

### Task 3: SelectScene Two-Tap Flow + Blinking Cursor

**Files:**
- Modify: `src/scenes/SelectScene.js`

The current `onCardClicked` (line 313) immediately confirms on any tap. Change to: first tap moves cursor, second tap on same card confirms.

**Step 1: Fix onCardClicked for two-tap flow**

Replace the existing `onCardClicked` method:

```javascript
onCardClicked(index) {
    if (this.selectionState === SEL_STATE.P1_SELECTING) {
        if (this.p1CursorIndex === index) {
            this.confirmCurrent();
        } else {
            this.p1CursorIndex = index;
            this.updateCursors();
        }
    } else if (this.selectionState === SEL_STATE.P2_SELECTING) {
        if (this.p2CursorIndex === index) {
            this.confirmCurrent();
        } else {
            this.p2CursorIndex = index;
            this.updateCursors();
        }
    }
}
```

**Step 2: Add blinking cursor tween**

In `updateCursors`, after setting cursor alpha, add a blink tween on the active cursor. Track the tween so it can be stopped on confirm.

In `create()`, initialize: `this.cursorBlinkTween = null;`

Replace the `updateCursors` method:

```javascript
updateCursors() {
    // Kill previous blink tween
    if (this.cursorBlinkTween) {
        this.cursorBlinkTween.stop();
        this.cursorBlinkTween = null;
    }

    for (let i = 0; i < this.cards.length; i++) {
        const card = this.cards[i];

        // Active cursor (blinking)
        const showP1Cursor = this.selectionState === SEL_STATE.P1_SELECTING && i === this.p1CursorIndex;
        const showP2Cursor = this.selectionState === SEL_STATE.P2_SELECTING && i === this.p2CursorIndex;
        card.p1Cursor.setAlpha(showP1Cursor ? 1 : 0);
        card.p2Cursor.setAlpha(showP2Cursor ? 1 : 0);

        // Confirmed borders — solid with double frame
        const p1Confirmed = this.p1Selection && this.p1Selection.id === card.monster.id;
        const p2Confirmed = this.p2Selection && this.p2Selection.id === card.monster.id;
        card.p1Border.setAlpha(p1Confirmed ? 1 : 0);
        card.p2Border.setAlpha(p2Confirmed ? 1 : 0);

        // Double frame for confirmed selections
        if (!card.p1InnerBorder) {
            card.p1InnerBorder = this.add.rectangle(card.x, card.y, CARD_WIDTH - 2, CARD_HEIGHT - 2)
                .setStrokeStyle(2, 0x4488ff).setFillStyle().setAlpha(0);
            card.p2InnerBorder = this.add.rectangle(card.x, card.y, CARD_WIDTH - 2, CARD_HEIGHT - 2)
                .setStrokeStyle(2, 0xff4444).setFillStyle().setAlpha(0);
        }
        card.p1InnerBorder.setAlpha(p1Confirmed ? 1 : 0);
        card.p2InnerBorder.setAlpha(p2Confirmed ? 1 : 0);
    }

    // Blink the active cursor
    const activeCursorTarget = this.selectionState === SEL_STATE.P1_SELECTING
        ? this.cards[this.p1CursorIndex]?.p1Cursor
        : this.selectionState === SEL_STATE.P2_SELECTING
            ? this.cards[this.p2CursorIndex]?.p2Cursor
            : null;

    if (activeCursorTarget) {
        this.cursorBlinkTween = this.tweens.add({
            targets: activeCursorTarget,
            alpha: { from: 1, to: 0.3 },
            duration: 500,
            yoyo: true,
            repeat: -1,
        });
    }

    this.updatePreviews();
}
```

**Step 3: Verify manually**

Run: `npm run dev`
- Tap a card → cursor moves there (blinks)
- Tap same card again → confirms (double frame, solid)
- Keyboard still works as before

**Step 4: Commit**

```bash
git add src/scenes/SelectScene.js
git commit -m "feat: two-tap select flow with blinking cursor and double confirmed frame"
```

---

### Task 4: Touch Support for Attack Buttons

**Files:**
- Modify: `src/ui/AttackIndicator.js`
- Modify: `src/scenes/BattleScene.js`

**Step 1: Enlarge buttons and make them interactive in AttackIndicator**

In `AttackIndicator.js`, change button constants:

```javascript
const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 48;
```

Add `setInteractive()` on each button bg and store an `onTap` callback:

In the constructor, after creating each button bg, add:

```javascript
bg.setInteractive({ useHandCursor: true });
bg.on('pointerdown', () => {
    if (this.onAttackTap) this.onAttackTap(slot);
});
```

Add a public callback property initialized to null:
```javascript
this.onAttackTap = null;
```

Also update the label font to match the larger buttons:
```javascript
const label = scene.add.text(bx, by + BUTTON_HEIGHT / 2, labelText, {
    fontSize: '18px',  // was 16px
    fontFamily: 'monospace',
    color: '#cccccc',
}).setOrigin(0.5, 0.5);
```

**Step 2: Wire touch callbacks in BattleScene**

In `BattleScene.js`, at the end of `createAttackIndicators()`, set up the tap callbacks:

```javascript
this.p1Attacks.onAttackTap = (slot) => {
    if (this.battleState.activePlayer !== 0) return;
    if (this.inputLocked || this.currentPhase !== PHASE.AWAITING_INPUT) return;
    if (this.mode === 'ai' && this.battleState.activePlayer === 1) return;
    this.inputLocked = true;
    const reactionTime = (performance.now() - this.turnStartTime) / 1000;
    this.highlightAttackSlot(0, slot);
    this.unbindAllKeys();
    this.resolveCurrentTurn(slot, reactionTime, null);
};

this.p2Attacks.onAttackTap = (slot) => {
    if (this.battleState.activePlayer !== 1) return;
    if (this.inputLocked || this.currentPhase !== PHASE.AWAITING_INPUT) return;
    if (this.mode === 'ai') return; // AI controls P2
    this.inputLocked = true;
    const reactionTime = (performance.now() - this.turnStartTime) / 1000;
    this.highlightAttackSlot(1, slot);
    this.unbindAllKeys();
    this.resolveCurrentTurn(slot, reactionTime, null);
};
```

Note: Touch skips charge mechanic for simplicity — single tap always fires immediately without charge. Keyboard charge still works.

**Step 3: Verify manually**

Run: `npm run dev`
- Start a battle, tap attack buttons → should select that attack
- Buttons should be visibly larger (300x48)
- Keyboard still works in parallel
- In AI mode, P2 buttons should not respond to tap

**Step 4: Commit**

```bash
git add src/ui/AttackIndicator.js src/scenes/BattleScene.js
git commit -m "feat: touchable attack buttons (300x48) in battle scene"
```

---

### Task 5: Final Polish & Viewport Meta

**Files:**
- Modify: `index.html`

**Step 1: Improve viewport meta for mobile**

Replace the existing viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

This prevents pinch-to-zoom interfering with the game.

**Step 2: Verify full flow on mobile**

Run: `npm run dev`
Test full flow on a phone or Chrome DevTools mobile emulation:
1. Portrait → rotate overlay shown
2. Landscape → menu appears, tap "1 PLAYER" → works
3. Difficulty select → tap option → works
4. Character select → tap card (cursor moves), tap again (confirms), tap another for P2
5. Battle → tap attack buttons → works
6. Victory → tap REMATCH or MAIN MENU → works

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: mobile viewport meta prevents pinch-zoom"
```
