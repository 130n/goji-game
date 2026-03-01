/**
 * Animation frame data for monsters that have sprite sheet animations.
 * Key = monster id, value = { idle: number of frames, frameRate: fps }
 */
export const MONSTER_ANIMS = {
    rodan: { idle: 3, frameRate: 6 },
    anguirus: { idle: 3, frameRate: 6 },
    mechagodzilla: { idle: 4, frameRate: 6 },
    godzilla: { idle: 3, frameRate: 6 },
    kingkong: { idle: 3, frameRate: 5 },
    hedorah: { idle: 3, frameRate: 4 },
    ghidorah: { idle: 3, frameRate: 5 },
    mothra: { idle: 3, frameRate: 8 },
    gamera: { idle: 3, frameRate: 4 },
};

/**
 * Get the texture keys for a monster's idle animation.
 * Returns null if the monster has no animation frames.
 */
export function getIdleFrameKeys(monsterId) {
    const anim = MONSTER_ANIMS[monsterId];
    if (!anim) return null;
    const keys = [];
    for (let i = 0; i < anim.idle; i++) {
        keys.push(`anim_${monsterId}_idle_${i}`);
    }
    return keys;
}
