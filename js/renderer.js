// ============================================================
// Canvas 棋盘可视化渲染
// 支持自适应屏幕宽度，根据 devicePixelRatio 保证高清显示
// ============================================================

const gridCanvas = document.getElementById('gridCanvas');
const gctx = gridCanvas.getContext('2d');

// 获取 Canvas 的实际显示尺寸 (CSS 像素)
function getCanvasDisplaySize() {
  const container = gridCanvas.parentElement;
  const maxWidth = Math.min(container.clientWidth - 2, 600);
  return Math.max(200, maxWidth);
}

// 调整 Canvas 分辨率以适配屏幕
function resizeCanvas() {
  const displaySize = getCanvasDisplaySize();
  const dpr = window.devicePixelRatio || 1;
  gridCanvas.style.width = displaySize + 'px';
  gridCanvas.style.height = displaySize + 'px';
  gridCanvas.width = displaySize * dpr;
  gridCanvas.height = displaySize * dpr;
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// 获取当前用于绘制的逻辑尺寸 (CSS 像素)
function getCanvasDrawSize() {
  return getCanvasDisplaySize();
}

// --- 绘制棋盘 ---
// 代理人: 蓝色像素点, 财富越多越亮
// 幸运事件: 绿色圆点
// 不幸事件: 红色圆点
function drawGrid() {
  const N = CONFIG.gridSize;
  const canvasSize = getCanvasDrawSize();
  const cellSize = canvasSize / N;

  gctx.fillStyle = '#060a14';
  gctx.fillRect(0, 0, canvasSize, canvasSize);

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

  // 绘制网格线 (每20格一条, 极淡)
  gctx.strokeStyle = 'rgba(42, 53, 72, 0.15)';
  gctx.lineWidth = 0.5;
  for (let i = 0; i <= N; i += 20) {
    gctx.beginPath();
    gctx.moveTo(i * cellSize, 0);
    gctx.lineTo(i * cellSize, canvasSize);
    gctx.stroke();
    gctx.beginPath();
    gctx.moveTo(0, i * cellSize);
    gctx.lineTo(canvasSize, i * cellSize);
    gctx.stroke();
  }
}

// 监听窗口大小变化，重新调整 Canvas
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
    drawGrid();
  }, 150);
});
