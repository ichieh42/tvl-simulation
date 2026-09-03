// ============================================================
// Chart.js 图表初始化与更新
// ============================================================

Chart.defaults.color = '#8a96aa';
Chart.defaults.borderColor = '#2a3548';

let wealthChart, scatterChart, multiTalentChart;

// --- 初始化所有图表 ---
function initCharts() {
  // 财富分布柱状图 (验证幂律/帕累托分布)
  wealthChart = new Chart(document.getElementById('wealthChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: '人数', data: [], backgroundColor: 'rgba(79,195,247,0.6)', borderColor: 'rgba(79,195,247,1)', borderWidth: 1 }] },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '财富区间 (对数)' }, ticks: { maxRotation: 45 } },
        y: { title: { display: true, text: '人数' }, beginAtZero: true }
      },
      plugins: { legend: { display: false } }
    }
  });

  // 才能值 vs 最终财富散点图
  scatterChart = new Chart(document.getElementById('scatterChart'), {
    type: 'scatter',
    data: { datasets: [{ label: '代理人', data: [], backgroundColor: 'rgba(79,195,247,0.5)', pointRadius: 3 }] },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '才能值 (T)' }, min: 0, max: 1 },
        y: { title: { display: true, text: '最终财富' }, type: 'logarithmic' }
      },
      plugins: { legend: { display: false } }
    }
  });

  // 多次运行第一名才能值分布
  multiTalentChart = new Chart(document.getElementById('multiTalentChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: '次数', data: [], backgroundColor: 'rgba(76,175,80,0.6)', borderColor: 'rgba(76,175,80,1)', borderWidth: 1 }] },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '才能值区间' } },
        y: { title: { display: true, text: '第一名出现次数' }, beginAtZero: true }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// --- 更新财富分布图 (对数分箱) ---
function updateWealthChart() {
  const wealths = state.agents.map(a => a.wealth);
  const min = Math.max(0.01, Math.min(...wealths));
  const max = Math.max(...wealths);

  const numBins = 20;
  const logMin = Math.log10(Math.max(0.01, min));
  const logMax = Math.log10(Math.max(1, max));
  const binWidth = (logMax - logMin) / numBins || 1;

  const bins = new Array(numBins).fill(0);
  const labels = [];
  for (let i = 0; i < numBins; i++) {
    const lo = logMin + i * binWidth;
    labels.push(Math.pow(10, lo).toFixed(1));
  }

  for (let w of wealths) {
    let bin = Math.floor((Math.log10(Math.max(0.01, w)) - logMin) / binWidth);
    bin = clamp(bin, 0, numBins - 1);
    bins[bin]++;
  }

  wealthChart.data.labels = labels;
  wealthChart.data.datasets[0].data = bins;
  wealthChart.update('none');
}

// --- 更新散点图 ---
function updateScatterChart() {
  const data = state.agents.map(a => ({ x: a.talent, y: Math.max(0.01, a.wealth) }));
  scatterChart.data.datasets[0].data = data;
  scatterChart.update('none');
}

// --- 更新多次运行才能分布图 ---
function updateMultiTalentChart(winners) {
  const talentBins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const binLabels = ['<0.5','0.5-0.55','0.55-0.6','0.6-0.65','0.65-0.7','0.7-0.75','0.75-0.8','0.8-0.85','0.85-0.9','>0.9'];
  for (let t of winners) {
    let bin = Math.floor((t - 0.5) / 0.05);
    bin = clamp(bin, 0, 9);
    talentBins[bin]++;
  }
  multiTalentChart.data.labels = binLabels;
  multiTalentChart.data.datasets[0].data = talentBins;
  multiTalentChart.update();
}
