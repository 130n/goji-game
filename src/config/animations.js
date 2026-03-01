/**
 * Animation frame data for monsters that have sprite sheet animations.
 * Key = monster id, value = { idle: number of frames, frameRate: fps }
 */
export const MONSTER_ANIMS = {
    rodan: { idle: 3, frameRate: 6 },
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
