import * as Tone from "tone";
import { Chord } from "tonal";

let synth = null;
let activeNotes = new Set();

// ===== 初始化 Synth 声音引擎 =====

export function initSynthIfNeeded() {
  if (synth) return;

  // 使用 FMSynth（频率调制）模拟钢琴的金属击弦感与琴体共鸣
  synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 8,       // 泛音列比例，增加钢琴金属弦的共振感
    modulationIndex: 2,   // 调制强度，适度保留锤击敲击感
    oscillator: {
      type: "sine"        // 主波形用正弦波，声音更圆润温暖
    },
    envelope: {
      attack: 0.002,      // 锤击瞬态：击弦极快，音头清晰
      decay: 1.4,         // 琴音自然衰减过程
      sustain: 0.15,      // 琴弦余震维持音量
      release: 1.2        // 离键后的自然余音（松开踏板的延音感）
    },
    modulation: {
      type: "triangle"
    },
    modulationEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    },
    volume: -4
  }).toDestination();
}

// ===== 解决浏览器 AudioContext 解冻机制 =====
export async function ensureAudioContext() {
  if (Tone.context.state === "suspended") {
    await Tone.context.resume();
  }
  if (Tone.context.state !== "running") {
    await Tone.start();
  }
  initSynthIfNeeded();
}

// ===== 核心：实时发声与和弦识别导出 =====
export function updateAudioAndChord(notesAtCurrentTime = []) {
  initSynthIfNeeded();

  const currentPitches = notesAtCurrentTime
    .map(n => (typeof n === "string" ? n : n.pitch))
    .filter(Boolean);

  // 1. 触发新响起的音符
  currentPitches.forEach(pitch => {
    if (!activeNotes.has(pitch)) {
      synth.triggerAttack(pitch);
      activeNotes.add(pitch);
    }
  });

  // 2. 释放已结束的音符
  activeNotes.forEach(pitch => {
    if (!currentPitches.includes(pitch)) {
      synth.triggerRelease(pitch);
      activeNotes.delete(pitch);
    }
  });

  // 3. 实时刷新 DOM 中的和弦显示
  const chordBox = document.getElementById("chordDisplay");
  if (chordBox) {
    if (activeNotes.size > 0) {
      const notesArray = Array.from(activeNotes);
      const detected = Chord.detect(notesArray);
      chordBox.textContent = `CHORD: ${detected[0] || notesArray.join(" ")}`;
    } else {
      chordBox.textContent = "CHORD: --";
    }
  }
}