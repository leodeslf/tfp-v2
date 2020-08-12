import { PERLIN_3D, PERLIN_2D, PERLIN_1D } from './libs/perlin';
import { Vec2 } from './libs/vec';

// Utils.
const INDEX = (x, y) => y * iMPPD * NOISE_CAN_W * iMPPD + x * iMPPD;
const SIN = Math.sin;
const COS = Math.cos;
const TRUNC = Math.trunc;
const PI = 3.14159;
const PI_05 = 1.570795;
const COLOR_RANGE = 255;
const HALF_COLOR_RANGE = 127;
const INIT_ZOOM = 1;
const PIXEL = [0, 0, 0, 0];
let raf = 0;
// Inverse mult. of pixels per data.
let iMPPD = 1;

export const NOISE_CAN_W = 256;
export const NOISE_CAN_H = 256;
export const SKIN_CAN_W = 256;
export const SKIN_CAN_H = 16;

// More utils.
const NOISE_CAN_HALF_H = NOISE_CAN_H * .5;
const NOISE_CAN_HALF_MIN_SIDE = NOISE_CAN_W > NOISE_CAN_H ?
  NOISE_CAN_H * .5 :
  NOISE_CAN_W * .5;
// Inverse mult. of noise half min. side.
const IMNCHMS = 1 / NOISE_CAN_HALF_MIN_SIDE;
const NOISE_CENTER = new Vec2(NOISE_CAN_W * .5, NOISE_CAN_H * .5);

// Canvas contexts and data holders.
let noiseCtx = undefined;
let skinCtx = undefined;
let noiseData = [];
let skinData = [];

const NOISE_IMG = new ImageData(NOISE_CAN_W, NOISE_CAN_H);
const SKIN_IMG = new Image(SKIN_CAN_W, SKIN_CAN_H);
SKIN_IMG.onload = () => {
  skinCtx.clearRect(0, 0, SKIN_CAN_W, SKIN_CAN_H);
  skinCtx.drawImage(SKIN_IMG, 0, 0);
  skinData = skinCtx.getImageData(0, 0, SKIN_CAN_W, 1).data;
}

// General configuration.
export const CFG = {
  /* Print */
  isDefaultSkin: true,
  skinName: 'default',
  set setSkinName(name) {
    SKIN_IMG.src = './skins/' + name + '.png';
    this.skinName = name;
    this.isDefaultSkin = name === 'default' ? true : false;
  },
  /* Settings */
  type: '_3D',
  set setType(type) {
    this.type = type;
    resetLoop(type);
  },
  invert: false,
  /* Animation */
  run: true,
  step: 0.01,
  seed: 0.0,
  /* Noise */
  frequency: 1.0,
  amplitude: 1.0,
  octaves: 6,
  lacunarity: 2.0,
  persistence: 0.5,
  /* View */
  traslationX: 0,
  traslationY: 0,
  resolutionW: NOISE_CAN_W,
  resolutionH: NOISE_CAN_H,
  zoom: INIT_ZOOM,
  scaleW: 1 / NOISE_CAN_W * INIT_ZOOM,
  scaleH: 1 / NOISE_CAN_H * INIT_ZOOM,
  /* Pixels per data */
  ppd: 3,
  set setResolutionW(w) {
    this.resolutionW = w;
    this.scaleW = 1 / (w * this.zoom);
  },
  set setResolutionH(h) {
    this.resolutionH = h;
    this.scaleH = 1 / (h * this.zoom);
  },
  set setZoom(zoom) {
    this.zoom = zoom;
    this.scaleW = 1 / (this.resolutionW * zoom);
    this.scaleH = 1 / (this.resolutionH * zoom);
  },
  set setPixelsPerData(pixels) {
    this.ppd = pixels;
    iMPPD = 1 / pixels;
  },
  u(x) { return (x + this.traslationX) * this.scaleW; },
  v(y) { return (y + this.traslationY) * this.scaleH; }
};

// Init noise canvas context.
export function delegateNoiseCtxTo(ctx) {
  noiseCtx = ctx;
  resetLoop(CFG.type);
}

// Init skin canvas context.
export function delegateSkinCtxTo(ctx) {
  skinCtx = ctx;
  CFG.setSkinName = CFG.skinName;
}

function resetLoop(type) {
  cancelAnimationFrame(raf);
  switch (type) {
    case '_1D': _1D(); break;
    case '_2D': _2D(); break;
    case '_3D': _3D(); break;
    case '_3DFlow': _3DFlow(); break;
    case '_3DRidge': _3DRidge(); break;
    case '_3DSinX': _3DSinX(); break;
    case '_3DFlame': _3DFlame(); break;
    case '_3DSphere': _3DSphere(); break;
    case '_3DSphereRidge': _3DSphereRidge(); break;
    default: _1D(); break;
  }
}

// Print used for 2 or 3D.
function printFrame() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      // Make it integer and clamp between 0 and 255
      let value = TRUNC(noiseData[INDEX(x, y)]);
      if (value > COLOR_RANGE) value = COLOR_RANGE;
      if (value < 0) value = 0;
      // Invert value.
      if (CFG.invert) value = COLOR_RANGE - value;
      if (CFG.isDefaultSkin) {
        PIXEL[0] = value;
        PIXEL[1] = value;
        PIXEL[2] = value;
        PIXEL[3] = value;
      } else {
        // Values = [0-255], skin image is 256 pixels wide.
        PIXEL[0] = skinData[value * 4 + 0];
        PIXEL[1] = skinData[value * 4 + 1];
        PIXEL[2] = skinData[value * 4 + 2];
        PIXEL[3] = skinData[value * 4 + 3];
      }
      // Loop through sub square (all the same color).
      for (let subY = 0; subY < CFG.ppd; subY++) {
        // Boudary control Y.
        if (y + subY >= NOISE_CAN_H) break;
        for (let subX = 0; subX < CFG.ppd; subX++) {
          // Boudary control X.
          if (x + subX >= NOISE_CAN_W) break;
          const PIXEL_INDEX = (y + subY) * (NOISE_CAN_W) + (x + subX);
          NOISE_IMG.data[PIXEL_INDEX * 4 + 0] = PIXEL[0];
          NOISE_IMG.data[PIXEL_INDEX * 4 + 1] = PIXEL[1];
          NOISE_IMG.data[PIXEL_INDEX * 4 + 2] = PIXEL[2];
          NOISE_IMG.data[PIXEL_INDEX * 4 + 3] = PIXEL[3];
        }
      }
    }
  }
  noiseCtx.clearRect(0, 0, NOISE_CAN_W, NOISE_CAN_H);
  noiseCtx.putImageData(NOISE_IMG, 0, 0);
}

function _1D() {
  for (let x = 0; x < NOISE_CAN_W; x++) {
    const U = CFG.u(x);
    let n = 0, freK = CFG.frequency, ampK = CFG.amplitude;
    for (let k = 0; k < CFG.octaves; k++) {
      n += SIN(PERLIN_1D((U + k) * freK + CFG.seed) * ampK);
      freK *= CFG.lacunarity;
      ampK *= CFG.persistence;
    }
    n = n * NOISE_CAN_HALF_H + NOISE_CAN_HALF_H;
    if (CFG.invert) n = NOISE_CAN_H - n;
    noiseData[x] = n;
  }
  // Print.
  noiseCtx.clearRect(0, 0, NOISE_CAN_W, NOISE_CAN_H);
  noiseCtx.beginPath();
  noiseCtx.strokeStyle = '#3F3';
  noiseCtx.lineWidth = 1;
  noiseCtx.moveTo(0, noiseData[0]);
  noiseData.forEach((n, i) => {
    noiseCtx.lineTo(
      i + 1, (i + 1 < NOISE_CAN_W ? noiseData[i + 1] : n));
  });
  noiseCtx.stroke();
  noiseCtx.closePath();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_1D);
}

function _2D() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const U = CFG.u(x), V = CFG.v(y);
      let n = 0, freK = CFG.frequency, ampK = CFG.amplitude
      for (let k = 0; k < CFG.octaves; k++) {
        n += SIN(PERLIN_2D(
          (U + k) * freK + CFG.seed,
          (V + k) * freK + CFG.seed) * ampK);
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      noiseData[INDEX(x, y)] = n * HALF_COLOR_RANGE + HALF_COLOR_RANGE;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_2D);
}

function _3D() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const U = CFG.u(x), V = CFG.v(y);
      let n = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        n += SIN(PERLIN_3D(
          (U + k) * freK,
          (V + k) * freK,
          CFG.seed) * ampK);
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      noiseData[INDEX(x, y)] = n * HALF_COLOR_RANGE + HALF_COLOR_RANGE;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3D);
}

function _3DFlow() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      let u = CFG.u(x), v = CFG.v(y);
      let n0 = 0, n1 = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        n0 += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          CFG.seed) * ampK;
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      const LENGHT = n0 < 0 ? -n0 * 48 : n0 * 48;
      const ROTATION = n0 * PI;
      const VEC = Vec2.byPolarCoords(LENGHT, ROTATION);
      // Rotated and displaced coords.
      u = CFG.u(x + VEC.x);
      v = CFG.v(y + VEC.y);
      freK = CFG.frequency;
      ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        n1 += PERLIN_3D(
          (u + k) * freK,
          (v + k) * freK,
          CFG.seed) * ampK;
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      noiseData[INDEX(x, y)] = n1 * HALF_COLOR_RANGE + HALF_COLOR_RANGE;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3DFlow);
}

function _3DRidge() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const U = CFG.u(x), V = CFG.v(y);
      let nAbs = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        const N = SIN(PERLIN_3D(
          (U + k) * freK,
          (V + k) * freK,
          CFG.seed) * ampK);
        nAbs += N < 0 ? -N : N;
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      noiseData[INDEX(x, y)] = nAbs * COLOR_RANGE;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3DRidge);
}

function _3DSinX() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const U = CFG.u(x), V = CFG.v(y);
      let n = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        n += SIN(PERLIN_3D(
          (U + k) * freK,
          (V + k) * freK,
          CFG.seed) * ampK);
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      /**
       * Wood/Marble-like texture.
       * Sin functions of x axis displaced and augmented.
       */
      noiseData[INDEX(x, y)] =
        SIN((U + n) * PI * 4) * HALF_COLOR_RANGE + HALF_COLOR_RANGE;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3DSinX);
}

function _3DFlame() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const U = CFG.u(x), V = CFG.v(y);
      let n = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        n += SIN(PERLIN_3D(
          (U + k) * freK,
          (V + k) * freK + CFG.seed * 5,
          CFG.seed * 1) * ampK);
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      /**
       * A --> Center value of sin waves from x axis with displaced domine.
       * B --> Mult. that to percent. of y
       */
      noiseData[INDEX(x, y)] =
        (SIN((U + n) * PI) * HALF_COLOR_RANGE + HALF_COLOR_RANGE) *
        (y / NOISE_CAN_H);
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3DFlame);
}

function _3DSphere() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const XY = new Vec2(x, y),
        DIS = Vec2.distanceEuclidian(XY, NOISE_CENTER),
        DIS_PI_05 = (DIS * IMNCHMS) * PI_05,
        U = CFG.u(x), V = CFG.v(y);
      let n = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        n += SIN(PERLIN_3D(
          (U + k) * freK,
          (V + k) * freK,
          CFG.seed * 5 + COS(DIS_PI_05)
        ) * ampK);
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      /**
       * A --> Center noise, percent. of noise applied to color,
       * apply 'sphere fade' percent. to that.
       * B --> 'Sphere fade' percent. to color.
       * C --> Average A and B.
       */
      noiseData[INDEX(x, y)] =
        ((n * HALF_COLOR_RANGE + HALF_COLOR_RANGE) * COS(DIS_PI_05) +
          COLOR_RANGE * COS(DIS_PI_05)) * .5;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3DSphere);
}

function _3DSphereRidge() {
  for (let y = 0; y < NOISE_CAN_H; y += CFG.ppd) {
    for (let x = 0; x < NOISE_CAN_W; x += CFG.ppd) {
      const XY = new Vec2(x, y),
        DIS = Vec2.distanceEuclidian(XY, NOISE_CENTER),
        DIS_PI_05 = (DIS * IMNCHMS) * PI_05,
        U = CFG.u(x), V = CFG.v(y);
      let nAbs = 0, freK = CFG.frequency, ampK = CFG.amplitude;
      for (let k = 0; k < CFG.octaves; k++) {
        const N = SIN(PERLIN_3D(
          (U + k) * freK,
          (V + k) * freK,
          CFG.seed * 4 + COS(DIS_PI_05)
        ) * ampK);
        nAbs += N < 0 ? -N : N;
        freK *= CFG.lacunarity;
        ampK *= CFG.persistence;
      }
      /**
       * A --> Noise percent. applied to color,
       * apply 'sphere fade' percent. to that.
       * B --> 'Sphere fade' percent. to color.
       * C --> Average A and B.
       */
      noiseData[INDEX(x, y)] =
        (nAbs * COLOR_RANGE * COS(DIS_PI_05) +
          COLOR_RANGE * COS(DIS_PI_05)) * .5;
    }
  }
  printFrame();
  if (CFG.run) CFG.seed += CFG.step;
  raf = requestAnimationFrame(_3DSphereRidge);
}
