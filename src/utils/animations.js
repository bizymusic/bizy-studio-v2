import { gsap } from "gsap";

export const revealAnimation = (selector = ".reveal-text") => {
    const el = document.querySelector(selector);
    if (!el) return;

    gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        // 核心：动画跑完后，立刻删掉 GSAP 留下的所有 style 痕迹
        onComplete: () => {
            gsap.set(el, { clearProps: "all" });
        }
    });
};