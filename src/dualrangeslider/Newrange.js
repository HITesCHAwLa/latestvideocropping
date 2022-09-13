import Nouislider from "nouislider-react";
import React, { useEffect, useState } from "react";
import "./newrange.css";
import "nouislider/distribute/nouislider.css";
import { millisToMinutesAndSeconds } from "./timmer";
import { timechange } from "../timetomilisecond";
function Newrange({ start, end, setTimings, newchangeslide, refdata }) {
  const [timeduration, settimeduration] = useState({ start: start, end: end });
  const [changetime, setchangetime] = useState({ start: 0, end: 0 });

  useEffect(() => {
    settimeduration({ start: start, end: end });
  }, []);

  function getVals() {
    // Get slider values
    var parent = this.parentNode;
    var slides = parent.getElementsByTagName("input");
    var slide1 = parseFloat(slides[0].value);
    var slide2 = parseFloat(slides[1].value);
    // Neither slider will clip the other, so make sure we determine which is larger
    if (slide1 > slide2) {
      var tmp = slide2;
      slide2 = slide1;
      slide1 = tmp;
    }

    var displayElement = parent.getElementsByClassName("rangeValues")[0];
    displayElement.innerHTML = "$ " + slide1 + "k - $" + slide2 + "k";
  }
  window.onload = function () {
    // Initialize Sliders
    var sliderSections = document.getElementsByClassName("range-slider");
    for (var x = 0; x < sliderSections.length; x++) {
      var sliders = sliderSections[x].getElementsByTagName("input");
      for (var y = 0; y < sliders.length; y++) {
        if (sliders[y].type === "range") {
          sliders[y].oninput = getVals;
          // Manually trigger event first time to display values
          sliders[y].oninput();
        }
      }
    }
  };
  function changehandle(e) {
    if (e.target.name == "start") {
      const val = Math.min(Number(e.target.value), timeduration.end - 1000);
      settimeduration({
        ...timeduration,
        [e.target.name]: val,
      });
    }
    if (e.target.name == "end") {
      const val2 = Math.max(Number(e.target.value), timeduration.start + 1000);
      settimeduration({
        ...timeduration,
        [e.target.name]: val2,
      });
    }
    // settimeduration({
    //   ...timeduration,
    //   [e.target.name]: Number(e.target.value),
    // });

    setTimings([
      {
        start: Number(timeduration.start) / 1000,
        end: Number(timeduration.end) / 1000,
      },
    ]);
  }

  return !newchangeslide ? (
    <section className="range-slider">
      <span className="rangeValues" />
      <span className="start current-time">
        {millisToMinutesAndSeconds(timeduration.start)}
      </span>{" "}
      <div className="croparea">
        <input
          name="start"
          value={timeduration.start}
          // defaultValue={start}
          min={0}
          max={end}
          step={"100"}
          type="range"
          onChange={changehandle}
        />
        <input
          value={timeduration.end}
          name="end"
          // defaultValue={end}
          min={0}
          max={end}
          step={"100"}
          type="range"
          onChange={changehandle}
        />{" "}
      </div>
      <span className="end current-time">
        {millisToMinutesAndSeconds(timeduration.end)}
      </span>
    </section>
  ) : (
    <Nouislider
      range={{ min: timeduration.start, max: timeduration.end }}
      start={[Number(timeduration.start), Number(timeduration.end)]}
      connect
      step={500}
      format={{
        from: Number,
        to: function (value) {
          return millisToMinutesAndSeconds(value);
        },
      }}
      animate={true}
      tooltips={true}
      margin={1000}
      onChange={(e) => {
        refdata.current.seekTo(timechange(e[0]));
        setTimings([
          {
            start: timechange(e[0]),
            end: timechange(e[1]),
          },
        ]);
      }}
      onSlide={(e) => {}}
    />
  );
}

export default Newrange;
