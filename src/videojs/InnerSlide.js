import Nouislider from "nouislider-react";
import React, { useEffect, useState } from "react";
import "nouislider/distribute/nouislider.css";
import Draggable from "react-draggable";
import "./innerSlide.css";
function InnerSlide({ min, max, refdata, point, setPoint, duration }) {
  function changehandle(e) {
    refdata.current.seekTo(
      (Number(e.target.value) / 1000).toFixed(2),
      "seconds"
    );
    // setPoint((Number(e.target.value) / 1000).toFixed(2));
  }
  const [activeDrags, setActiveDrags] = useState(0);
  const onStart = () => {
    setActiveDrags(activeDrags + 1);
  };

  const onStop = () => {
    setActiveDrags(activeDrags - 1);
  };
  const dragHandlers = { onStart: onStart, onStop: onStop };
  return (
    // <input
    //   type="range"
    //   style={{ width: "100%" }}
    //   min={min}
    //   max={max}
    //   onChange={changehandle}
    //   //   value={refdata.current.player.prevPlayed || 0}
    // />
    <Draggable bounds="parent" {...dragHandlers}>
      <div
        className="box"
        style={{
          color: "red",
          width: "5px",
          height: "100%",
          background: "#f5cd05",
          zIndex: "999",
          cursor: "pointer",
        }}
      ></div>
    </Draggable>
  );
}

export default InnerSlide;
