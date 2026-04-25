import { renderNav } from "../components/nav.js";
import { initVisualizer } from "../midi/visualizer.js";
import { gsap } from "gsap"; // 👈 必须手动引入
import "../styles/midi.css";
// 1️⃣ 渲染导航
renderNav();  
// 2️⃣ 渲染页面 HTML
    document.getElementById("app").innerHTML = `
      
      <!-- 🎛️ 悬浮控制面板 -->
    <div class="panel" id="controlPanel">
      <div id="uploadLine" class="upload-line">
        <span id="uploadText">拖拽 MIDI 或点击选择</span>
        <span id="fileName">未选择</span>
        <input type="file" id="fileInput" accept=".mid,.midi" hidden />
      </div>
      
      <div class="row compact-row">
      <label>BPM速度 :</label>
      <input type="number" id="bpmInput" placeholder="自动">
      
      <label> 高亮时长 :</label>
      <input type="number" id="highlightInput" step="0.01" value="0.2">
    </div>

    <div class="row">
        <label>横向间距 :</label>
        <input type="range" id="scaleSlider" min="20" max="300" value="60" />
        <span class="val-num" id="scaleValue">60</span>
      </div>

    <div class="row">
      <label>纵向间距 :</label>
      <input type="range" id="verticalSlider" min="2" max="20" value="8" />
      <span class="val-num" id="verticalValue">8</span>
    </div>

    

    <div class="row">
      <label>粒子系统</label>
      <div class="toggle-wrapper">
         <input type="checkbox" id="particleToggle">
      </div>
    </div>
  </div>
</div>

    <!-- 🎬 MIDI舞台 -->
    <div id="noteContainerWrapper">
      <div id="noteContainer">
        <!-- <div id="playhead"></div> -->
      </div>
    </div>

    <!-- 🎮 底部播放器 -->
    <div class="player-bar" id="playerBar">
      <button id="replayBtn">↺</button>
      <button id="playBtn">▶</button>
      <button id="resetBtn">⟲</button>
      <button id="openPanelBtn">⚙</button>

    </div>
    
    <footer class="site-footer">
       BIZY STUDIO / MUSIC PRODUCER & WEB DEVELOPER. © 2026
    </footer>

`;

// 3️⃣ 启动逻辑（关键）
initVisualizer();

import { revealAnimation } from "../utils/animations.js";
// 4️⃣ 强制延迟 100ms 运行动画，确保 DOM 已经存在
setTimeout(() => {
    const panel = document.getElementById("controlPanel");
    console.log("面板确认状态:", panel); // 这次控制台应该能看到 <div id="controlPanel"...> 了

    if (panel) {
        gsap.fromTo("#controlPanel", 
            { 
                y: 50, 
                autoAlpha: 0, 
                scale: 0.95 
            }, 
            { 
                y: 0, 
                autoAlpha: 1, 
                scale: 1,
                duration: 1.2, 
                ease: "power4.out",
                // 结束后只清除 transform，保留 opacity 让它站稳
                onComplete: () => gsap.set("#controlPanel", { clearProps: "transform" })
            }
        );
    }
}, 100);