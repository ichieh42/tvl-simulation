// ============================================================
// TvL 模型全局配置与状态
// ============================================================

const CONFIG = {
  gridSize: 201,
  numAgents: 1000,
  initialWealth: 10,
  talentMean: 0.6,
  talentStd: 0.1,
  numEvents: 500,
  totalSteps: 80,
  eventMoveDistance: 2,
};

let state = {
  agents: [],
  events: [],
  grid: null,
  currentStep: 0,
  running: false,
  paused: false,
  speed: 50,
  eventRatio: 0.5,
};
