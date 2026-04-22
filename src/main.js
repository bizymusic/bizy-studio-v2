import "./styles/global.css";
import { renderNav } from "./components/nav.js";

async function router() {
  const path = window.location.pathname;
  const app = document.getElementById("app");

  // 1. 核心改进：只要跳转，先画导航！
  renderNav(); 

  if (app) app.innerHTML = ""; 

  try {
    if (path.includes("midiview")) {
      await import("./pages/midi.js");
    } else if (path.includes("harmony")) {
      await import("./pages/harmony.js");
    } else {
      await import("./pages/home.js");
    }
  } catch (err) {
    console.error("加载页面失败:", err);
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