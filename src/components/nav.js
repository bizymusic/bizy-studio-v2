export function renderNav() {

  document.body.insertAdjacentHTML("afterbegin", `
    <a href="/" class="site-logo">
      <span class="logo-text">BIZYSTUDIO</span>
    </a>
    
    <nav class="nav" id="nav">
        <div class="nav-inner" id="navInner">
                <div class="nav-links">
                <a href="/">Home</a>
                <a href="https://music.163.com/#/artist?id=13681128">BizyMusic</a>
                <a href="#">AI Music</a>
                <a href="#">HarmonyLab</a>
                <a href="midiview.html">MIDI可视化</a>
            </div>
        </div>
    </nav>
  `);

    // 👇 组件内部绑定逻辑
    const nav = document.getElementById("nav");
    const navInner = document.getElementById("navInner");

    // ===== 滚动变实色 =====
    window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
    });

    // ===== 磁吸效果（高级感核心）=====
    document.addEventListener("mousemove", (e) => {
    const rect = navInner.getBoundingClientRect();

    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    const distance = Math.sqrt(x * x + y * y);

    // 只有靠近才触发
    if (distance < 200) {
        navInner.style.transform = `
        translate(${x * 0.05}px, ${y * 0.05}px)
        scale(1)
        `;
    } else {
        navInner.style.transform = `translate(0,0) scale(1)`;
    }
    });

    // ===== 鼠标离开恢复 =====
    document.addEventListener("mouseleave", () => {
    navInner.style.transform = `translate(0,0) scale(1)`;
    });

}