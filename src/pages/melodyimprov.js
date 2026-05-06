import * as mm from '@magenta/music';
import "../styles/harmony.css";

let melodyModel;
let visualizer;
let lastGeneratedSeq = null;
let isAudioInitialized = false;

// 1. 初始化入口
export async function initMelodyImprov() {
    const app = document.getElementById("app");
    if (!app) return;

    renderUI(app);

    // 加载专门用于根据和弦即兴的 RNN 模型
    melodyModel = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');
    
    try {
        await melodyModel.initialize();
        console.log("Melody Catcher AI Ready");
        setupEventListeners();
    } catch (err) {
        console.error("旋律模型加载失败:", err);
    }
}

// 2. 渲染 UI (专注钢琴卷帘和捕捉)
function renderUI(container) {
    container.innerHTML = `
        <div class="harmony-lab-wrapper">
            <h1 class="reveal-text">Melody Catcher</h1>
            <p class="accent">基于当前和弦捕捉 Topline 灵感</p>

            <div class="glass-container melody-box">
                <!-- 钢琴卷帘画布 -->
                <canvas id="canvas"></canvas>
                
                <div class="button-group" style="margin-top: 20px;">
                    <button id="btn-melody" class="control-btn accent">捕捉一段旋律</button>
                    <button id="btn-download" class="control-btn download" style="display:none;">下载 MIDI 片段</button>
                </div>
                <p style="font-size: 0.8rem; opacity: 0.5; margin-top: 15px;">
                    当前参考和弦: Cm → Ab → Eb → Bb
                </p>
            </div>
        </div>
    `;
}

// 3. 激活音频上下文
async function ensureAudioStarted() {
    if (isAudioInitialized) return;
    await mm.Player.tone.context.resume();
    isAudioInitialized = true;
}

// 4. 捕捉旋律逻辑
async function catchMelody() {
    await ensureAudioStarted();
    
    const btn = document.getElementById('btn-melody');
    btn.textContent = "AI 创作中...";
    btn.disabled = true;

    // 预设当前要即兴的和弦框架 (后期你可以尝试从 chordgen 模块传值)
    const chords = ['Cm', 'Ab', 'Eb', 'Bb']; 
    const steps = 32; // 生成 2 个小节的旋律 (每小节 16 step)
    const temperature = 1.1;

    // 创建量化序列起点
    const qns = { notes: [], totalQuantizedSteps: 0, quantizationInfo: { stepsPerQuarter: 4 }};

    try {
        lastGeneratedSeq = await melodyModel.continueSequence(qns, steps, temperature, chords);

        // 使用内置 Visualizer 渲染钢琴卷帘
        const canvas = document.getElementById('canvas');
        visualizer = new mm.Visualizer(lastGeneratedSeq, canvas, {
            noteRGB: '0, 255, 204', // 赛博青
            activeNoteRGB: '255, 255, 255',
            pixelsPerTimeStep: 30
        });

        document.getElementById('btn-download').style.display = 'inline-block';
    } catch (err) {
        console.error("生成失败:", err);
    } finally {
        btn.textContent = "再次捕捉灵感";
        btn.disabled = false;
    }
}

// 5. MIDI 导出
function downloadMIDI() {
    if (!lastGeneratedSeq) return;
    const midi = mm.sequenceProtoToMidi(lastGeneratedSeq);
    const file = new Blob([midi], { type: 'audio/midi' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = `topline_${Date.now()}.mid`;
    a.click();
}

function setupEventListeners() {
    document.getElementById('btn-melody').onclick = catchMelody;
    document.getElementById('btn-download').onclick = downloadMIDI;
}