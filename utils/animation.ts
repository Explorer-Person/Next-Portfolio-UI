import { easeOut } from "framer-motion";

/**
 * @param {'up'|'down'|'left'|'right'} direction  Direction to animate from
 * @param {number} delay   Delay before animation starts (seconds)
 * @param {number} distance   How far to animate (px)
 */
export function getSectionAnim({
    direction = "up",
    delay = 0,
    distance = 80
} = {}) {
    // eslint-disable-next-line prefer-const
    let initial: { opacity: number; x?: number; y?: number } = { opacity: 0 };
    if (direction === "up") initial.y = distance;
    if (direction === "down") initial.y = -distance;
    if (direction === "left") initial.x = distance;
    if (direction === "right") initial.x = -distance;

    // eslint-disable-next-line prefer-const
    let whileInView = { opacity: 1, x: 0, y: 0 };

    return {
        initial,
        whileInView,
        transition: { duration: 0.7, delay, ease: easeOut },
        viewport: { once: false, amount: 0.3 }
    };
}
