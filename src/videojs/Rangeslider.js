import React, { useEffect, useRef, useState } from "react";
// import "./new";
function Rangeslider({ data }) {
  const lowerSlider = useRef();
  const upperSlider = useRef();
  const [first, setfirst] = useState({ low: "", up: "" });

  function changeupdata() {
    var lowerVal = parseInt(lowerSlider.current.value);
    var upperVal = parseInt(upperSlider.current.value);

    if (upperVal < lowerVal + 2) {
      lowerSlider.current.value = upperVal - 2;
      setfirst({ ...first, low: upperVal - 2 });
      if (lowerVal == lowerSlider.current.min) {
        upperSlider.value = 2;
        setfirst({ ...first, up: 2 });
      }
    }
  }
  function changelowdata() {
    var lowerVal = parseInt(lowerSlider.current.value);
    var upperVal = parseInt(upperSlider.current.value);

    if (lowerVal > upperVal - 2) {
      upperSlider.current.value = lowerVal + 4;

      if (upperVal == upperSlider.current.max) {
        lowerSlider.current.value = parseInt(upperSlider.current.max) - 2;
      }
    }
  }
  return (
    <span className="multi-range">
      <input
        type="range"
        min={0}
        max={10}
        defaultValue={0}
        ref={lowerSlider}
        id="up"
        onChange={changeupdata}
      />
      <input
        type="range"
        min={0}
        max={10}
        defaultValue={10}
        ref={upperSlider}
        id="low"
        onChange={changelowdata}
      />
    </span>
  );
}

export default Rangeslider;
