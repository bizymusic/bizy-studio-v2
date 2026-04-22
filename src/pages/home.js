import { renderNav } from "../components/nav.js";
import { revealAnimation } from "../utils/animations.js"; // 👈 引入动画工具

export function initHome() {
  // 1. 渲染导航
  renderNav();

  // 2. 渲染主内容
  document.getElementById("app").innerHTML = `
    <main>
      <section class="hero">
        <div class="hero-title">
          <h1 class="reveal-text">Bizy Studio</h1>
          <h1 class="reveal-text accent">ENGINEERING</h1>
        </div>
      </section>
      <footer class="site-footer">
         BIZY STUDIO / MUSIC PRODUCER & WEB DEVELOPER. © 2026
      </footer>
    </main>
  `;

  // 3. 内容装载后，立刻执行动画
  revealAnimation();
}

// 执行初始化
initHome();