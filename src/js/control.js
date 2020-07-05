import { PERLIN_3D, PERLIN_2D, PERLIN_1D, fade } from './libs/perlin';
import { Vec2 } from './libs/vec';

// utils
const PI = 3.14159;
const IMG_RES = 256;
const IMG_RES05 = IMG_RES * .5;
const MAX = Math.max;
const MIN = Math.min;

const IMG_DATA = new ImageData(IMG_RES, IMG_RES);
const DATA_ARRAY = [];

let raf = 0;
let ctx = undefined;
let sizeW = undefined;
let sizeH = undefined;

const INDEX = (x, y) => (y / S.ppd) * (IMG_RES / S.ppd) + (x / S.ppd);
const U = (x) => (S.traX + x) * sizeW;
const V = (y) => (S.traY + y) * sizeH;

// settings
export const S = {
  type: 'genData3D',
  flowFac: 100,
  ridgeInv: false,
  flameFac: 1,
  centerFac: 1,
  skin: 'default',
  skinData: [],
  /* skinRotation: false,
  pixelsToRotate: 2, */
  run: true,
  step: 0.01,
  seed: 0.0,
  specSeed: 0,
  fre: 1.0,
  amp: 1.0,
  oct: 6,
  lac: 2.0,
  per: 0.5,
  traX: 0,
  traY: 0,
  resW: 256,
  resH: 256,
  zoom: 1,
  ppd: 2,
}

export function setContextNoise(context) {
  ctx = context;
  resetLoop('type', S.type);
}

export function resetLoop(name, value) {
  S[name] = value;
  sizeW = 1 / (S.resW * S.zoom);
  sizeH = 1 / (S.resH * S.zoom);
  if (name === 'type') {
    cancelAnimationFrame(raf);
    switch (S.type) {
      case 'printAndgenData1D': printAndgenData1D(); break;
      case 'genData2D': genData2D(); break;
      case 'genData3D': genData3D(); break;
      case 'genData3DFlow': genData3DFlow(); break;
      case 'genData3DRidge': genData3DRidge(); break;
      case 'genData3DSin': genData3DSin(); break;
      case 'genData3DFlame': genData3DFlame(); break;
      case 'genData3DCenter': genData3DCenter(); break;
      case 'genData3DCenterRidge': genData3DCenterRidge(); break;
      default: genData3D(); break;
    }
  }
}

function runSeed() {
  if (S.run) S.seed = ((S.seed + S.step) * 1000) * 0.001;
  /* if (S.skinRotation) {
    const CHUNK = [];
    const PIXELS = S.pixelsToRotate;
    for (let n = 0; n < PIXELS; n++) {
      for (let RGBA = 3; RGBA >= 0; RGBA--) {
        CHUNK[RGBA] = S.skinData.pop(); // pop last pixel data
      }
      S.skinData.unshift(...CHUNK); // unshift last pixel
    }
  } */
}

function printData() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      for (let sub_y = 0; sub_y < S.ppd; sub_y++) {
        for (let sub_x = 0; sub_x < S.ppd; sub_x++) {
          if (x + sub_x >= IMG_RES || y + sub_y >= IMG_RES) break;
          const PIXEL_INDEX = (y + sub_y) * IMG_RES + (x + sub_x);
          const DATA = MAX(MIN(
            DATA_ARRAY[INDEX(x, y)],
            255), 0);
          if (S.skin !== 'default') {
            IMG_DATA.data[PIXEL_INDEX * 4 + 0] = S.skinData[DATA * 4 + 0];
            IMG_DATA.data[PIXEL_INDEX * 4 + 1] = S.skinData[DATA * 4 + 1];
            IMG_DATA.data[PIXEL_INDEX * 4 + 2] = S.skinData[DATA * 4 + 2];
            IMG_DATA.data[PIXEL_INDEX * 4 + 3] = S.skinData[DATA * 4 + 3];
          } else {
            IMG_DATA.data[PIXEL_INDEX * 4 + 0] = DATA;
            IMG_DATA.data[PIXEL_INDEX * 4 + 1] = DATA;
            IMG_DATA.data[PIXEL_INDEX * 4 + 2] = DATA;
            IMG_DATA.data[PIXEL_INDEX * 4 + 3] = DATA;
          }
        }
      }
    }
  }
  ctx.clearRect(0, 0, IMG_RES, IMG_RES);
  ctx.putImageData(IMG_DATA, 0, 0);
  runSeed();
}

// loops
function printAndgenData1D() {
  for (let x = 0; x < IMG_RES; x++) {
    const u = U(x);
    let n = 0, fre_k = S.fre, amp_k = S.amp;
    for (let k = 0; k < S.oct; k++) {
      n += PERLIN_1D((u + k) * fre_k + S.seed) * amp_k;
      fre_k *= S.lac;
      amp_k *= S.per;
    }
    DATA_ARRAY[x] = n * IMG_RES05 + IMG_RES05;
  }
  /* print */
  ctx.clearRect(0, 0, IMG_RES, IMG_RES);
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.moveTo(0, DATA_ARRAY[0]);
  DATA_ARRAY.forEach((x, i) => {
    ctx.lineTo(i + 1, (i + 1 < IMG_RES ? DATA_ARRAY[i + 1] : x));
  });
  ctx.stroke();
  ctx.closePath();
  runSeed();
  raf = requestAnimationFrame(printAndgenData1D);
}

function genData2D() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const u = U(x), v = V(y);
      let n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct; k++) {
        n += PERLIN_2D(
          (u + k) * freK + S.seed,
          (v + k) * freK + S.seed) * ampK;
        freK *= S.lac;
        ampK *= S.per;
      }
      DATA_ARRAY[INDEX(x, y)] = Math.round(n * 128 + 128);
    }
  }
  printData();
  raf = requestAnimationFrame(genData2D);
}

function genData3D() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const u = U(x), v = V(y);
      let n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct; k++) {
        n += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed) * ampK;
        freK *= S.lac;
        ampK *= S.per;
      }
      DATA_ARRAY[INDEX(x, y)] = Math.round(n * 128 + 128);
    }
  }
  printData();
  raf = requestAnimationFrame(genData3D);
}

function genData3DFlow() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      let rotation = 0, n = 0, freK = S.fre, ampK = S.amp;
      let u = U(x), v = V(y);
      for (let k = 0; k < S.oct; k++) {
        rotation += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed) * ampK;
        freK *= S.lac;
        ampK *= S.per;
      }
      const LENGHT = rotation * S.flowFac;
      rotation *= PI * .5;
      const VEC = Vec2.byPolarCoords(LENGHT, rotation);
      u = U(VEC.x + x);
      v = V(VEC.y + y);
      freK = S.fre; // reset
      ampK = S.amp; // reset
      for (let k = 0; k < S.oct; k++) {
        n += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed) * ampK;
        freK *= S.lac;
        ampK *= S.per;
      }
      DATA_ARRAY[INDEX(x, y)] = Math.round(n * 128 + 128);
    }
  }
  printData();
  raf = requestAnimationFrame(genData3DFlow);
}

function genData3DRidge() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const u = U(x), v = V(y);
      let n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct; k++) {
        const AUX = PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed) * ampK;
        n += AUX > 0 ? AUX : -AUX;
        freK *= S.lac;
        ampK *= S.per;
      }
      DATA_ARRAY[INDEX(x, y)] =
        Math.round((S.ridgeInv ? 1 - n : n) * 255);
    }
  }
  printData();
  raf = requestAnimationFrame(genData3DRidge);
}

function genData3DSin() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const u = U(x), v = V(y);
      let n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct; k++) {
        n += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed) * ampK;
        freK *= S.lac;
        ampK *= S.per;
      }
      DATA_ARRAY[INDEX(x, y)] =
        Math.round(Math.sin((x / S.resW + n) * PI) * 128 + 128);
    }
  }
  printData();
  raf = requestAnimationFrame(genData3DSin);
}

function genData3DFlame() {
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const u = U(x), v = V(y);
      let n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct; k++) {
        n += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK + S.seed * 4,
          S.seed) * ampK;
        freK *= S.lac;
        ampK *= S.per;
      }
      DATA_ARRAY[INDEX(x, y)] =
        Math.round(((Math.sin((x / S.resW + n) * S.flameFac * PI)) * 128
        ) + 128) - ((S.resH - y));
    }
  }
  printData();
  raf = requestAnimationFrame(genData3DFlame);
}

function genData3DCenter() {
  const CENTER = new Vec2(IMG_RES05, IMG_RES05);
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const POS = new Vec2(x, y);
      const DISTANCE = fade(
        Vec2.distanceEuclidian(POS, CENTER) / IMG_RES05) * IMG_RES;
      let
        u = (S.traX + x) * sizeW,
        v = (S.traY + y) * sizeH,
        n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct;
        k++, freK *= S.lac, ampK *= S.per) {
        n += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed * 4 + Math.cos(DISTANCE / (IMG_RES * S.centerFac))
        ) * ampK;
      }
      DATA_ARRAY[INDEX(x, y)] =
        Math.round((n - (DISTANCE / IMG_RES)) * 128 + 128);
    }
  }
  printData();
  raf = requestAnimationFrame(genData3DCenter);
}

function genData3DCenterRidge() {
  const CENTER = new Vec2(IMG_RES05, IMG_RES05);
  for (let y = 0; y < IMG_RES; y += S.ppd) {
    for (let x = 0; x < IMG_RES; x += S.ppd) {
      const POS = new Vec2(x, y);
      const DISTANCE = fade(
        Vec2.distanceEuclidian(POS, CENTER) / IMG_RES05) * IMG_RES;
      let
        u = U(x),
        v = V(y),
        n = 0, freK = S.fre, ampK = S.amp;
      for (let k = 0; k < S.oct;
        k++, freK *= S.lac, ampK *= S.per) {
        const AUX = PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          S.seed * 4 + Math.cos(DISTANCE / (IMG_RES * S.centerFac))
        ) * ampK;
        n += AUX > 0 ? AUX : -AUX;
      }
      DATA_ARRAY[INDEX(x, y)] =
        Math.round((n - (DISTANCE / IMG_RES)) * 128 + 128);
    }
  }
  printData();
  raf = requestAnimationFrame(genData3DCenterRidge);
}
