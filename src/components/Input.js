import React, { Component } from 'react';
import { CFG } from '../js/control';

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.ui ? props.value : CFG[props.prop]
    };
  }

  fireInput = (e) => {
    let value = undefined;

    // Filter by input type
    if (this.props.el === 'number') {
      value = Number(e.target.value);
      // Boudary control.
      if (value < e.target.min) {
        value = e.target.min;
      } else if (value > e.target.max) {
        value = e.target.max;
      }
    } else if (this.props.el === 'checkbox') {
      value = e.target.checked;
    } else if (this.props.el === 'select') {
      value = e.target.value;
    }

    // Needs the parent to update another components.
    if (this.props.reportsToParent) {
      this.props.reportToParent({ [this.props.prop]: value });
    }
    // If not a UI related input, update configuration.
    if (!this.props.ui) {
      CFG[this.props.setProp || this.props.prop] = value;
    }
    // Update components value.
    this.setState({ value: value });
  }

  render() {
    const {
      label, prop, step, min, max, groups, options, el, fromParent
    } = this.props;

    return (
      <span className="tab__item">
        <label htmlFor={prop}>{label}</label>
        {(el === 'number' || el === 'checkbox') &&
          <input
            id={prop}
            value={
              this.props.reportsToParent ?
                fromParent :
                this.state.value}
            type={el}
            onChange={e => this.fireInput(e)}
            {...(el === 'checkbox' &&
              { defaultChecked: this.state.value })}
            {...(el === 'number' &&
              { step: step, min: min, max: max })} />
        }
        {(el === 'select') &&
          <select
            id={prop}
            value={this.state.value}
            onChange={e => this.fireInput(e)}>
            {groups ? groups.map((group, i) => (
              <optgroup key={i} label={group.label}>
                <Options options={group.options} />
              </optgroup>
            )) : <Options options={options} />
            }
          </select>
        }
      </span>
    );
  }
}

function Options(props) {
  const { options } = props;
  return (
    options.map((option, i) => (
      <option key={i} value={option[0]}>
        {option[1]}
      </option>
    ))
  )
}
