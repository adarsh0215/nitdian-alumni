import { Variants } from "framer-motion";


export const fadeUp = (delay = 0): Variants => ({
initial: { opacity: 0, y: 24 },
animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5, ease: "easeOut" } },
});


export const stagger = (staggerChildren = 0.08): Variants => ({
initial: {},
animate: { transition: { staggerChildren } },
});