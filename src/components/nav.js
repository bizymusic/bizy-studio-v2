import { gsap } from "gsap";

export function renderNav() {
  // 1. 检查是否已存在导航，防止重复渲染
  if (document.getElementById("nav")) return;

  document.body.insertAdjacentHTML("afterbegin", `
    <a href="/" class="site-logo"><span class="logo-text">BIZYSTUDIO</span></a>
    <nav class="nav" id="nav">
      <div class="nav-inner" id="navInner">
        <div class="nav-links">
          <a href="index.html">Home</a>
          <a href="https://music.163.com/#/artist?id=13681128">BizyMusic</a>
          <a href="ai-music.html">AI Music</a>
          <a href="harmony.html">HarmonyLab</a>
          <div class="dropdown">
                <a href="#" class="dropdown-trigger">View</a>
                <div class="dropdown-menu">
                    <a href="audioview.html">音频可视化</a>
                    <a href="midiview.html">MIDI可视化</a>
                </div>
            </div>
        </div>
      </div>
    </nav>
  `);

  const nav = document.getElementById("nav");
  const navInner = document.getElementById("navInner");

  // ===== 滚动变色 =====
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  });

  // ===== GSAP 磁吸效果（比手动改 style 更平滑） =====
  document.addEventListener("mousemove", (e) => {
    const rect = navInner.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const distance = Math.sqrt(x * x + y * y);

    if (distance < 200) {
      gsap.to(navInner, {
        x: x * 0.1,
        y: y * 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    } else {
      gsap.to(navInner, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    }
  });

  

}

