import React, { Component } from 'react';
import { delegateNoiseCtxTo, CFG, NOISE_CAN_W, NOISE_CAN_H } from '../js/control';

const CAN_ID = 'canvas-noise';

export default class CanvasNoise extends Component {
  componentDidMount() {
    delegateNoiseCtxTo(
      document.getElementById(CAN_ID)
        .getContext('2d', {
          willReadFrequently: true
        })
    );
  }

  onMouseDownHandler = () => {
    window.onmousemove = (m) => {
      // Take movement deltas.
      const DRAG_x = -m.movementX;
      const DRAG_Y = -m.movementY;
      // Update settings.
      CFG.traslationX += DRAG_x;
      CFG.traslationY += DRAG_Y;
      // Report changes to parent.
      this.props.reportToParent({
        traslationX: CFG.traslationX,
        traslationY: CFG.traslationY
      });
      // Stop listener.
      window.onmouseup = () => {
        window.onmousemove = null;
      }
    }
  }

  render() {
    const { bg } = this.props;
    return (
      <canvas
        id={CAN_ID}
        width={NOISE_CAN_W}
        height={NOISE_CAN_H}
        className={bg}
        onMouseDown={this.onMouseDownHandler} />
    );
  }
}
