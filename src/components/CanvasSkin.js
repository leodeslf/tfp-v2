import React, { Component } from 'react'
import { delegateSkinCtxTo, SKIN_CAN_W, SKIN_CAN_H } from '../js/control';

const CAN_ID = 'canvas-skin';

export default class CanvasSkin extends Component {
  componentDidMount() {
    delegateSkinCtxTo(document.getElementById(CAN_ID).getContext('2d'));
  }

  render() {
    const { bg } = this.props;
    return (
      <canvas
        id={CAN_ID}
        width={SKIN_CAN_W}
        height={SKIN_CAN_H}
        className={bg} />
    )
  }
}
