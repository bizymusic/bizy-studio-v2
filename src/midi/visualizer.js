import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/+esm";
import { createParticleSystem } from "./particles.js";

export function initVisualizer() {
  // ===== 粒子开关 =====
  const particleToggle = document.getElementById("particleToggle");
  let enableParticles = false;

  if (particleToggle) {
    particleToggle.addEventListener("change", () => {
      enableParticles = particleToggle.checked;
    });
  }

  // ===== DOM =====
  const fileInput = document.getElementById("fileInput");
  const bpmInput = document.getElementById("bpmInput");

  const scaleSlider = document.getElementById("scaleSlider");
  const scaleValue = document.getElementById("scaleValue");
  const verticalSlider = document.getElementById("verticalSlider");
  const verticalValue = document.getElementById("verticalValue");
  const highlightInput = document.getElementById("highlightInput");
  const resetBtn = document.getElementById("resetBtn");
  const replayBtn = document.getElementById("replayBtn");
  const playBtn = document.getElementById("playBtn");
  const panel = document.getElementById("controlPanel");
  const openPanelBtn = document.getElementById("openPanelBtn");
  const containerWrapper = document.getElementById("noteContainerWrapper");
  const container = document.getElementById("noteContainer");
  const particleSystem = createParticleSystem(container);

  // ⏱️ 时间与进度条 DOM (新增)
  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  const progressFill = document.getElementById("progressFill");
  const progressThumb = document.getElementById("progressThumb");
  const progressBarContainer = document.getElementById("progressBarContainer");

  // ===== 面板切换 =====
  if (openPanelBtn) {
    openPanelBtn.addEventListener("click", () => {
      panel.classList.toggle("hidden");
    });
  }

  // ===== 状态 =====
  let midiData = null;
  let allNotes = [];
  let noteElements = [];
  let pixelsPerSecond = parseInt(scaleSlider.value);
  let noteSpacing = parseInt(verticalSlider.value);
  const noteHeight = 6;
  let customBpm = null;

  let originalBpm = 120;
  let tempoFactor = 1;
  let totalDuration = 0;
  let animationStartTime = null;
  let playbackTime = 0;
  let animationFrame = null;
  let paused = false;
  let playbackEnded = false;
  let hasStarted = false;
  let lastFrameTime = 0;
  let isDraggingProgress = false; // 是否正在拖拽进度条

  // ===== ⏱️ 辅助：时间格式化 =====
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // ===== ⏱️ 辅助：更新时间栏UI =====
  function updateTimeUI(time) {
    if (!totalDuration) return;
    const clampedTime = Math.min(Math.max(0, time), totalDuration);
    const percent = (clampedTime / totalDuration) * 100;

    if (currentTimeEl) currentTimeEl.textContent = formatTime(clampedTime);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressThumb) progressThumb.style.left = `${percent}%`;
  }

  // ===== ⏱️ 辅助：跳转到指定时间 (Seek) =====
  function seekToTime(targetTime) {
    playbackTime = Math.min(Math.max(0, targetTime), totalDuration);
    animationStartTime = performance.now() - (playbackTime / tempoFactor) * 1000;
    
    // 立即滚动画面并渲染音符状态
    const position = playbackTime * pixelsPerSecond;
    if (containerWrapper) containerWrapper.scrollLeft = position;
    updateTimeUI(playbackTime);
    renderNoteState(playbackTime);
  }

  // ===== 高亮时间 =====
  let minHighlightTime = 0.2;
  highlightInput.value = minHighlightTime;

  highlightInput.addEventListener("input", () => {
    const val = parseFloat(highlightInput.value);
    if (!isNaN(val) && val > 0) {
      minHighlightTime = val;
    }
  });

  // ===== 控件 =====
  scaleSlider.addEventListener("input", () => {
    pixelsPerSecond = parseInt(scaleSlider.value);
    scaleValue.textContent = pixelsPerSecond;

    if (hasStarted && !paused) {
      animationStartTime = performance.now() - (playbackTime / tempoFactor) * 1000;
    }

    if (noteElements.length > 0) rescaleNotes();
  });

  verticalSlider.addEventListener("input", () => {
    noteSpacing = parseInt(verticalSlider.value);
    verticalValue.textContent = noteSpacing;

    if (noteElements.length > 0) rescaleNotes();
  });

  // ===== ⏱️ 进度条交互 (点击 & 拖拽跳转) =====
  if (progressBarContainer) {
    const handleProgressScrub = (e) => {
      if (!midiData || !totalDuration) return;
      const rect = progressBarContainer.getBoundingClientRect();
      const offsetX = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      const ratio = offsetX / rect.width;
      seekToTime(ratio * totalDuration);
    };

    progressBarContainer.addEventListener("mousedown", (e) => {
      isDraggingProgress = true;
      handleProgressScrub(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDraggingProgress) handleProgressScrub(e);
    });

    window.addEventListener("mouseup", () => {
      isDraggingProgress = false;
    });

    // 移动端 Touch 支持
    progressBarContainer.addEventListener("touchstart", (e) => {
      isDraggingProgress = true;
      handleProgressScrub(e.touches[0]);
    });
    window.addEventListener("touchmove", (e) => {
      if (isDraggingProgress) handleProgressScrub(e.touches[0]);
    });
    window.addEventListener("touchend", () => {
      isDraggingProgress = false;
    });
  }

  // ===== 文件加载 =====
  const uploadLine = document.getElementById("uploadLine");
  const fileName = document.getElementById("fileName");

  uploadLine.addEventListener("click", () => {
    fileInput.click();
  });

  uploadLine.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadLine.classList.add("dragover");
  });

  uploadLine.addEventListener("dragleave", () => {
    uploadLine.classList.remove("dragover");
  });

  uploadLine.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadLine.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  async function handleFile(file) {
    if (!file) return;
    fileName.textContent = file.name;
    try {
      const arrayBuffer = await file.arrayBuffer();
      midiData = new Midi(arrayBuffer);

      const detectedBpm = Math.round(midiData.header.tempos?.[0]?.bpm || 120);
      bpmInput.value = detectedBpm;
      customBpm = detectedBpm;

      buildVisualizer();
    } catch (err) {
      console.error(err);
      alert("❌ MIDI 解析失败");
    }
  }

  // ===== 播放控制 =====
  playBtn.addEventListener("click", () => {
    if (!midiData) return;

    const currentBpmInput = parseFloat(bpmInput.value);
    if (!isNaN(currentBpmInput) && currentBpmInput > 0 && currentBpmInput !== customBpm) {
      customBpm = currentBpmInput;
      buildVisualizer();
    }

    if (!hasStarted) {
      hasStarted = true;
      paused = false;
      playbackTime = 0;
      animationStartTime = performance.now();
      requestAnimationFrame(animate);

      playBtn.textContent = "⏸";
      panel.classList.add("hidden");
      document.body.classList.add("recording-mode");
      return;
    }

    paused = !paused;

    if (!paused) {
      animationStartTime = performance.now() - (playbackTime / tempoFactor) * 1000;
      requestAnimationFrame(animate);
      playBtn.textContent = "⏸";
      panel.classList.add("hidden");
      document.body.classList.add("recording-mode");
    } else {
      playBtn.textContent = "▶";
      panel.classList.remove("hidden");
      document.body.classList.remove("recording-mode");
    }
  });

  // ===== 重置 =====
  resetBtn.addEventListener("click", () => {
    cancelAnimationFrame(animationFrame);

    midiData = null;
    allNotes = [];
    noteElements = [];
    customBpm = null;
    hasStarted = false;
    paused = false;
    playbackTime = 0;
    totalDuration = 0;

    fileInput.value = "";
    bpmInput.value = "";

    containerWrapper.scrollLeft = 0;
    container.innerHTML = "";

    playBtn.textContent = "▶";
    panel.classList.remove("hidden");
    document.body.classList.remove("recording-mode");

    // 重置时间 display
    if (currentTimeEl) currentTimeEl.textContent = "00:00";
    if (totalTimeEl) totalTimeEl.textContent = "00:00";
    if (progressFill) progressFill.style.width = "0%";
    if (progressThumb) progressThumb.style.left = "0%";
  });

  // ===== 重播 =====
  replayBtn.addEventListener("click", () => {
    if (!midiData) return;

    cancelAnimationFrame(animationFrame);

    paused = false;
    playbackTime = 0;
    hasStarted = true;
    animationStartTime = performance.now();
    playbackEnded = false;

    playBtn.textContent = "⏸";
    panel.classList.add("hidden");

    requestAnimationFrame(animate);
    document.body.classList.add("recording-mode");
  });

  // ===== 构建 =====
  function buildVisualizer() {
    cancelAnimationFrame(animationFrame);

    container.innerHTML = "";
    allNotes = [];
    noteElements = [];
    hasStarted = false;
    paused = false;
    playbackTime = 0;

    originalBpm = midiData.header.tempos?.[0]?.bpm || 120;
    const bpm = customBpm || originalBpm;
    tempoFactor = bpm / originalBpm;

    midiData.tracks.forEach((track) => {
      if (track.notes) allNotes = allNotes.concat(track.notes);
    });

    if (allNotes.length === 0) {
      alert("⚠️ 没有音符");
      return;
    }

    allNotes.sort((a, b) => a.time - b.time);

    totalDuration = Math.max(...allNotes.map((n) => n.time + n.duration));

    // ⏱️ 设置总时间 UI
    if (totalTimeEl) totalTimeEl.textContent = formatTime(totalDuration);
    updateTimeUI(0);

    const halfWidth = containerWrapper.clientWidth / 2;
    container.style.marginLeft = `${halfWidth}px`;
    container.style.marginRight = `${halfWidth}px`;
    container.style.width = `${totalDuration * pixelsPerSecond}px`;

    allNotes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note";
      container.appendChild(div);
      noteElements.push({ div, note });
    });

    rescaleNotes();
  }

  // ===== 布局 =====
  function rescaleNotes() {
    noteElements.forEach(({ div, note }) => {
      div.style.left = `${note.time * pixelsPerSecond}px`;
      div.style.width = `${Math.max(note.duration * pixelsPerSecond, 2)}px`;
      div.style.top = `${(127 - note.midi) * noteSpacing}px`;
      div.style.height = `${noteHeight}px`;
    });
  }

  // ===== 音符高亮/粒子绘制辅助逻辑 =====
  function renderNoteState(curTime, timestamp = performance.now()) {
    noteElements.forEach(({ div, note }) => {
      const start = note.time;
      const end = start + Math.max(note.duration, minHighlightTime);

      if (curTime >= start && curTime < end) {
        div.classList.add("active");

        if (enableParticles) {
          div.classList.add("glow");

          if (!div._lastParticle || timestamp - div._lastParticle > 120) {
            const rect = div.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top + rect.height / 2;

            particleSystem.spawn(x, y);
            div._lastParticle = timestamp;
          }
        } else {
          div.classList.remove("glow");
        }
      } else {
        div.classList.remove("active");
        div.classList.remove("glow");
      }
    });
  }

  // ===== 动画主循环 =====
  function animate(timestamp) {
    if (paused) return;

    if (!animationStartTime) animationStartTime = timestamp;

    const delta = (timestamp - (lastFrameTime || timestamp)) / 1000;
    lastFrameTime = timestamp;

    // 拖拽进度条时暂停自动累加时间，避免与鼠标冲突
    if (!isDraggingProgress) {
      playbackTime = ((timestamp - animationStartTime) / 1000) * tempoFactor;
      const position = playbackTime * pixelsPerSecond;
      containerWrapper.scrollLeft = position;

      // ⏱️ 逐帧更新时间数字和进度条 Fill
      updateTimeUI(playbackTime);
    }

    // 渲染音符与粒子
    renderNoteState(playbackTime, timestamp);

    if (enableParticles) {
      particleSystem.update(delta);
    }

    if (playbackTime < totalDuration) {
      animationFrame = requestAnimationFrame(animate);
    } else if (!playbackEnded) {
      playbackEnded = true;

      setTimeout(() => alert("🎉 播放完成！"), 800);

      playBtn.textContent = "▶";
      panel.classList.remove("hidden");
      document.body.classList.remove("recording-mode");
      hasStarted = false;
    }
  }
}