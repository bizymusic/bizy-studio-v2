import "../styles/chordgen.css";
import { Chord } from "tonal";

// ===== 变量声明 =====
let Tone = null;
let synth = null;
let transport = null;
let started = false;
let currentMood = "calm";
let index = 0;

const moodPresets = {
  calm: ["Cmaj7", "Am7", "Fmaj7", "G"],
  sad: ["Am", "F", "C", "G"],
  focus: ["Dm7", "G7", "Cmaj7", "Cmaj7"],
  cinematic: ["Dm", "Bb", "F", "C"]
};

// ===== UI 初始化 =====
export function initImmersive() {
  const app = document.getElementById("app");
  if (!app) return;
  
  app.innerHTML = `
    <div class="immersive-container">
      <div class="top-bar">
        <button class="mood-btn" data-mood="calm">Calm</button>
        <button class="mood-btn" data-mood="sad">Sad</button>
        <button class="mood-btn" data-mood="focus">Focus</button>
        <button class="mood-btn" data-mood="cinematic">Cinematic</button>

        
      </div>
      
      
      <canvas id="bg-canvas"></canvas>
      <div class="center-info" id="center-control">
        <div class="pulse-ring"></div>
        <h1 id="chord-display">Cmaj7</h1>
          <p id="status">
                  Click to Play
          </p>
        
      </div>
  `;
  
  setupUI();
  startVisualizer();
}

// ===== 动态加载 Tone.js（关键：避免自动播放拦截）=====
async function loadToneIfNeeded() {
  if (Tone) return Tone;
  const toneModule = await import("tone");
  Tone = toneModule;
  return Tone;
}

// ===== 音频初始化（用户手势内调用）=====
async function initAudioOnUserGesture(mood) {
  if (started) return true;
  
  const ToneModule = await loadToneIfNeeded();
  const context = ToneModule.context;
  
  if (context.state === "suspended") {
    await context.resume();
  }
  if (context.state !== "running") {
    throw new Error("AudioContext failed to start");
  }
    
  if (!synth) {

    // ===== 混响 =====
    const reverb = new ToneModule.Reverb({
      decay: 8,
      wet: 0.35
    }).toDestination();

    // ===== 滤波器（去刺耳高频）=====
    const filter = new ToneModule.Filter(1400, "lowpass");

    // ===== Synth =====
    synth = new ToneModule.PolySynth(ToneModule.Synth, {

      oscillator: {
        type: "triangle"
      },

      envelope: {
        attack: 1.2,
        decay: 0.4,
        sustain: 0.5,
        release: 4
      },

      volume: -18

    });

  // ===== 音频链 =====
  synth.connect(filter);
  filter.connect(reverb);
}
  if (!transport) {
    transport = ToneModule.Transport;
    transport.bpm.value = 60;
    transport.cancel();
    
    transport.scheduleRepeat(() => {
      const progression = moodPresets[currentMood];
      const chord = progression[index % progression.length];
      playChord(chord);
      updateUI(chord);
      index++;
    }, "1n");
  }
  
  if (transport.state !== "started") {
    transport.start();
  }
  
  started = true;
  return true;
}

// ===== 播放和弦 =====
function playChord(chordName) {
  if (!synth) return;
  const chord = Chord.get(chordName);
  if (!chord.notes?.length) return;
  const octaves = [3,4,4,5];

const notes = chord.notes.map((n, i) => {
  return n + (octaves[i] || 4);
});
  synth.triggerAttackRelease(notes, "1n");
}

// ===== 更新 UI =====
function updateUI(chordName) {
  const el = document.getElementById("chord-display");
  if (el) el.innerText = chordName;
}

// ===== 绑定按钮事件 =====
function setupUI() {

  // mood 按钮
  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const mood = btn.dataset.mood;
      const statusEl = document.getElementById("status");

      statusEl.innerText = "🎵 Starting...";

      try {
        await initAudioOnUserGesture(mood);

        currentMood = mood;
        index = 0;

        statusEl.innerText = `✨ Playing: ${mood}`;

      } catch (err) {
        console.error(err);
        statusEl.innerText = "❌ Retry";
      }
    });
  });

  // center 控制（唯一控制器）
  const centerControl = document.getElementById("center-control");

  centerControl.addEventListener("click", async () => {

    const statusEl = document.getElementById("status");

    if (!started) {
      await initAudioOnUserGesture(currentMood);
      statusEl.innerText = "✨ Playing";
      return;
    }

    if (transport.state === "started") {
      transport.pause();
      statusEl.innerText = "断开";
      centerControl.classList.add("paused");
    } else {
      transport.start();
      statusEl.innerText = "✨ Playing";
      centerControl.classList.remove("paused");
    }

  });
}

// ===== 背景可视化 =====
function startVisualizer() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  
  let t = 0;
  function draw() {
    t += 0.005;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const colors = getMoodColors(currentMood);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 10) {
      const y = canvas.height/2 + Math.sin(x * 0.01 + t) * 40;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.stroke();
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== 情绪配色 =====
function getMoodColors(mood) {
  const map = {
    calm: ["#1e3c72", "#2a5298"],
    sad: ["#232526", "#414345"],
    focus: ["#134E5E", "#71B280"],
    cinematic: ["#0f2027", "#2c5364"]
  };
  return map[mood] || ["#000", "#333"];
}



// ===== 清理函数（页面卸载时调用）=====
export function cleanupImmersive() {
  if (transport) { transport.cancel(); transport.stop(); }
  if (synth) { synth.dispose(); synth = null; }
  Tone = null;
  transport = null;
  started = false;
  index = 0;
}

