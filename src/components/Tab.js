import React from 'react'

export default function Tab(props) {
  return (
    <>
      <input
        id={`radio--${props.name}`}
        className="tab-radio"
        name="tabs"
        type="radio"
        defaultChecked={props.def} />
      <label
        htmlFor={`radio--${props.name}`}
        className="tab-label">
        {props.label}
      </label>
    </>
  )
}
