const MIN = Math.min;
const times = [];
let fps, ctx;
let counter = 0;

export function setContextFPS(context) {
  ctx = context;
  initLoop();
}

// update fps each frame
function initLoop() {
  requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      // Remove timestamp occurred more than a second ago
      times.shift();
    }
    times.push(now);
    // update FPS each 10 frames
    if (counter === 0) fps = times.length;
    printFPS();
    initLoop();
  });
}

function printFPS() {
  ctx.clearRect(0, 0, 49, 18);
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle =
    fps < 15 ? '#F33' : fps < 30 ? '#FF3' : '#3F3';
  ctx.fillText(MIN(fps, 60) + ' FPS', 44, 13);
  counter++;
  if (counter >= 10) counter = 0;
}
