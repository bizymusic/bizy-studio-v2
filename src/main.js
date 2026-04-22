import "./styles/global.css";

const path = window.location.pathname;

// 根据路径动态加载对应的页面模块
if (path.includes("midi")) {
  import("./pages/midi.js");
} else {
  import("./pages/home.js");
}