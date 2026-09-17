// ===== 1. 模块与样式导入 =====
import { gsap } from "gsap";
import { renderNav } from "../components/nav.js";
import { initVisualizer } from "../midi/visualizer.js";
import { ensureAudioContext } from "../midi/audioEngine.js";
import "../styles/midi.css";

// ===== 2. 渲染顶部导航栏 =====
renderNav();

// ===== 3. 渲染页面主体 HTML =====
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
      
      <label>高亮时长 :</label>
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

  <!-- 外层主卡片/画布容器 -->
  <div class="visualizer-card" style="position: relative;">
    <!-- 1. 和弦显示框放在 Wrapper 外面，但同属于卡片容器内 -->
    <div id="chordDisplay" class="chord-display">CHORD: --</div>

    <!-- 🎬 MIDI舞台 -->
    <div id="noteContainerWrapper">
      <div id="noteContainer"></div>
    </div>
  </div>

  <!-- 🎮 底部播放器 -->
  <div class="player-bar" id="playerBar">
    <div class="player-controls">
      <button id="replayBtn" title="重播">↺</button>
      <button id="playBtn" title="播放/暂停">▶</button>
      <button id="resetBtn" title="复位">⟲</button>
    </div>

    <div class="progress-wrapper">
      <span class="time-text" id="currentTime">00:00</span>
      <div class="progress-bar-container" id="progressBarContainer">
        <div class="progress-rail">
          <div class="progress-fill" id="progressFill"></div>
          <div class="progress-thumb" id="progressThumb"></div>
        </div>
      </div>
      <span class="time-text" id="totalTime">00:00</span>
    </div>

    <div class="player-actions">
      <button id="openPanelBtn" title="设置">⚙</button>
    </div>
  </div>
  
  <footer class="site-footer">
    BIZY STUDIO / MUSIC PRODUCER & WEB DEVELOPER. © 2026
  </footer>
`;

// ===== 4. 初始化可视化画板 =====
initVisualizer();

// ===== 5. 音频解锁绑定 =====
document.getElementById("playBtn")?.addEventListener("click", async () => {
  await ensureAudioContext();
});

// ===== 6. 页面加载动画（GSAP 弹入） =====
setTimeout(() => {
  const panel = document.getElementById("controlPanel");
  if (panel) {
    gsap.fromTo("#controlPanel", 
      { y: 50, autoAlpha: 0, scale: 0.95 }, 
      { 
        y: 0, 
        autoAlpha: 1, 
        scale: 1,
        duration: 1.2, 
        ease: "power4.out",
        onComplete: () => gsap.set("#controlPanel", { clearProps: "transform" })
      }
    );
  }
}, 100);