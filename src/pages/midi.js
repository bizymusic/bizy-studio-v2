import { renderNav } from "../components/nav.js";
import { initVisualizer } from "../midi/visualizer.js";
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
      
      <div class="row">
        <label>BPM</label>
        <input type="number" id="bpmInput" placeholder="自动读取" />
        <button id="applyBpmBtn">应用</button>
      </div>

      <div class="row">
        <label>横向</label>
        <input type="range" id="scaleSlider" min="20" max="300" value="60" />
        <span id="scaleValue">60</span>
      </div>

      <div class="row">
        <label>纵向</label>
        <input type="range" id="verticalSlider" min="2" max="20" value="8" />
        <span id="verticalValue">8</span>
      </div>

      <div class="row">
        <label>高亮</label>
        <input type="number" id="highlightInput" step="0.01" value="0.2" />
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

      <button id="playBtn">▶</button>
      <button id="replayBtn">↺</button>
      <button id="resetBtn">⟲</button>
      

      <label class="toggle">
        <input type="checkbox" id="particleToggle"> 粒子
      </label>

      <button id="openPanelBtn">⚙</button>

    </div>
    
    <footer class="site-footer">
       BIZY STUDIO / MUSIC PRODUCER & WEB DEVELOPER. © 2026
    </footer>

`;

// 3️⃣ 启动逻辑（关键）
initVisualizer();