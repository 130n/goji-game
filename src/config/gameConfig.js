import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { SelectScene } from '../scenes/SelectScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { VictoryScene } from '../scenes/VictoryScene.js';

export const gameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: Math.min(2, Math.ceil(window.devicePixelRatio || 1)),
    },
    scene: [BootScene, PreloadScene, MenuScene, SelectScene, BattleScene, VictoryScene],
};
