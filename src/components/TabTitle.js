import React from 'react'

export default function TabTitle(props) {
  const { name, label, def } = props;
  return (
    <>
      <input
        id={`radio--${name}`}
        className="tab-title__radio"
        name="tab-title"
        type="radio"
        defaultChecked={def}>
      </input>
      <label
        htmlFor={`radio--${name}`}
        className="tab-title__label">
        {label}
      </label>
    </>
  )
}
