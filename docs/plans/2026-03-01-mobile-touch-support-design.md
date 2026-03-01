# Mobile Touch Support Design

## Goal
Make the game playable on mobile phones via touch input while keeping the existing keyboard controls and 1024x768 landscape layout.

## Decisions
- **Orientation**: Keep landscape 1024x768. Show rotate-hint overlay when in portrait.
- **Attack buttons**: Keep under active player's monster, enlarge to 300x48px.
- **Select flow**: Tap card = move cursor (preview). Tap same card again = confirm.
- **Cursor feedback**: Blinking frame while browsing, double frame when confirmed.

## Per-Scene Changes

### Rotate Hint (HTML/CSS overlay)
- Detect `window.innerHeight > window.innerWidth`
- Show fullscreen overlay: "Rotate your device" + rotation icon
- Listen to `resize` event, hide when landscape
- Pure HTML/CSS, outside Phaser canvas

### MenuScene
- Each menu option (`setInteractive()`) — tap = select + confirm
- Difficulty options same treatment

### SelectScene
- Each monster card `setInteractive()` on its background rect
- Tap card: if cursor not on this card → move cursor here. If already on this card → confirm selection
- **Blinking cursor**: Tween alpha 0.3↔1.0, duration 500ms, yoyo, repeat -1
- **Confirmed frame**: Stop blink tween, set alpha 1.0, add second inner rect (4px gap inward)

### BattleScene
- Attack indicator buttons `setInteractive()` — tap = select that attack
- Enlarge buttons: 300x48px (from 260x36px)
- Only active player's buttons are interactive

### VictoryScene
- "REMATCH" and "MENU" text `setInteractive()` — tap = same as R/M key

## What Does NOT Change
- Game resolution (1024x768)
- Scale mode (FIT + CENTER_BOTH)
- Keyboard controls (preserved in parallel)
- Monster positions, HP bars, timer bars
