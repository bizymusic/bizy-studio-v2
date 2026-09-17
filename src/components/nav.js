import { gsap } from "gsap";

export function renderNav() {
  // 1. 检查是否已存在导航，防止重复渲染
  if (document.getElementById("nav")) return;

  // 2. 插入导航 HTML
  document.body.insertAdjacentHTML("afterbegin", `
    <a href="/" class="site-logo"><span class="logo-text">BIZYSOUND</span></a>
    <nav class="nav" id="nav">
      <div class="nav-inner" id="navInner">
        <div class="nav-links">
          <!-- ===== 桌面导航 ===== -->
          <a href="index.html">BIZY</a>
          <a href="https://music.163.com/#/artist?id=13681128" target="_blank" rel="noopener">听觉日记</a>
          <a href="ai-music.html">AI音乐</a>

          <div class="dropdown">
            <a href="#" class="dropdown-trigger">创作工具</a>
            <div class="dropdown-menu">
              <a href="chordgen.html">和弦生成</a>
              <a href="melodyimprov.html">旋律即兴</a>
            </div>
          </div>

          <div class="dropdown">
            <a href="#" class="dropdown-trigger">可视化</a>
            <div class="dropdown-menu">
              <a href="audioview.html">音频波形</a>
              <a href="midiview.html">MIDI视图</a>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 手机 MENU（放 nav-inner 外面） ===== -->
      <button class="mobile-menu-btn">MENU</button>

      <div class="mobile-menu-panel">
        <a href="index.html">BIZY</a>
        <a href="https://music.163.com/#/artist?id=13681128" target="_blank" rel="noopener">听觉日记</a>
        <a href="ai-music.html">AI音乐</a>
        <a href="chordgen.html">和弦生成</a>
        <a href="melodyimprov.html">旋律即兴</a>
        <a href="audioview.html">音频波形</a>
        <a href="midiview.html">MIDI视图</a>
      </div>
    </nav>
  `);

  const nav = document.getElementById("nav");
  const navInner = document.getElementById("navInner");

  // ===== 滚动变色 =====
  window.addEventListener("scroll", () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
  });

  // ===== GSAP 磁吸效果（仅限桌面端，防止移动端误触偏位） =====
  document.addEventListener("mousemove", (e) => {
    if (window.innerWidth <= 768 || !navInner) return;

    const rect = navInner.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const distance = Math.sqrt(x * x + y * y);

    if (distance < 100) {
      gsap.to(navInner, {
        x: x * 0.1,
        y: y * 0.1,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    } else {
      gsap.to(navInner, { 
        x: 0, 
        y: 0, 
        duration: 0.5, 
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto"
      });
    }
  });

  // ===== 手机菜单交互（采用全局事件委托，保证 100% 能触发） =====
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".mobile-menu-btn");
    if (!btn) return;

    const panel = document.querySelector(".mobile-menu-panel");
    if (panel) {
      panel.classList.toggle("active");
      btn.textContent = panel.classList.contains("active") ? "CLOSE" : "MENU";
    }
  });
}