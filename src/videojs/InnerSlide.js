import Nouislider from "nouislider-react";
import React, { useEffect } from "react";
import "nouislider/distribute/nouislider.css";
import "./innerSlide.css";
function InnerSlide({ min, max, refdata, point, setPoint, duration }) {
  function changehandle(e) {
    refdata.current.seekTo(
      (Number(e.target.value) / 1000).toFixed(2),
      "seconds"
    );
    // setPoint((Number(e.target.value) / 1000).toFixed(2));
  }

  return (
    // <input
    //   type="range"
    //   style={{ width: "100%" }}
    //   min={min}
    //   max={max}
    //   onChange={changehandle}
    //   //   value={refdata.current.player.prevPlayed || 0}
    // />
    <div class="slidecontainer">
      <input
        style={{ width: "100%" }}
        type="range"
        min={min}
        max={max}
        step={100}
        onChange={changehandle}
        // value={point}
        class="slider"
        id="myRange"
      />
    </div>
  );
}

export default InnerSlide;
