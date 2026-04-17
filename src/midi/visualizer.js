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
const applyBpmBtn = document.getElementById("applyBpmBtn");
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

// ===== 高亮时间 =====
let minHighlightTime = 0.20;
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
    animationStartTime = performance.now() - playbackTime / tempoFactor * 1000;
}

if (noteElements.length > 0) rescaleNotes();
});

verticalSlider.addEventListener("input", () => {
noteSpacing = parseInt(verticalSlider.value);
verticalValue.textContent = noteSpacing;

if (noteElements.length > 0) rescaleNotes();
});

// ===== 文件加载 =====
const uploadLine = document.getElementById("uploadLine");
const fileName = document.getElementById("fileName");

// 点击选择
uploadLine.addEventListener("click", () => {
fileInput.click();
});

// 拖拽
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

// 选择文件
fileInput.addEventListener("change", (e) => {
const file = e.target.files[0];
handleFile(file);
});

// 统一处理
async function handleFile(file) {
if (!file) return;

fileName.textContent = file.name;

try {
    const arrayBuffer = await file.arrayBuffer();
    midiData = new Midi(arrayBuffer);

    bpmInput.value = "";
    customBpm = null;

    buildVisualizer();
} catch (err) {
    console.error(err);
    alert("❌ MIDI 解析失败");
}
}

applyBpmBtn.addEventListener("click", () => {
const bpmVal = parseFloat(bpmInput.value);
if (!isNaN(bpmVal) && bpmVal > 0) {
    customBpm = bpmVal;
    buildVisualizer();
}
});

// ===== 播放控制（合并版）=====
playBtn.addEventListener("click", () => {
if (!midiData) return;

if (!hasStarted) {
    hasStarted = true;
    paused = false;
    playbackTime = 0;
    animationStartTime = performance.now();
    requestAnimationFrame(animate);

    playBtn.textContent = "⏸";
    panel.classList.add("hidden");
    return;
}

paused = !paused;

if (!paused) {
    animationStartTime = performance.now() - playbackTime / tempoFactor * 1000;
    requestAnimationFrame(animate);
    playBtn.textContent = "⏸";
    panel.classList.add("hidden");
} else {
    playBtn.textContent = "▶";
    panel.classList.remove("hidden");
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

fileInput.value = "";
bpmInput.value = "";

containerWrapper.scrollLeft = 0;
container.innerHTML = "";

playBtn.textContent = "▶";
panel.classList.remove("hidden");
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

midiData.tracks.forEach(track => {
    if (track.notes) allNotes = allNotes.concat(track.notes);
});

if (allNotes.length === 0) {
    alert("⚠️ 没有音符");
    return;
}

allNotes.sort((a, b) => a.time - b.time);

totalDuration = Math.max(...allNotes.map(n => n.time + n.duration));

container.style.width = `${totalDuration * pixelsPerSecond + 100}px`;

allNotes.forEach(note => {
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



// ===== 动画 =====
function animate(timestamp) {
if (paused) return;

if (!animationStartTime) animationStartTime = timestamp;

const delta = (timestamp - (lastFrameTime || timestamp)) / 1000;
lastFrameTime = timestamp;

playbackTime = (timestamp - animationStartTime) / 1000 * tempoFactor;
const position = playbackTime * pixelsPerSecond;

containerWrapper.scrollLeft =
    position - containerWrapper.clientWidth / 2;

noteElements.forEach(({ div, note }) => {
    const start = note.time;
    const end = start + Math.max(note.duration, minHighlightTime);

    if (playbackTime >= start && playbackTime < end) {
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
    hasStarted = false;
}
}

}