import "./styles/global.css";
import { renderNav } from "./components/nav.js";

async function router() {
  const path = window.location.pathname;
  const app = document.getElementById("app");

  // 1. 核心改进：只要跳转，先画导航！
  renderNav(); 

  if (app) app.innerHTML = ""; 

try {
  // 清空 app 容器，防止页面叠加
  const app = document.getElementById("app");
  if (app) app.innerHTML = ""; 

  if (path.includes("midiview")) {
    const { initMidi } = await import("./pages/midi.js");
    initMidi(); 
  } 
  else if (path.includes("chordgen")) {
    const { initImmersive } = await import("./pages/chordgen.js");
    initImmersive();
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
  console.error("路由加载错误:", error);
}
}

window.addEventListener("popstate", router);
router();

// 拦截全局点击
document.body.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a && a.getAttribute("href")?.startsWith("/")) {
    e.preventDefault();
    window.history.pushState(null, "", a.getAttribute("href"));
    router();
  }
});