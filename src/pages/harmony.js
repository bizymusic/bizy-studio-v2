import { revealAnimation } from "../utils/animations.js";
import "../styles/harmony.css";
const GENRE_TEMPLATES = {
  'Dark Trap': { seeds: ['Cm', 'Ab', 'G7'] },
  'Neo-Soul': { seeds: ['Fmaj9', 'Bb13', 'Am9'] }
};

export function initHarmony() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <main class="harmony-lab" style="padding-top: 100px; color: white; text-align: center;">
      <h1 class="reveal-text">Harmony Lab</h1>
      <p class="reveal-text accent">AI 音乐实验室</p>
      
      <div id="genreGrid" style="margin-top: 40px; display: flex; justify-content: center; gap: 20px;">
        ${Object.keys(GENRE_TEMPLATES).map(genre => `
          <button class="genre-card" data-genre="${genre}">${genre}</button>
        `).join('')}
      </div>
      <div id="resultDisplay" style="margin-top: 40px; min-height: 100px;">
        <p>等待指令... (点击按钮启动 AI)</p>
      </div>
    </main>
  `;

  revealAnimation();
  setupInteraction();
}

async function setupInteraction() {
  const display = document.getElementById('resultDisplay');
  let model = null;

  document.querySelectorAll('.genre-card').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const genre = e.target.dataset.genre;
      display.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center;">
          <span class="ai-loading-status"></span>
          <p class="reveal-text">ANALYZING HARMONIC STRUCTURE...</p>
        </div>
      `;


      try {
        // 1. 【核心修复】原生唤醒音频上下文，不依赖 Magenta
        // 只要用户点了按钮，这段代码就能把浏览器的音频门打开
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const tempCtx = new AudioContext();
        if (tempCtx.state === 'suspended') {
          await tempCtx.resume();
        }
        console.log("音频上下文已激活:", tempCtx.state);

        // 2. 动态加载 Magenta
        const mm = await import('@magenta/music');

        // 3. 初始化模型
        if (!model) {
          // 如果加载太慢，可以换成这个更轻量的模型地址
          model = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');
          await model.initialize();
        }
        
        const seeds = GENRE_TEMPLATES[genre].seeds;
        
        // 渲染结果
        display.innerHTML = `
          <h3 style="color: #aaa;">推荐进行:</h3>
          <p style="font-size: 2rem; margin: 15px 0;">
            ${seeds.join(' → ')} → <span style="color:#00ffcc; text-shadow: 0 0 10px #00ffcc;">?</span>
          </p>
          <p style="opacity:0.5; font-size: 0.8rem;">[ AI ENGINE READY ]</p>
        `;

        // 释放临时 Context，避免内存占用
        tempCtx.close();

      } catch (err) {
        console.error("详细报错记录:", err);
        display.innerHTML = `<p style="color:#ff5555">加载失败: ${err.message}</p>`;
      }
    });
  });
}




initHarmony();