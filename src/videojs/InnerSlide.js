import Nouislider from "nouislider-react";
import React, { useEffect, useState } from "react";
import "nouislider/distribute/nouislider.css";
import Draggable from "react-draggable";
import "./innerSlide.css";
function InnerSlide({
  min,
  max,
  refdata,
  point,
  setPoint,
  duration,
  totalwidth,
  setslider,
}) {
  function changehandle(e) {
    refdata.current.seekTo(
      (Number(e.target.value) / 1000).toFixed(2),
      "seconds"
    );
    // setPoint((Number(e.target.value) / 1000).toFixed(2));
  }
  const [activeDrags, setActiveDrags] = useState(0);

  const onStart = () => {
    setslider(true);
    setActiveDrags(activeDrags + 1);
  };

  const onStop = () => {
    setActiveDrags(activeDrags - 1);
    setslider(false);
  };
  
  const onControlledDrag = (e, position) => {


    const { x, y } = position;
    let xpercentage = x * 100;
    let gettotalpercentage = (xpercentage / totalwidth).toFixed(2);
 
    let gettime = ((duration * gettotalpercentage) / 100).toFixed(2);
    refdata.current.seekTo(Number(gettime), "seconds");
    // this.setState({ controlledPosition: { x, y } });
   
  };
  const dragHandlers = {
    onStart: onStart,
    onStop: onStop,
    onDrag: onControlledDrag,
  };
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
