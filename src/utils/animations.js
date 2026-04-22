import { gsap } from "gsap";

// 导出通用文字揭示动画
export const revealAnimation = (selector = ".reveal-text") => {
    // 检查页面上是否有这个元素，没有就不跑，防止报错
    if (!document.querySelector(selector)) return;

    gsap.from(selector, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.2
    });
};