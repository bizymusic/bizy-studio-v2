// src/main.js
import "./styles/global.css";
import { renderNav } from "./components/nav.js";

async function router() {
  const path = window.location.pathname;
  const app = document.getElementById("app");

  renderNav(); 
  if (app) app.innerHTML = ""; 

  try {
    if (path.includes("midiview")) {
      const { initMidi } = await import("./pages/midi.js");
      initMidi(); 
    } 
    else if (path.includes("chordgen")) {
    console.log(" 尝试加载 chordgen.js...");
    const mod = await import("./pages/chordgen.js");
    console.log("✅ 模块导出:", Object.keys(mod));
    if (typeof mod.initImmersive === "function") {
      mod.initImmersive();
    } else {
      console.error("❌ initImmersive 未导出或不是函数");
    }
    } 
    else if (path.includes("melodyimprov")) {
      const { initMelodyImprov } = await import("./pages/melodyimprov.js");
      initMelodyImprov();
    } 
    else if (path.includes("audioview")) {
      const { initAudioView } = await import("./pages/audioview.js");
      initAudioView();
    }
    else {
      const { initHome } = await import("./pages/home.js");
      initHome();
    }
  } catch (error) {
    console.error(" 路由加载错误:", error);
  }
}

window.addEventListener("popstate", router);
router();

document.body.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a && a.getAttribute("href")?.startsWith("/")) {
    e.preventDefault();
    window.history.pushState(null, "", a.getAttribute("href"));
    router();
  }
});