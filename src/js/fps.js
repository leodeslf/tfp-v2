const MIN = Math.min;
const times = [];
let fps = 0
let fpsCtx = undefined;
let counter = 0;

export function delegateFPSCtxTo(context) {
  fpsCtx = context;
  resetLoop();
}

// update fps each frame
function resetLoop() {
  requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      // Remove timestamp occurred more than a second ago.
      times.shift();
    }
    times.push(now);
    // Update FPS each 10 frames.
    if (counter === 0) fps = times.length;
    printFPS();
    resetLoop();
  });
}

function printFPS() {
  fpsCtx.clearRect(0, 0, 49, 18);
  fpsCtx.font = '12px monospace';
  fpsCtx.textAlign = 'right';
  fpsCtx.fillStyle =
    fps < 15 ? '#F33' : fps < 30 ? '#FF3' : '#3F3';
  fpsCtx.fillText(MIN(fps, 60) + ' FPS', 44, 13);
  counter++;
  if (counter >= 10) counter = 0;
}
