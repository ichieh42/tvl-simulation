// ============================================================
// 资源分配策略模拟
// 模拟政府/机构每5年(10步)向代理人提供资金补助
// 比较不同策略对高才能者(T>0.7)成功率的提升效果
// ============================================================

// --- 资源分配策略列表 ---
const FUNDING_STRATEGIES = [
  { id: 'none',            name: '无补助 (对照组)',          budget: 0 },
  { id: 'equal_1',         name: '全民补助 1元',             budget: 8000 },
  { id: 'equal_5',         name: '全民补助 5元',             budget: 40000 },
  { id: 'elite_50_5',      name: '精英(前50%) 5元',          budget: 20000 },
  { id: 'elite_25_10',     name: '精英(前25%) 10元',         budget: 20000 },
  { id: 'elite_10_20',     name: '精英(前10%) 20元',         budget: 16000 },
  { id: 'random_25_10',    name: '随机(25%) 10元',           budget: 20000 },
  { id: 'mixed_25_10_rest_5', name: '折衷: 前25%得10 其余得5', budget: 70000 },
];

// --- 运行单一策略的模拟 ---
function simulateFundingStrategy(strategy) {
  initSimulation(1000, 0.5);

  for (let step = 0; step < CONFIG.totalSteps; step++) {
    // 每10步(5年)分配一次资金
    if (step > 0 && step % 10 === 0) {
      applyFunding(strategy);
    }
    simulationStep();
  }

  // 统计高才能者(T>0.7)的成功率
  let highTalent = 0;
  let success = 0;
  for (let a of state.agents) {
    if (a.talent > 0.7) {
      highTalent++;
      if (a.wealth >= CONFIG.initialWealth) success++;
    }
  }
  return {
    successRate: highTalent > 0 ? (success / highTalent * 100) : 0,
    highTalentCount: highTalent,
    successCount: success,
  };
}

// --- 应用资金补助 ---
function applyFunding(strategyId) {
  const sorted = [...state.agents].sort((a, b) => b.wealth - a.wealth);
  const n = state.agents.length;

  switch (strategyId) {
    case 'none':
      break;
    case 'equal_1':
      for (let a of state.agents) a.wealth += 1;
      break;
    case 'equal_5':
      for (let a of state.agents) a.wealth += 5;
      break;
    case 'elite_50_5':
      for (let i = 0; i < n / 2; i++) sorted[i].wealth += 5;
      break;
    case 'elite_25_10':
      for (let i = 0; i < n / 4; i++) sorted[i].wealth += 10;
      break;
    case 'elite_10_20':
      for (let i = 0; i < n / 10; i++) sorted[i].wealth += 20;
      break;
    case 'random_25_10': {
      const indices = [...Array(n).keys()].sort(() => Math.random() - 0.5).slice(0, Math.floor(n / 4));
      for (let idx of indices) state.agents[idx].wealth += 10;
      break;
    }
    case 'mixed_25_10_rest_5':
      for (let i = 0; i < Math.floor(n / 4); i++) sorted[i].wealth += 10;
      for (let i = Math.floor(n / 4); i < n; i++) sorted[i].wealth += 5;
      break;
  }
}

// --- 运行所有策略对比并渲染结果 ---
async function runFundingComparison() {
  const container = document.getElementById('fundingResults');
  container.innerHTML = '<div style="color:var(--text-dim);grid-column:1/-1;">模拟中，请稍候...</div>';
  await new Promise(r => setTimeout(r, 50));

  let html = '';
  for (let s of FUNDING_STRATEGIES) {
    const result = simulateFundingStrategy(s.id);
    const efficiency = s.budget > 0
      ? (result.successRate / s.budget * 1000).toFixed(2)
      : '—';
    html += `
      <div class="funding-item">
        <div class="name">${s.name}</div>
        <div class="metric">总预算: <b>${s.budget}</b></div>
        <div class="metric">高才能成功率: <b>${result.successRate.toFixed(1)}%</b></div>
        <div class="metric">效率 (成功率/千元): <b>${efficiency}</b></div>
      </div>`;
    container.innerHTML = html;
    await new Promise(r => setTimeout(r, 10));
  }
}
