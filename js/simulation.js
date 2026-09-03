// ============================================================
// TvL 模型模拟引擎
// 基于 Pluchino, Biondo & Rapisarda (2018) 的研究
// ============================================================

// --- 工具函数 ---

function gaussian(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// --- 初始化模拟 ---
// 在 201x201 棋盘上随机放置代理人和事件
function initSimulation(numAgents, eventRatio) {
  const N = CONFIG.gridSize;
  state.agents = [];
  state.events = [];
  state.currentStep = 0;

  state.grid = new Array(N * N).fill(null);

  // 创建代理人: 才能值服从正态分布, 初始财富相同
  const placed = new Set();
  for (let i = 0; i < numAgents; i++) {
    let x, y, key;
    do {
      x = Math.floor(Math.random() * N);
      y = Math.floor(Math.random() * N);
      key = y * N + x;
    } while (placed.has(key));
    placed.add(key);

    let t = gaussian(CONFIG.talentMean, CONFIG.talentStd);
    t = clamp(t, 0, 1);

    state.agents.push({
      id: i,
      x, y,
      talent: t,
      wealth: CONFIG.initialWealth,
      luckyHits: 0,
      unluckyHits: 0,
      luckyTaken: 0,
    });
    state.grid[key] = i;
  }

  // 创建事件: 绿色(幸运) + 红色(不幸)
  const numGreen = Math.round(CONFIG.numEvents * eventRatio);
  const numRed = CONFIG.numEvents - numGreen;
  for (let i = 0; i < numGreen; i++) {
    state.events.push({
      x: Math.floor(Math.random() * N),
      y: Math.floor(Math.random() * N),
      type: 'green',
    });
  }
  for (let i = 0; i < numRed; i++) {
    state.events.push({
      x: Math.floor(Math.random() * N),
      y: Math.floor(Math.random() * N),
      type: 'red',
    });
  }
}

// --- 执行一步模拟 ---
// 每个事件随机移动2格, 检查是否撞到或擦过代理人
function simulationStep() {
  const N = CONFIG.gridSize;
  const moveDist = CONFIG.eventMoveDistance;

  for (let e of state.events) {
    const dirs = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
    const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];

    e.x = clamp(e.x + dx * moveDist, 0, N - 1);
    e.y = clamp(e.y + dy * moveDist, 0, N - 1);

    // 检查事件当前位置及相邻8格内是否有代理人 (直接撞到或擦身而过)
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = e.x + ox;
        const cy = e.y + oy;
        if (cx >= 0 && cx < N && cy >= 0 && cy < N) {
          const idx = cy * N + cx;
          if (state.grid[idx] !== null) {
            applyEvent(state.agents[state.grid[idx]], e);
          }
        }
      }
    }
  }
  state.currentStep++;
}

// --- 应用事件效果 ---
// 幸运事件: 以才能值为概率翻倍财富 (能力越强越能抓住机会)
// 不幸事件: 财富减半 (不论才能, 灾难面前人人平等)
function applyEvent(agent, event) {
  if (event.type === 'green') {
    agent.luckyHits++;
    if (Math.random() < agent.talent) {
      agent.wealth *= 2;
      agent.luckyTaken++;
    }
  } else {
    agent.unluckyHits++;
    agent.wealth *= 0.5;
  }
}

// --- 基尼系数计算 ---
function calcGini(agents) {
  const wealths = agents.map(a => a.wealth).sort((a, b) => a - b);
  const n = wealths.length;
  const sum = wealths.reduce((s, w) => s + w, 0);
  if (sum === 0) return 0;
  let weightedSum = 0;
  for (let i = 0; i < n; i++) {
    weightedSum += (n - i) * wealths[i];
  }
  return (2 * weightedSum) / (n * sum) - (n + 1) / n;
}

// --- 帕累托比计算 (前20%的人掌握多少财富) ---
function calcPareto(agents) {
  const sorted = [...agents].sort((a, b) => b.wealth - a.wealth);
  const top20 = Math.floor(sorted.length * 0.2);
  const topWealth = sorted.slice(0, top20).reduce((s, a) => s + a.wealth, 0);
  const totalWealth = sorted.reduce((s, a) => s + a.wealth, 0);
  return totalWealth > 0 ? (topWealth / totalWealth * 100) : 0;
}
