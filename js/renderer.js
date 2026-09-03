// ============================================================
// Canvas 棋盘可视化渲染
// ============================================================

const gridCanvas = document.getElementById('gridCanvas');
const gctx = gridCanvas.getContext('2d');
const CANVAS_SIZE = 600;

// --- 绘制棋盘 ---
// 代理人: 蓝色像素点, 财富越多越亮
// 幸运事件: 绿色圆点
// 不幸事件: 红色圆点
function drawGrid() {
  const N = CONFIG.gridSize;
  const cellSize = CANVAS_SIZE / N;

  gctx.fillStyle = '#060a14';
  gctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 绘制代理人
  for (let a of state.agents) {
    if (a.wealth > CONFIG.initialWealth * 2) {
      gctx.fillStyle = `rgba(79, 195, 247, ${Math.min(1, 0.3 + a.wealth / 1000)})`;
    } else if (a.wealth < CONFIG.initialWealth * 0.5) {
      gctx.fillStyle = 'rgba(100, 100, 120, 0.4)';
    } else {
      gctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
    }
    gctx.fillRect(a.x * cellSize, a.y * cellSize, Math.max(1, cellSize), Math.max(1, cellSize));
  }

  // 绘制事件
  for (let e of state.events) {
    gctx.fillStyle = e.type === 'green' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(239, 83, 80, 0.9)';
    const r = Math.max(2, cellSize * 1.5);
    gctx.beginPath();
    gctx.arc(e.x * cellSize + cellSize / 2, e.y * cellSize + cellSize / 2, r, 0, Math.PI * 2);
    gctx.fill();
  }

  // 绘制网格线 (每10格一条, 极淡)
  gctx.strokeStyle = 'rgba(42, 53, 72, 0.1)';
  gctx.lineWidth = 0.5;
  for (let i = 0; i <= N; i += 10) {
    gctx.beginPath();
    gctx.moveTo(i * cellSize, 0);
    gctx.lineTo(i * cellSize, CANVAS_SIZE);
    gctx.stroke();
    gctx.beginPath();
    gctx.moveTo(0, i * cellSize);
    gctx.lineTo(CANVAS_SIZE, i * cellSize);
    gctx.stroke();
  }
}
