// ============================================================
// 主应用逻辑: 事件绑定, 动画循环, 初始化
// ============================================================

let animationId = null;
let lastStepTime = 0;

// --- 执行一步并更新所有可视化 ---
function runStep() {
  simulationStep();
  drawGrid();
  updateStats();
  updateWealthChart();
  updateScatterChart();

  if (state.currentStep >= CONFIG.totalSteps) {
    state.running = false;
    document.getElementById('btnStart').disabled = false;
    document.getElementById('btnPause').disabled = true;
    document.getElementById('stepInfo').textContent = '模拟完成！查看下方结果分析。';
    return false;
  }
  return true;
}

// --- 动画循环 (根据速度控制每步延迟) ---
function animationLoop() {
  if (!state.running || state.paused) return;
  const now = performance.now();
  const delay = 1000 / state.speed;
  if (now - lastStepTime >= delay) {
    lastStepTime = now;
    if (!runStep()) return;
  }
  animationId = requestAnimationFrame(animationLoop);
}

// --- 重置模拟 ---
function resetSim() {
  state.running = false;
  state.paused = false;
  if (animationId) cancelAnimationFrame(animationId);
  const numAgents = parseInt(document.getElementById('numAgents').value) || 1000;
  CONFIG.numAgents = numAgents;
  const ratio = parseFloat(document.getElementById('eventRatio').value);
  state.eventRatio = ratio;
  initSimulation(numAgents, ratio);
  drawGrid();
  updateStats();
  updateWealthChart();
  updateScatterChart();
  document.getElementById('btnStart').disabled = false;
  document.getElementById('btnPause').disabled = true;
  document.getElementById('btnPause').textContent = '⏸ 暂停';
  document.getElementById('stepInfo').textContent = '准备就绪 — 点击开始模拟';
}

// --- 快速运行100次模拟 (无动画, 纯计算) ---
async function fastRun100() {
  const btn = document.getElementById('btnFastRun');
  btn.disabled = true;
  btn.textContent = '⏳ 运行中...';

  const numRuns = 100;
  const winners = [];
  let totalSuccess = 0;
  let totalHighTalent = 0;
  let totalPareto = 0;
  let totalGini = 0;

  for (let run = 0; run < numRuns; run++) {
    initSimulation(1000, 0.5);
    for (let s = 0; s < CONFIG.totalSteps; s++) {
      simulationStep();
    }
    const sorted = [...state.agents].sort((a, b) => b.wealth - a.wealth);
    winners.push(sorted[0].talent);
    totalPareto += calcPareto(state.agents);
    totalGini += calcGini(state.agents);

    for (let a of state.agents) {
      if (a.talent > 0.7) {
        totalHighTalent++;
        if (a.wealth >= CONFIG.initialWealth) totalSuccess++;
      }
    }

    if (run % 10 === 0) {
      btn.textContent = `⏳ 运行中... ${run}/${numRuns}`;
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // 更新统计面板
  const avgTalent = winners.reduce((s, t) => s + t, 0) / numRuns;
  const successRate = (totalSuccess / totalHighTalent * 100);
  const avgPareto = totalPareto / numRuns;
  const avgGini = totalGini / numRuns;

  document.getElementById('multiAvgTalent').textContent = avgTalent.toFixed(3);
  document.getElementById('multiSuccessRate').textContent = successRate.toFixed(1) + '%';
  document.getElementById('multiPareto').textContent = avgPareto.toFixed(1) + '%';
  document.getElementById('multiGini').textContent = avgGini.toFixed(3);

  updateMultiTalentChart(winners);

  btn.disabled = false;
  btn.textContent = '⚡ 快速运行 (100次)';
}

// ============================================================
// 事件绑定
// ============================================================

document.getElementById('btnStart').addEventListener('click', () => {
  if (state.currentStep >= CONFIG.totalSteps) {
    resetSim();
  }
  state.running = true;
  state.paused = false;
  document.getElementById('btnStart').disabled = true;
  document.getElementById('btnPause').disabled = false;
  lastStepTime = 0;
  animationLoop();
});

document.getElementById('btnPause').addEventListener('click', () => {
  state.paused = !state.paused;
  document.getElementById('btnPause').textContent = state.paused ? '▶ 继续' : '⏸ 暂停';
  if (!state.paused) animationLoop();
});

document.getElementById('btnReset').addEventListener('click', () => {
  resetSim();
});

document.getElementById('btnFastRun').addEventListener('click', () => {
  fastRun100();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
  state.speed = parseInt(e.target.value);
});

document.getElementById('numAgents').addEventListener('change', () => {
  if (!state.running) resetSim();
});

document.getElementById('eventRatio').addEventListener('change', () => {
  if (!state.running) resetSim();
});

// ============================================================
// 初始化
// ============================================================

initCharts();
resetSim();
runFundingComparison();
