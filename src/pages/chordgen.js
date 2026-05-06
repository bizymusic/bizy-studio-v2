import "../styles/chordgen.css";
import * as Tone from "tone";
import { Chord } from "tonal";

// 模块顶层：只声明变量，不初始化任何 Tone 对象
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

export function initImmersive() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="immersive-container">
      <div class="top-bar">
        <button class="mood-btn" data-mood="calm">Calm</button>
        <button class="mood-btn" data-mood="sad">Sad</button>
        <button class="mood-btn" data-mood="focus">Focus</button>
        <button class="mood-btn" data-mood="cinematic">Cinematic</button>
      </div>
      <canvas id="bg-canvas"></canvas>
      <div class="center-info">
        <h1 id="chord-display">Cmaj7</h1>
        <p id="status">Click a mood to start</p>
      </div>
    </div>
  `;
  setupUI();
  startVisualizer();
}


console.log("Before resume:", Tone.context.state);
await Tone.context.resume();
console.log("After resume:", Tone.context.state); // 必须是 "running"
// ✅ 核心修复：在用户手势内直接 resume AudioContext
async function initAudioOnUserGesture() {
  if (started) {
    console.log("⚠️ Already started, skipping init");
    return;
  }
  
  console.log("🔑 Starting audio init...");
  const context = Tone.context;
  console.log("📦 Context before resume:", context.state);
  
  if (context.state === "suspended") {
    await context.resume();
  }
  console.log("✅ Context after resume:", context.state);
  
  // 创建 synth
  if (!synth) {
    console.log("🎹 Creating synth...");
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.1,  // 🔥 改成 0.1 秒，立刻出声
        decay: 0.1,
        sustain: 0.5,
        release: 2
      }
    }).toDestination();
    console.log("✅ Synth created, connected to destination");
  }
  
  // 设置 transport
  if (!transport) {
    console.log("🚚 Getting Transport...");
    transport = Tone.Transport;
    transport.bpm.value = 50;
    transport.cancel();
    
    transport.scheduleRepeat((time) => {
      console.log("⏰ scheduleRepeat triggered, index:", index);
      const progression = moodPresets[currentMood];
      const chord = progression[index % progression.length];
      console.log("🎵 Playing chord:", chord);
      playChord(chord);
      updateUI(chord);
      index++;
    }, "2n"); // 每半拍触发一次
    console.log("✅ Transport scheduled");
  }
  
  if (transport.state !== "started") {
    console.log("🚀 Starting transport, current state:", transport.state);
    transport.start();
  }
  
  started = true;
  console.log("🎉 Audio init complete!");
}

function playChord(chordName) {
  console.log("🔊 playChord called with:", chordName);
  
  if (!synth) {
    console.error("❌ synth is null!");
    return;
  }
  console.log("✅ synth exists, state:", synth.state);
  
  const chord = Chord.get(chordName);
  console.log("📋 Chord object:", chord);
  
  if (!chord.notes?.length) {
    console.error("❌ No notes in chord!");
    return;
  }
  
  const notes = chord.notes.map(n => n + "4");
  console.log("🎼 Triggering notes:", notes);
  
  synth.triggerAttackRelease(notes, "2n");
  console.log("✅ triggerAttackRelease called");
}

function updateUI(chordName) {
  const el = document.getElementById("chord-display");
  if (el) el.innerText = chordName;
}


function setupUI() {
  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      document.getElementById("status").innerText = "Starting...";
      
      try {
        // ✅ 所有 Tone 初始化在这个用户手势内完成
        await initAudioOnUserGesture();
        
        currentMood = btn.dataset.mood;
        index = 0;
        document.getElementById("status").innerText = `Playing: ${currentMood}`;
      } catch (err) {
        console.error("Audio init failed:", err);
        document.getElementById("status").innerText = "Audio blocked - click again";
        // 重试：有些浏览器需要多次点击
        if (Tone.context.state === "suspended") {
          Tone.context.resume().catch(() => {});
        }
      }
    });
  });
}

// ... startVisualizer 和 getMoodColors 保持不变 ...
function startVisualizer() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  let t = 0;
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function draw() {
    t += 0.005;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const colors = getMoodColors(currentMood);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * 0.01 + t) * 40;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.stroke();
    requestAnimationFrame(draw);
  }
  draw();
}

function getMoodColors(mood) {
  switch (mood) {
    case "calm": return ["#1e3c72", "#2a5298"];
    case "sad": return ["#232526", "#414345"];
    case "focus": return ["#134E5E", "#71B280"];
    case "cinematic": return ["#0f2027", "#2c5364"];
    default: return ["#000", "#333"];
  }
}

export function cleanupImmersive() {
  if (transport) { transport.cancel(); transport.stop(); }
  if (synth) { synth.releaseAll(); synth.dispose(); synth = null; }
  transport = null;
  started = false;
  index = 0;
}