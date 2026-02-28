# Kaiju Clash

Browser-based 2D kaiju fighting game. Turn-based rock-paper-scissors combat with reaction time mechanics. Supports local 2P and vs AI.

**Play:** https://130n.github.io/goji-game/

## Quick Start

```bash
npm install
npm run dev      # Dev server at localhost:8080
npm run build    # Production build to dist/
npm test         # Run all tests (53 tests)
```

## How to Play

### Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Attack A | A | J |
| Attack B | S | K |
| Attack C | D | L |

**Menu navigation:** WASD/Arrows + Space/Enter. ESC goes back.

### Combat Rules

- **Alternating turns** - only the active player can attack
- **1-second timer** - faster reaction = more damage
- **RPS mechanic** - your attack is compared to opponent's PREVIOUS attack:
  - **A beats C, B beats A, C beats B**
  - Win = full damage, Draw = 30% damage, Lose = miss
- **First turn** is free (50% base damage, no RPS check)
- **DRAW bonus** - after a draw, the next player gets +0.5s extra time (but no damage bonus)

### Mecha Godzilla

Hold the attack key to charge (up to 1.6x damage). Releasing fires the attack. Wrong RPS choice causes 3 HP self-damage (malfunction).

### AI Difficulties

| Difficulty | Behavior |
|-----------|----------|
| Easy | 40% correct counter, slow reaction (0.6-0.9s) |
| Medium | 60% correct counter, moderate (0.3-0.6s) |
| Hard | 80% correct counter, fast (0.1-0.3s) |
| Realistic | Predicts your counter, 25% doubt factor (0.2-0.5s) |

## Architecture

Pure game logic is separated from Phaser rendering. `src/systems/` has zero Phaser imports, enabling fast unit tests and balance simulations.

```
src/
├── main.js                  # Entry point
├── config/
│   ├── gameConfig.js        # Phaser config (1024x768, scale FIT)
│   ├── monsters.js          # 9 monsters with HP, damage, speed, attacks
│   └── constants.js         # Timeouts, RPS rules, AI profiles, damage multipliers
├── systems/
│   ├── CombatSystem.js      # RPS resolution, damage calc, turn state machine
│   ├── CombatSystem.test.js
│   ├── AISystem.js          # AI decision logic per difficulty
│   └── AISystem.test.js
├── scenes/
│   ├── BootScene.js         # Splash screen
│   ├── PreloadScene.js      # PNG sprite loading + progress bar
│   ├── MenuScene.js         # Mode select (1P/2P) + AI difficulty
│   ├── SelectScene.js       # 3x3 monster grid, P1/P2 preview panels
│   ├── BattleScene.js       # Main gameplay (phase state machine)
│   └── VictoryScene.js      # Results, rematch, main menu
├── ui/
│   ├── HealthBar.js         # Animated HP bar
│   ├── TimerBar.js          # Countdown with color transitions
│   ├── AttackIndicator.js   # Attack buttons with RPS result labels
│   └── MonsterSprite.js     # Sprite display with idle/attack/hit animations
└── assets/
    ├── sprites.js           # Inline SVG fallbacks (unused when PNGs load)
    └── sprites/             # Source sprite sheets (not served to browser)

public/sprites/              # Cropped idle PNG sprites (served by Vite)
tests/balance.test.js        # 81-matchup balance simulation
```

## Monster Roster

| Monster | Category | HP | DMG | Speed | Special |
|---------|----------|---:|----:|------:|---------|
| Godzilla | Balanced | 100 | 13 | 1.0x | - |
| King Kong | Balanced | 100 | 13 | 1.0x | - |
| Gamera | Tank | 120 | 12 | 0.8x | - |
| Hedorah | Tank | 120 | 12 | 0.8x | - |
| Rodan | Speed | 85 | 12 | 1.5x | - |
| Mothra | Speed | 85 | 11 | 1.6x | - |
| Anguirus | Speed | 85 | 13 | 1.4x | - |
| King Ghidorah | Bruiser | 85 | 15 | 1.0x | - |
| Mecha Godzilla | Charger | 100 | 14 | 1.0x | Charge + malfunction |

## Damage Formula

```
damage = baseDamage × speedBonus × timeMultiplier
timeMultiplier = max(0, 1.0 - reactionTime / 1.0)
```

First turn: `baseDamage × 0.5` (fixed). Draw: `baseDamage × 0.3` (fixed).

## Deployment

Pushes to `master` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Tech Stack

- **Phaser 3** (~v3.90) - game engine
- **Vite** (~v6) - bundler
- **Vitest** (~v2) - testing
- Vanilla JS, no frameworks
