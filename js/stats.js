// ============================================================
// 实时统计面板更新
// ============================================================

function updateStats() {
  const agents = [...state.agents].sort((a, b) => b.wealth - a.wealth);
  const totalWealth = agents.reduce((s, a) => s + a.wealth, 0);
  const maxAgent = agents[0];
  const minAgent = agents[agents.length - 1];
  const pareto = calcPareto(state.agents);
  const gini = calcGini(state.agents);

  document.getElementById('statStep').textContent = `${state.currentStep} / 80`;
  document.getElementById('statYear').textContent = Math.floor(state.currentStep / 2);
  document.getElementById('statTotalWealth').textContent = totalWealth.toFixed(0);
  document.getElementById('statMaxWealth').textContent = maxAgent.wealth.toFixed(1);
  document.getElementById('statMaxTalent').textContent = maxAgent.talent.toFixed(3);
  document.getElementById('statMinWealth').textContent = minAgent.wealth.toFixed(2);
  document.getElementById('statMinTalent').textContent = minAgent.talent.toFixed(3);
  document.getElementById('statPareto').textContent = pareto.toFixed(1) + '%';
  document.getElementById('statGini').textContent = gini.toFixed(3);

  // 进度条
  document.getElementById('progressFill').style.width = (state.currentStep / CONFIG.totalSteps * 100) + '%';
  document.getElementById('stepInfo').textContent =
    `第 ${state.currentStep} 步 / 共 ${CONFIG.totalSteps} 步 | 年份: ${Math.floor(state.currentStep / 2)} / 40`;

  // Top 5 / Bottom 5 排行表
  const top5 = agents.slice(0, 5);
  const bottom5 = agents.slice(-5).reverse();
  const tbody = document.getElementById('topTable');
  let html = '';
  for (let i = 0; i < 5; i++) {
    const a = top5[i];
    html += `<tr class="highlight-green"><td>#${i+1}</td><td>${a.wealth.toFixed(1)}</td><td>${a.talent.toFixed(3)}</td><td>${a.luckyHits}</td><td>${a.unluckyHits}</td></tr>`;
  }
  for (let i = 0; i < 5; i++) {
    const a = bottom5[i];
    const rank = agents.length - i;
    html += `<tr class="highlight-red"><td>#${rank}</td><td>${a.wealth.toFixed(2)}</td><td>${a.talent.toFixed(3)}</td><td>${a.luckyHits}</td><td>${a.unluckyHits}</td></tr>`;
  }
  tbody.innerHTML = html;
}
