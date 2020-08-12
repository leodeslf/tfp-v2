import React, { Component } from 'react';
import { delegateFPSCtxTo } from '../js/fps';

const CAN_ID = 'canvas-fps';

export default class CanvasFPS extends Component {
  componentDidMount() {
    delegateFPSCtxTo(document.getElementById(CAN_ID).getContext('2d'));
  }

  render() {
    return (
      <canvas id={CAN_ID}
        width={49}
        height={18}
        style={{ display: this.props.visible ? 'block' : 'none' }} />
    )
  }
}
