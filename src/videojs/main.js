import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import { getVideoDimensionsOf } from "./getmetadata";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ReactPlayer from "react-player";
import ReactDOM from "react-dom/client";
import { MdHorizontalSplit, MdBorderVertical } from "react-icons/md";
import { BsClockHistory, BsFillClockFill } from "react-icons/bs";
import { BiInfoCircle } from "react-icons/bi";
import { CgDanger } from "react-icons/cg";
import Draggable from "react-draggable";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import Newrange from "../dualrangeslider/Newrange";

import {
  millisToMinutesAndSeconds,
  secondtomilisecond,
} from "../dualrangeslider/timmer";
import { formatSizeUnits, niceBytes } from "../bytetomb";
import Modaldemo from "../Modaldemo";
import { Alert, Button } from "react-bootstrap";
import { timechange } from "../timetomilisecond";
import Inputmask from "react-input-mask";
import InnerSlide from "./InnerSlide";

const HeaderMemo = React.memo(Newrange);
function Main() {
  const [timeformate, settimeformate] = useState({
    starttime: "",
    endtime: "",
  });
  const [starttime, setstarttime] = useState({
    S_start: 0,
    S_end: 0,
    E_start: 0,
    E_end: 0,
  });
  const [selectedfield, setselectedfield] = useState("S_end");
  const [selectedfield2, setselectedfield2] = useState("E_end");
  const S_start = useRef("");
  const S_end = useRef("");
  const E_start = useRef("");
  const E_end = useRef("");
  const [endtime, setendtime] = useState({
    start: timeformate.endtime.split(":")[0],
    end: timeformate.endtime.split(":")[1],
  });

  //Maximum 100MB Video Available For Upload
  const VideoMaxSize = 100000000;

  const [metadata, setMetadata] = useState();
  const [imagedata, setimagedata] = useState([]);
  const [slider, setslider] = useState(false);
  const [flag, setFlag] = useState(false);
  const input = useRef("");
  const ffmpeg = useRef(null);
  const [show, setShow] = useState(false);
  const [check, setcheck] = useState(false);
  const [ready, setReady] = React.useState(false);
  const ref = React.useRef("");
  const input2 = useRef("");
  const [filevalue, setfilevalue] = useState("");
  const [urldata, seturldata] = useState("");
  const [isPlaying, setisPlaying] = useState(false);
  const [timings, setTimings] = React.useState([
    {
      start: 0,
      end: 0,
    },
  ]);
  const firstinput = useRef("");
  const secondinput = useRef("");
  const [sliderpoints, setsliderpoints] = useState({
    start: 0,
    end: 0,
  });
  const [videoresolution, setvideoresolution] = useState({});
  const [forplaypause, setforplaypause] = useState({ start: null, end: null });
  const [errordata, setErrordata] = useState({
    title: "",
    body: "",
  });
  const [crop, setCrop] = React.useState({
    height: 100,
    unit: "%",
    width: 100,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    // if (check) {

    setstarttime({
      S_start:
        Number(timeformate.starttime.split(":")[0]) < 10
          ? `0${Number(timeformate.starttime.split(":")[0])}`
          : Number(timeformate.starttime.split(":")[0]),

      S_end:
        Number(timeformate.starttime.split(":")[1]) < 10
          ? `0${Number(timeformate.starttime.split(":")[1])}`
          : Number(timeformate.starttime.split(":")[1]),
      E_start:
        Number(timeformate.endtime.split(":")[0]) < 10
          ? `0${Number(timeformate.endtime.split(":")[0])}`
          : Number(timeformate.endtime.split(":")[0]),

      E_end:
        Number(timeformate.endtime.split(":")[1]) < 10
          ? `0${Number(timeformate.endtime.split(":")[1])}`
          : Number(timeformate.endtime.split(":")[1]),
    });
    // }
  }, [timeformate.starttime, timeformate.endtime]);

  async function uploadFile(file, e) {
    let urlfile = URL.createObjectURL(file[0]);
    if (e) {
      setfilevalue(e);
    }
    let data = await getVideoDimensionsOf(urlfile, file[0]);

    if (data.height > 1032 && data.width > 1920) {
      setErrordata({
        title: "Unable To Create Animation",
        body: `Not valid resolution your video resolution is ${data.width} X ${data.height}`,
      });
      setFlag(false);
      setcheck(true);
      setShow(true);
      seturldata("");
      return false;
    }
    // if (data.size > 4000000) {
    if (data.size > 100000000) {
      setErrordata({
        title: "Size Limit Reached",
        // body: `The Maximum video size allowed is 4 MB, your file is ${formatSizeUnits(
        body: `The Maximum video size allowed is 100 MB, your file is ${formatSizeUnits(
          data.size
        )} . Please try using a smaller sized video`,
      });
      setShow(true);
      setFlag(false);
      setcheck(true);
      seturldata("");
      return false;
    }
    if (Number(data.duration * 1000) > 20000) {
      setErrordata({
        title: "Unable To Create Animation",
        body: `video Length is  ${data.duration}s. Maximum allow 20s`,
      });
      setShow(true);
      setcheck(true);
      setFlag(false);
      seturldata("");
      return false;
    }
    if (Number(data.duration * 1000) < 1000) {
      setErrordata({
        title: "Unable To Create Animation",
        body: `video Length is  ${(data.duration / 1000).toFixed(
          3
        )} second. Minimum allow 1s`,
      });
      setShow(true);
      setcheck(true);
      setFlag(false);
      seturldata("");
      return false;
    }
    let imagedatas = await generateVideoThumbnails(file[0], 9);
    setimagedata(imagedatas);
    setvideoresolution({ width: data.width, height: data.height });

    setMetadata({ ...data, url: urlfile });
    setsliderpoints({
      start: secondtomilisecond(Number(data?.start)),
      end: secondtomilisecond(Number(data?.duration)),
    });
    settimeformate({
      starttime: toHHMMSS(Number(data.start)),
      endtime: toHHMMSS(Number(data.duration)),
    });
    setTimings([{ start: data.start, end: Number(data.duration) }]);

    setfilevalue("");
    setcheck(true);
    setShow(true);
  }

  const load = async () => {
    try {
      await ffmpeg.current.load();

      setReady(true);
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    try {
      ffmpeg.current = createFFmpeg({
        log: false,
        // corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
      });
    } catch (err) {
      throw err;
    }
    load();
  }, []);

  async function cropvideo(e) {
    e.target.innerText = "Loading....";
    e.target.setAttribute("disabled", "true");
    try {
      ffmpeg.current.FS(
        "writeFile",
        "myFile.mp4",
        await fetchFile(metadata?.url)
      );

      await ffmpeg.current.run(
        "-i",
        "myFile.mp4",
        "-ss",
        `${timings[0].start}`,
        "-t",
        `${timings[0].end - timings[0].start}`,
        "-vf",
        `crop=${(metadata.width * crop?.width) / 100}:${
          (metadata.height * crop?.height) / 100
        }:${(metadata.width * crop?.x) / 100}:${
          (metadata.height * crop?.y) / 100
        }`,
        "-strict",
        "-2",
        "output.mp4"
      );

      const data = ffmpeg.current.FS("readFile", "output.mp4");

      const newurl = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      e.target.innerText = "cut the video";
      e.target.removeAttribute("disabled");
      seturldata(newurl);
      setShow(false);

      setCrop({
        height: 100,
        unit: "%",
        width: 100,
        x: 0,
        y: 0,
      });
    } catch (err) {
      throw err;
    }
  }

  const [loadedtime, setloadedtime] = useState(0);
  const [slidenew, setslidenew] = useState(false);
  const [loadtimeforright, setloadtimeforright] = useState(100);
  var count = 0;

  function dynamicdata(playtime, duration) {
    let a = playtime * 100;
    let b = a / duration;
    setloadedtime(b);

    setslidenew(false);
    if (count > 0) {
      setslider(true);
    }
    count += 1;
  }
  function dynamicdataforrightslide(playtime) {
    let a = playtime * 100;
    let b = a / metadata.duration;
    setloadtimeforright(b);
    // setloadedtime(b);
    setslidenew(true);
    setslider(false);
  }

  const [value, setValue] = React.useState("0:00");
  const [value2, setValue2] = React.useState("0:00");
  const [preValue, setPrevValue] = React.useState("0:00");
  const [preValuev2, setPrevValue2] = React.useState("0:00");

  useEffect(() => {
    const time = toHHMMSS(timings?.[0]?.start);
    setValue(time);
  }, [timings?.[0]?.start]);

  useEffect(() => {
    const time2 = toHHMMSS(timings?.[0]?.end);
    setValue2(time2);
  }, [timings?.[0]?.end]);
  const onChange = (event) => {
    setValue((e) => {
      if (event.target.value > metadata.duration - 1) {
        setPrevValue(event.target.value);
        return e;
      }
      setPrevValue(e);

      return event.target.value;
    });
  };

  //#region
  function onwidth(valueofwidth) {
    if (valueofwidth >= metadata.width) {
      setvideoresolution((e) => {
        return {
          ...e,
          width: Number(metadata.width),
        };
      });
      setCrop((e) => {
        return {
          ...e,
          width: Number(
            ((Number(metadata.width) * 100) / metadata.width).toFixed(2)
          ),
        };
      });
      return false;
    }
    setvideoresolution((e) => {
      return {
        ...e,
        width: Number(valueofwidth),
      };
    });
    setCrop((e) => {
      return {
        ...e,
        width: Number(
          ((Number(valueofwidth) * 100) / metadata.width).toFixed(2)
        ),
      };
    });
  }
  function onheight(value) {
    if (value > metadata.height) {
      setvideoresolution((e) => {
        return {
          ...e,
          height: Number(metadata.height),
        };
      });
      setCrop((e) => {
        return {
          ...e,
          height: Number(
            ((Number(metadata.height) * 100) / metadata.height).toFixed(2)
          ),
        };
      });
      return false;
    }
    setvideoresolution((e) => {
      return {
        ...e,
        height: Number(value),
      };
    });
    setCrop((e) => {
      return {
        ...e,
        height: Number(((Number(value) * 100) / metadata.height).toFixed(2)),
      };
    });
  }
  //#endregion
  const onBlur = (event) => {
    if (
      Number(starttime.S_start) >= Number(starttime.E_start) &&
      Number(starttime.S_end) >= Number(starttime.E_end)
    ) {
      setstarttime({
        ...starttime,
        E_start:
          Number(timeformate.endtime.split(":")[0]) < 10
            ? `0${Number(timeformate.endtime.split(":")[0])}`
            : Number(timeformate.endtime.split(":")[0]),
        E_end:
          Number(timeformate.endtime.split(":")[1]) < 10
            ? `0${Number(timeformate.endtime.split(":")[1])}`
            : Number(timeformate.endtime.split(":")[1]),
      });

      setsliderpoints({
        ...sliderpoints,
        end:
          Number(timeformate.endtime.split(":")[1]) * 1000 +
          Number(timeformate.endtime.split(":")[0]) * 60 * 1000,
      });
      setTimings([
        {
          ...timings[0],
          end:
            Number(timeformate.endtime.split(":")[0]) * 60 +
            Number(timeformate.endtime.split(":")[1]),
        },
      ]);
    }
    // const value = event.target.value;
    // const seconds = Math.max(0, getSecondsFromHHMMSS(value));

    // if (
    //   seconds > metadata?.duration ||
    //   seconds >= getSecondsFromHHMMSS(value2)
    // ) {
    //   setValue(preValue);
    //   return false;
    // }

    // setsliderpoints((ert) => {
    //   return {
    //     ...ert,
    //     start: Number(seconds * 1000),
    //   };
    // });
    // setTimings([
    //   {
    //     start: Number(seconds),
    //     end: timings?.[0]?.end,
    //   },
    // ]);
    // dynamicdata(Number(seconds), metadata.duration);
    // ref.current.seekTo(Number(seconds), "seconds");

    // const time = toHHMMSS(seconds);
    // setValue(time);
  };

  const onChange2 = (event) => {
    setValue2((e) => {
      if (event.target.value > metadata.duration - 1) {
        setPrevValue2(event.target.value);
        return e;
      }
      setPrevValue2(e);

      return event.target.value;
    });
    // setValue2((e) => {
    //   setPrevValue2(e);

    //   return event.target.value;
    // });
  };

  const onBlur2 = (event) => {
    const val2 = event.target.value;
    const seconds = Math.max(0, getSecondsFromHHMMSS(val2));

    if (
      seconds > metadata?.duration ||
      seconds <= 0 ||
      seconds <= getSecondsFromHHMMSS(value)
    ) {
      setValue2(preValuev2);

      return false;
    }
    setsliderpoints({ ...sliderpoints, end: Number(seconds * 1000) });

    setTimings([{ ...timings[0], end: Number(val2) }]);

    const time = toHHMMSS(seconds);
    setValue2(time);
  };

  const getSecondsFromHHMMSS = (value) => {
    const [str1, str2, str3] = value.split(":");

    const val1 = Number(str1);
    const val2 = Number(str2);
    const val3 = Number(str3);

    if (!isNaN(val1) && isNaN(val2) && isNaN(val3)) {
      return val1;
    }

    if (!isNaN(val1) && !isNaN(val2) && isNaN(val3)) {
      return val1 * 60 + val2;
    }

    if (!isNaN(val1) && !isNaN(val2) && !isNaN(val3)) {
      return val1 * 60 * 60 + val2 * 60 + val3;
    }

    return 0;
  };

  const toHHMMSS = (secs) => {
    const secNum = parseInt(secs.toString(), 10);
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor(secNum / 60) % 60;
    const seconds = secNum % 60;

    return [hours, minutes, seconds]
      .map((val) => (val < 10 ? `0${val}` : val))
      .filter((val, index) => val !== "00" || index > 0)
      .join(":")
      .replace(/^0/, "");
  };
  function clickhandlechange(e) {
    input.current.focus();
    onChange({ target: { value: input.current.value } });

    setValue((ert) => {
      let abc = getSecondsFromHHMMSS(ert) + 1;
      return toHHMMSS(abc);
    });
  }
  function clickhandlechange2(e) {
    input.current.focus();
    // onChange({ target: { value: input.current.value } });
    setValue((ert) => {
      if (getSecondsFromHHMMSS(ert) === 0) {
        return toHHMMSS(getSecondsFromHHMMSS(ert));
      } else {
        let abc = getSecondsFromHHMMSS(ert) - 1;

        return toHHMMSS(abc);
      }
    });
  }
  function clickhandlechangeright() {
    if (selectedfield2 == "E_start") {
      E_start.current.stepDown();
      changearrowhandle({
        target: {
          value: E_start.current.value,
          name: E_start.current.name,
        },
      });
    }
    if (selectedfield2 == "E_end") {
      E_end.current.stepDown();
      changearrowhandle({
        target: {
          value: E_end.current.value,
          name: E_end.current.name,
        },
      });
    }
  }
  function changearrowhandle(e) {
    // console.log(
    //   "max:",
    //   e.target.max,
    //   "name:",
    //   e.target.name,
    //   "value:",
    //   e.target.value
    // );
    // dynamicdata(10 + e.target.value, metadata.duration);
    // for starting seconds --> check minute value
    // if start_minutes < than end_minutes
    // if start_minutes >= end_minutes

    // let abc =
    //   Number(e.target.value) <= 9
    //     ? `${Number(e.target.value)}`
    //     : Number(e.target.value);

    // if (e.target.name === "S_end") {
    //   if (Number(e.target.value) > 59) {
    //     setstarttime({
    //       ...starttime,
    //       S_end: 0,
    //       S_start:
    //         Number(starttime.S_start) <= 9
    //           ? `${Number(starttime.S_start) + 1}`
    //           : Number(starttime.S_start) + 1,
    //     });
    //     return false;
    //   }
    // }
    // setstarttime({ ...starttime, [e.target.name]: abc });
    // if (e.target.name.includes("S_")) {
    //   if (e.target.name === "S_start") {
    //     dynamicdata(
    //       Number(e.target.value) * 60 + Number(starttime.S_end),
    //       metadata.duration
    //     );
    //     if (Number(e.target.value) > Number(starttime.E_start)) {
    //       setstarttime({ ...starttime, S_start: 0 });
    //       setsliderpoints({
    //         ...sliderpoints,
    //         start: Number("0") * 60 * 1000 + Number(starttime.S_end),
    //       });
    //       return false;
    //     }

    //     setsliderpoints({
    //       ...sliderpoints,
    //       start: Number(e.target.value) * 60 * 1000 + Number(starttime.S_end),
    //     });
    //     setTimings([
    //       {
    //         ...timings[0],
    //         start: Number(starttime.S_end) + Number(e.target.value) * 60,
    //       },
    //     ]);
    //   }
    //   if (e.target.name === "S_end") {
    //     dynamicdata(
    //       Number(e.target.value) + Number(starttime.S_start) * 60,
    //       metadata.duration
    //     );
    //     setsliderpoints({
    //       ...sliderpoints,
    //       start:
    //         Number(e.target.value) * 1000 +
    //         Number(starttime.S_start) * 60 * 1000,
    //     });
    //     setTimings([
    //       {
    //         ...timings[0],
    //         start: Number(starttime.S_start) * 60 + Number(e.target.value),
    //       },
    //     ]);
    //   }
    // }
    // if (e.target.name.includes("E_")) {
    //   if (e.target.name === "E_start") {
    //     setsliderpoints({
    //       ...sliderpoints,
    //       end: Number(e.target.value) * 60 * 1000 + Number(starttime.E_end),
    //     });
    //     setTimings([
    //       {
    //         ...timings[0],
    //         end: Number(starttime.E_end) + Number(e.target.value) * 60,
    //       },
    //     ]);
    //   }
    //   if (e.target.name === "E_end") {
    //     setsliderpoints({
    //       ...sliderpoints,
    //       end:
    //         Number(e.target.value) * 1000 +
    //         Number(starttime.E_start) * 60 * 1000,
    //     });
    //     setTimings([
    //       {
    //         ...timings[0],
    //         end: Number(starttime.E_start) * 60 + Number(e.target.value),
    //       },
    //     ]);
    //   }
    //   // setsliderpoints({
    //   //   ...sliderpoints,
    //   //   end: Number() + Number(e.target.value) * 1000,
    //   // });
    // }
    // setsliderpoints({
    //   ...sliderpoints,
    //   start: Number() + Number(e.target.value) * 1000,
    // });

    switch (e.target.name) {
      case "S_start":
        if (Number(e.target.value) <= Number(starttime.E_start)) {
          if (Number(e.target.value) === Number(starttime.E_start)) {
            let start_s_end;
            if (Number(starttime.S_end) < Number(starttime.E_end)) {
              if (Number(starttime.S_end) < 10) {
                start_s_end = `0${Number(starttime.S_end)}`;
              } else {
                start_s_end = Number(starttime.S_end);
              }
            } else {
              if (Number(starttime.S_end) < 10) {
                start_s_end = `0${Number(starttime.E_end) - 1}`;
              } else {
                start_s_end = Number(starttime.E_end) - 1;
              }
            }

            setstarttime({
              ...starttime,
              S_end: start_s_end,
              S_start:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });
            //#region for slider change
            dynamicdata(
              Number(e.target.value) * 60 + Number(start_s_end),
              metadata.duration
            );
            setsliderpoints({
              ...sliderpoints,
              start:
                Number(e.target.value) * 60 * 1000 + Number(start_s_end) * 1000,
            });
            setTimings([
              {
                ...timings[0],
                start: start_s_end + Number(e.target.value) * 60,
              },
            ]);
            //#endregion
          } else {
            setstarttime({
              ...starttime,
              S_start:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });
            //#region for slider change

            setsliderpoints({
              ...sliderpoints,
              start:
                Number(e.target.value) * 60 * 1000 +
                Number(starttime.S_end) * 1000,
            });
            setTimings([
              {
                ...timings[0],
                start: Number(starttime.S_end) + Number(e.target.value) * 60,
              },
            ]);
            dynamicdata(
              Number(e.target.value) * 60 + Number(starttime.S_end),
              metadata.duration
            );
            //#endregion
          }

          //#region for slider change
          // dynamicdata(
          //   Number(e.target.value) * 60 + Number(starttime.S_end),
          //   metadata.duration
          // );
          // setsliderpoints({
          //   ...sliderpoints,
          //   start: Number(e.target.value) * 60 * 1000 + Number(starttime.S_end),
          // });
          // setTimings([
          //   {
          //     ...timings[0],
          //     start: Number(starttime.S_end) + Number(e.target.value) * 60,
          //   },
          // ]);
          //#endregion
        } else {
          setstarttime({
            ...starttime,
            S_start:
              Number(starttime.E_start) < 10
                ? `0${Number(starttime.E_start)}`
                : `${Number(starttime.E_start)}`,
          });
          //#region for slider change
          dynamicdata(
            Number(starttime.E_start) * 60 + Number(starttime.S_end),
            metadata.duration
          );
          setsliderpoints({
            ...sliderpoints,
            start:
              Number(starttime.E_start) * 60 * 1000 + Number(starttime.S_end),
          });
          setTimings([
            {
              ...timings[0],
              start: Number(starttime.S_end) + Number(starttime.E_start) * 60,
            },
          ]);
          //#endregion
        }

        return true;

      case "S_end":
        if (starttime.S_start < starttime.E_start) {
          if (Number(e.target.value <= 59)) {
            setstarttime({
              ...starttime,
              S_end:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });

            //#region for slider change
            dynamicdata(
              Number(e.target.value) + Number(starttime.S_start) * 60,
              metadata.duration
            );
            setsliderpoints({
              ...sliderpoints,
              start:
                Number(e.target.value) * 1000 +
                Number(starttime.S_start) * 60 * 1000,
            });
            setTimings([
              {
                ...timings[0],
                start: Number(starttime.S_start) * 60 + Number(e.target.value),
              },
            ]);
            //#endregion
          } else {
          }
        } else {
          if (Number(e.target.value) <= Number(starttime.E_end) - 1) {
            setstarttime({
              ...starttime,
              S_end:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });
            //#region for slider change
            dynamicdata(
              Number(e.target.value) + Number(starttime.S_start) * 60,
              metadata.duration
            );

            setsliderpoints({
              ...sliderpoints,
              start:
                Number(e.target.value) * 1000 +
                Number(starttime.S_start) * 60 * 1000,
            });
            setTimings([
              {
                ...timings[0],
                start: Number(starttime.S_start) * 60 + Number(e.target.value),
              },
            ]);
            //#endregion
          } else {
            setstarttime({
              ...starttime,
              S_end:
                Number(starttime.E_end) - 1 < 10
                  ? `0${Number(starttime.E_end) - 1}`
                  : `${Number(starttime.E_end) - 1}`,
            });
            //#region for slider change
            dynamicdata(
              Number(starttime.E_end) - 1 + Number(starttime.S_start) * 60,
              metadata.duration
            );
            setsliderpoints({
              ...sliderpoints,
              start:
                (Number(starttime.E_end) - 1) * 1000 +
                Number(starttime.S_start) * 60 * 1000,
            });
            setTimings([
              {
                ...timings[0],
                start:
                  Number(starttime.S_start) * 60 + Number(starttime.E_end) - 1,
              },
            ]);
            //#endregion
          }
        }
        return true;

      case "E_start":
        // if (e.target.value < starttime.S_start) {
        //   setstarttime({
        //     ...starttime,
        //     E_start:
        //       Number(starttime.S_end) + 1 > 59
        //         ? Number(starttime.S_start) + 1 < 10
        //           ? `0${Number(starttime.S_start) + 1}`
        //           : Number(starttime.S_start) + 1
        //         : Number(starttime.S_start) < 10
        //         ? `0${Number(starttime.S_start)}`
        //         : Number(starttime.S_start),
        //     E_end:
        //       Number(starttime.S_end) + 1 > 59
        //         ? "00"
        //         : Number(starttime.S_end) + 1 < 10
        //         ? `0${Number(starttime.S_end) + 1}`
        //         : Number(starttime.S_end) + 1,
        //   });
        //   // return false;
        // }
        // if (
        //   Number(e.target.value) === Number(starttime.S_start) &&
        //   Number(starttime.S_end) === Number(starttime.E_end)
        // ) {
        //   alert("same");
        //   setstarttime({
        //     ...starttime,
        //     E_end:
        //       Number(starttime.S_end) + 1 < 10
        //         ? `0${Number(starttime.S_end) + 1}`
        //         : Number(starttime.S_end) + 1,
        //   });
        // }
        if (e.target.value <= Math.floor(metadata?.duration / 60)) {
          if (Number(e.target.value) === Math.floor(metadata?.duration / 60)) {
            if (Number(e.target.value) > Number(starttime.S_start)) {
              setstarttime({
                ...starttime,
                E_start:
                  Number(e.target.value) < 10
                    ? `0${Number(e.target.value)}`
                    : `${Number(e.target.value)}`,
              });
              setsliderpoints({
                ...sliderpoints,
                end:
                  Number(e.target.value) * 60 * 1000 +
                  Number(starttime.E_end) * 1000,
              });
              setTimings([
                {
                  ...timings[0],
                  end: Number(starttime.E_end) + Number(e.target.value) * 60,
                },
              ]);
            } else {
            }

            setstarttime({
              ...starttime,
              E_end:
                Number(starttime?.E_end) >
                Number(timeformate.endtime.split(":")[1])
                  ? Number(timeformate.endtime.split(":")[1]) < 10
                    ? `0${Number(timeformate.endtime.split(":")[1])}`
                    : Number(timeformate.endtime.split(":")[1])
                  : Number(starttime?.E_end) < 10
                  ? `0${Number(starttime?.E_end)}`
                  : Number(starttime?.E_end),
              E_start:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });
          } else {
            if (Number(e.target.value) >= Number(starttime.S_start)) {
              if (Number(e.target.value) > Number(starttime.S_start)) {
              } else if (Number(e.target.value) === Number(starttime.S_start)) {
              } else {
              }
              setstarttime({
                ...starttime,
                E_start:
                  Number(e.target.value) < 10
                    ? `0${Number(e.target.value)}`
                    : `${Number(e.target.value)}`,
              });
              setsliderpoints({
                ...sliderpoints,
                end:
                  Number(e.target.value) * 60 * 1000 +
                  Number(starttime.E_end) * 1000,
              });
              setTimings([
                {
                  ...timings[0],
                  end: Number(starttime.E_end) + Number(e.target.value) * 60,
                },
              ]);
            } else {
              setstarttime({
                ...starttime,
                E_end:
                  Number(Number(starttime.S_end) + 1) < 10
                    ? `0${Number(starttime.S_end) + 1}`
                    : `${Number(starttime.S_end) + 1}`,
                E_start:
                  Number(starttime.S_start) < 10
                    ? `0${Number(starttime.S_start)}`
                    : `${Number(starttime.S_start)}`,
              });
              //#region
              setsliderpoints({
                ...sliderpoints,
                end:
                  Number(starttime.S_start) * 60 * 1000 +
                  Number(starttime.E_end) * 1000,
              });
              setTimings([
                {
                  ...timings[0],
                  end: Number(starttime.E_end) + Number(starttime.S_start) * 60,
                },
              ]);
              //#endregion
            }
          }
        }
        return true;

      case "E_end":
        // #region  newADDED for S_end
        // newADDED
        // if (
        //   Number(starttime.S_start) === Number(starttime.E_start) &&
        //   Number(e.target.value) < Number(starttime.S_end) + 1
        // ) {
        //   setstarttime((old) => {
        //     return {
        //       ...old,
        //       E_end:
        //         Number(starttime.S_end) + 1 < 10
        //           ? `0${Number(starttime.S_end) + 1}`
        //           : Number(starttime.S_end) + 1,
        //     };
        //   });
        //   setsliderpoints({
        //     ...sliderpoints,
        //     end:
        //       Number(Number(starttime.S_end) + 1) * 1000 +
        //       Number(starttime.E_start) * 60 * 1000,
        //   });
        //   setTimings([
        //     {
        //       ...timings[0],
        //       end:
        //         Number(starttime.E_start) * 60 +
        //         Number(Number(starttime.S_end) + 1),
        //     },
        //   ]);
        //   return false;
        // }
        //#endregion

        if (Number(starttime.E_start) === Math.floor(metadata.duration / 60)) {
          if (
            Number(e.target.value) <= Number(timeformate.endtime.split(":")[1])
          ) {
            setstarttime({
              ...starttime,
              E_end:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });
            setsliderpoints({
              ...sliderpoints,
              end:
                Number(e.target.value) * 1000 +
                Number(starttime.E_start) * 60 * 1000,
            });
            setTimings([
              {
                ...timings[0],
                end: Number(starttime.E_start) * 60 + Number(e.target.value),
              },
            ]);
          } else {
            setstarttime({
              ...starttime,
              E_end:
                Number(timeformate.endtime.split(":")[1]) < 10
                  ? `0${Number(timeformate.endtime.split(":")[1])}`
                  : `${Number(timeformate.endtime.split(":")[1])}`,
            });
            setsliderpoints({
              ...sliderpoints,
              end:
                Number(timeformate.endtime.split(":")[1]) * 1000 +
                Number(starttime.E_start) * 60 * 1000,
            });
            setTimings([
              {
                ...timings[0],
                end:
                  Number(starttime.E_start) * 60 +
                  Number(timeformate.endtime.split(":")[1]),
              },
            ]);
          }
        }

        // minimum minutes -- starttime.minute and minimum sec--- startime.sec + 1
        // if (starttime?.S_start === starttime.E_start) {
        //   if (Number(e.target.value <= starttime?.E_end + 1)) {
        //     setstarttime({
        //       ...starttime,
        //       E_end:
        //         Number(e.target.value) < 10
        //           ? `0${Number(e.target.value)}`
        //           : `${Number(e.target.value)}`,
        //     });
        //   } else {
        //     setstarttime({
        //       ...starttime,
        //       E_end:
        //         Number(starttime?.E_end + 1) < 10
        //           ? `0${Number(starttime?.E_end + 1)}`
        //           : `${Number(starttime?.E_end + 1)}`,
        //     });
        //   }
        // }
        //

        if (starttime.E_start < Math.floor(metadata.duration / 60)) {
          if (starttime.E_start === starttime.S_start) {
            if (
              Number(e.target.value) > Number(starttime.S_end) &&
              Number(e.target.value) <= 59
            ) {
              setstarttime({
                ...starttime,
                E_end:
                  Number(e.target.value) < 10
                    ? `0${Number(e.target.value)}`
                    : `${Number(e.target.value)}`,
              });
              setsliderpoints({
                ...sliderpoints,
                end:
                  Number(e.target.value) * 1000 +
                  Number(starttime.E_start) * 60 * 1000,
              });
              setTimings([
                {
                  ...timings[0],
                  end: Number(starttime.E_start) * 60 + Number(e.target.value),
                },
              ]);
            } else {
            }
          }
          if (Number(e.target.value) <= 59) {
            if (Number(e.target.value) <= Number(starttime.S_end)) {
            }
            setstarttime({
              ...starttime,
              E_end:
                Number(e.target.value) < 10
                  ? `0${Number(e.target.value)}`
                  : `${Number(e.target.value)}`,
            });
            setsliderpoints({
              ...sliderpoints,
              end:
                Number(e.target.value) * 1000 +
                Number(starttime.E_start) * 60 * 1000,
            });
            setTimings([
              {
                ...timings[0],
                end: Number(starttime.E_start) * 60 + Number(e.target.value),
              },
            ]);
          } else {
          }
        }
        return true;

      default:
        return true;
    }
  }

  function Blur() {
    if (
      Number(starttime.S_start) * 60 + Number(starttime.S_end) <
      Number(timeformate.endtime.split(":")[0]) * 60 +
        Number(timeformate.endtime.split(":")[1])
    ) {
      setstarttime({
        ...starttime,
        S_end: starttime.S_end,
        S_start: starttime.S_start,
      });
      //#region for slider change
      dynamicdata(
        Number(starttime.S_start) * 60 + Number(starttime.S_end),
        metadata.duration
      );
      setsliderpoints({
        ...sliderpoints,
        start:
          Number(starttime.S_start) * 60 * 1000 +
          Number(starttime.S_end) * 1000,
      });
      setTimings([
        {
          ...timings[0],
          start: Number(starttime.S_end) + Number(starttime.S_start) * 60,
        },
      ]);
    } else {
      //     S_start:
      //     Number(timeformate.starttime.split(":")[0]) < 10
      //       ? `0${Number(timeformate.starttime.split(":")[0])}`
      //       : Number(timeformate.starttime.split(":")[0]),

      //   S_end:
      //     Number(timeformate.starttime.split(":")[1]) < 10
      //       ? `0${Number(timeformate.starttime.split(":")[1])}`
      //       : Number(timeformate.starttime.split(":")[1]),
      //   E_start:
      //     Number(timeformate.endtime.split(":")[0]) < 10
      //       ? `0${Number(timeformate.endtime.split(":")[0])}`
      //       : Number(timeformate.endtime.split(":")[0]),

      //   E_end:
      //     Number(timeformate.endtime.split(":")[1]) < 10
      //       ? `0${Number(timeformate.endtime.split(":")[1])}`
      //       : Number(timeformate.endtime.split(":")[1]),
      // });

      let timeinformate = toHHMMSS(timings[0].start);

      setstarttime((pre) => {
        return {
          ...pre,
          S_start:
            Number(timeinformate.split(":")[0]) < 10
              ? `0${Number(timeinformate.split(":")[0])}`
              : Number(timeinformate.split(":")[0]),

          S_end:
            Number(timeinformate.split(":")[1]) < 10
              ? `0${Number(timeinformate.split(":")[1])}`
              : Number(timeinformate.split(":")[1]),
        };
      });
      dynamicdata(
        Number(timeinformate.split(":")[0]) * 60 +
          Number(timeinformate.split(":")[1]),
        metadata.duration
      );
      setsliderpoints({
        ...sliderpoints,
        start:
          Number(timeinformate.split(":")[0]) * 60 * 1000 +
          Number(timeinformate.split(":")[1]) * 1000,
      });
      setTimings([
        {
          ...timings[0],
          start:
            Number(timeinformate.split(":")[1]) +
            Number(timeinformate.split(":")[0]) * 60,
        },
      ]);
    }
  }
  function Blur2() {
    if (
      Number(starttime.E_start) * 60 + Number(starttime.E_end) <
        Number(metadata.duration) &&
      Number(starttime.E_start) * 60 + Number(starttime.E_end) >
        Number(starttime.S_start) * 60 + Number(starttime.S_end)
    ) {
      setstarttime({
        ...starttime,
        E_end: starttime.E_end,
        E_start: starttime.E_start,
      });

      setsliderpoints({
        ...sliderpoints,
        end:
          Number(starttime.E_start) * 60 * 1000 +
          Number(starttime.E_end) * 1000,
      });
      setTimings([
        {
          ...timings[0],
          end: Number(starttime.E_end) + Number(starttime.E_start) * 60,
        },
      ]);
    } else {
      let timeinformateend = toHHMMSS(timings[0].end);
      setstarttime((pre) => {
        return {
          ...pre,
          E_start:
            Number(timeinformateend.split(":")[0]) < 10
              ? `0${Number(timeinformateend.split(":")[0])}`
              : Number(timeinformateend.split(":")[0]),

          E_end:
            Number(timeinformateend.split(":")[1]) < 10
              ? `0${Number(timeinformateend.split(":")[1])}`
              : Number(timeinformateend.split(":")[1]),
        };
      });
      setsliderpoints({
        ...sliderpoints,
        end:
          Number(timeinformateend.split(":")[0]) * 60 * 1000 +
          Number(timeinformateend.split(":")[1]) * 1000,
      });
      setTimings([
        {
          ...timings[0],
          end:
            Number(timeinformateend.split(":")[1]) +
            Number(timeinformateend.split(":")[0]) * 60,
        },
      ]);
    }
  }

  let counteffect = 0;
  function handlechange(e) {
    console.log(e.target.value);
    ref.current.seekTo(Number(e.target.value) / 1000);
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
  const first = useRef(null);
  const [Dragposition, setDragposition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (check) {
      first.current = document.getElementsByClassName("noUi-connect")[0];
    }
  }, [check]);

  const onControlledDrag = (e, position) => {
    // if (
    //   sliderpoints.start / 1000 <
    //     millisToMinutesAndSeconds(
    //       ((loadtimeforright * metadata.duration) / 100) * 1000
    //     ) &&
    //   sliderpoints.start / 1000 <
    //     millisToMinutesAndSeconds(
    //       ((loadedtime * metadata.duration) / 100) * 1000
    //     )
    // ) {
    //   console.log("hello");
    // }
    const abc = first.current.style.transform;
    // Object.values(abc);
    let xyz = abc.split(" ")[0].split("(")[1].split(",")[0].replace("%", "");

    let widthoffram = (first?.current.clientWidth * Number(xyz)) / 100;

    const { x, y } = position;
    setDragposition({ x, y });
    let xpercentage = x * 100;
    let gettotalpercentage = (xpercentage / first?.current.clientWidth).toFixed(
      2
    );

    let gettime = ((metadata.duration * gettotalpercentage) / 100).toFixed(2);

    if (
      Number(gettime) * 1000 >= sliderpoints.end ||
      Number(gettime) * 1000 <= sliderpoints.start
    ) {
      // setDragposition({ ...Dragposition, x: 256.75710227272725 });
      return false;
    }
    ref.current.seekTo(Number(gettime), "seconds");
    // // this.setState({ controlledPosition: { x, y } });
    // console.log(gettime, "EVENT");
  };
  const DRAG = useRef(null);
  const dragHandlers = {
    onStart: onStart,
    onStop: onStop,
    onDrag: onControlledDrag,
  };
  // useEffect(() => {
  //   if (first.current) {
  //     first.current.addEventListener("click", (e) => {
  //       setDragposition({ ...Dragposition, x: e.layerX });
  //       let xpercentage = e.layerX.toFixed(2) * 100;
  //       let gettotalpercentage = (
  //         xpercentage / first?.current.clientWidth
  //       ).toFixed(2);

  //       let gettime = ((metadata.duration * gettotalpercentage) / 100).toFixed(
  //         2
  //       );
  //       ref.current.seekTo(Number(gettime), "seconds");
  //       // const abc = document.getElementsByClassName("box")[0];
  //       // abc.style.transform = `translate(${e.layerX}px, 0px)`;
  //     });
  //   }
  // }, [first.current]);

  // useEffect(() => {
  //   if (check || sliderpoints.end != 0) {
  //     if (check) {
  //       let abc = document.getElementsByClassName("noUi-connect")[0];
  //       const root = ReactDOM.createRoot(abc);
  //       root.render(
  //         <InnerSlide
  //           min={sliderpoints.start}
  //           max={sliderpoints.end}
  //           refdata={ref}
  //           isPlaying={isPlaying}
  //           totalwidth={abc.clientWidth}
  //           duration={metadata.duration}
  //           setslider={setslider}
  //         />
  //       );
  //       //#region For change using click
  //       // document
  //       //   .getElementsByClassName("noUi-connect")[0]
  //       //   .addEventListener("click", (e) => {
  //       //     console.log(e.layerX);
  //       //     // transform: translate(0px, 0px);
  //       //     const abc = document.getElementsByClassName("box")[0];
  //       //     abc.style.transform = `translate(${e.layerX}px, 0px)`;
  //       //   });
  //       //#endregion
  //     }
  //   }

  //   //   let abc = document.getElementsByClassName("noUi-connect")[0];
  //   //   console.log(abc, "abc");

  //   //   // ✅ Set Attributes on Element
  //   //   el.setAttribute("type", "range");
  //   //   el.setAttribute("style", "width:100%");
  //   //   el.setAttribute("min", Number(metadata.start) * 1000);
  //   //   el.setAttribute("max", Number(metadata.duration) * 1000);
  //   //   el.addEventListener("input", handlechange);
  //   //   // el.setAttribute("disabled", "");
  //   //   abc.append(el);
  //   //   console.log(timings[0], metadata);
  //   // }
  //   // el.setAttribute("min", Number(sliderpoints.start));
  //   // el.setAttribute("max", Number(sliderpoints.end));
  // }, [check, sliderpoints.start, sliderpoints.end]);
  // const onStart = () => {
  //   console.log("e");
  //   setActiveDrags(activeDrags + 1);
  // };

  // const onStop = () => {
  //   setActiveDrags(activeDrags - 1);
  // };
  // const dragHandlers = {
  //   onStart: onStart,
  //   onStop: onStop,
  //   onDrag: onControlledDrag,
  // };
  // console.log(isPlaying, "isPlaying");
  // if (first.current) {
  //   first.current.addEventListener("click", (e) => {
  //     console.log(e.layerX);
  //     setDragposition({ ...Dragposition, x: e.layerX });
  //     // const abc = document.getElementsByClassName("box")[0];
  //     // abc.style.transform = `translate(${e.layerX}px, 0px)`;
  //   });
  // }
  useEffect(() => {
    if (check) {
      if (
        Number(loadtimeforright).toFixed(2) - Number(loadedtime).toFixed(2) <
        1
      ) {
        DRAG.current.style.transform = `translate(${
          (first?.current?.clientWidth * Number(loadtimeforright).toFixed(2)) /
          100
        }px, 0px) `;
        setDragposition({
          ...Dragposition,
          x:
            (first?.current?.clientWidth *
              Number(loadtimeforright).toFixed(2)) /
            100,
        });
      } else {
        DRAG.current.style.transform = `translate(${
          (first?.current?.clientWidth * loadedtime) / 100
        }px, 0px) `;
        setDragposition({
          ...Dragposition,
          x: (first?.current?.clientWidth * loadedtime) / 100,
        });
      }
    }
  }, [check, loadedtime, loadtimeforright]);
  console.log(Dragposition, "Dragposition");
  return (
    ready && (
      <div className="video-main-box">
        <div className="video-box">
          {!check || urldata === "" ? (
            <div className="choose-video">
              {" "}
              <input
                type="file"
                className="hidden"
                id="up_file"
                accept=".3g2,.3gp,.aaf,.asf,.avi,.cavs,.dv,.f4v,.flv,.ivf,.m2ts,.m2v,.m4v,.mkv,.mod,.mov,.mp4,.mpeg,.mpg,.mts,.mxf,.ogv,.qt,.rm,.rmvb,.tod,.ts,.vob,.webm,.wmv,.wtv"
                value={filevalue}
                onChange={(e) => uploadFile(e.target.files, e.target.value, e)}
              />
              <FileDrop
                onDrop={(e) => {
                  uploadFile(e);
                }}
                onTargetClick={() => document.getElementById("up_file").click()}
              >
                Click or drop your video here to edit!
              </FileDrop>
            </div>
          ) : urldata !== "" ? (
            <video
              width="100%"
              height="100%"
              src={urldata}
              controls
              style={{ marginTop: "80px" }}
              onProgress={(e) => {}}
            ></video>
          ) : (
            ""
          )}
          {check && (
            <>
              <Modaldemo
                videoref={ref}
                check={check}
                clickhandle={cropvideo}
                setcheck={setcheck}
                show={show}
                setShow={setShow}
                setslider={setslider}
                seturldata={seturldata}
                setCrop={setCrop}
                setErrordata={setErrordata}
                errordata={errordata}
                timingscheck={timings}
                setisPlaying={setisPlaying}
                isPlaying={isPlaying}
              >
                {errordata.title === "" ? (
                  <>
                    <ReactCrop
                      crop={crop}
                      onChange={(c, percentCrop) => {
                        setCrop(percentCrop);

                        setvideoresolution({
                          width: Math.round(
                            (metadata.width * percentCrop.width) / 100
                          ),
                          height: Math.round(
                            (metadata.height * percentCrop.height) / 100
                          ),
                        });
                      }}
                      minHeight={100}
                      minWidth={100}
                      // maxHeight={460}
                      maxHeight={"100%"}
                      maxWidth={"100%"}
                      keepSelection={true}
                    >
                      <ReactPlayer
                        // css={{
                        //   position: `absolute`,
                        //   top: 0,
                        //   left: 0,
                        // }}

                        ref={ref}
                        id="videoid"
                        url={metadata?.url}
                        playing={isPlaying}
                        className="react-player"
                        progressInterval={30}
                        width={"100%"}
                        height={"100%"}
                        controls={false}
                        onDuration={(e) => {}}
                        onClickPreview={(ok) => {}}
                        onProgress={(e) => {
                          if (e.playedSeconds === e.loadedSeconds) {
                            setisPlaying(false);
                            setslider(false);
                            ref.current.seekTo(timings[0].start, "seconds");
                          }

                          if (e.playedSeconds.toFixed(2) >= timings[0].end) {
                            setisPlaying(false);
                            setslider(false);
                            ref.current.seekTo(timings[0].start, "seconds");
                          }

                          dynamicdata(
                            e.playedSeconds.toFixed(2),
                            e.loadedSeconds
                          );

                          // setPlaypausetime({
                          //   end: e.loadedSeconds,
                          //   start: e.playedSeconds,
                          // });
                          // setTimings([
                          //   {
                          //     end: e.loadedSeconds,
                          //     start: e.playedSeconds,
                          //   },
                          // ]);
                        }}
                      />
                    </ReactCrop>
                    {/* starttime endtime */}

                    <div className="videoframe-slider-box">
                      <div className="frame-content">
                        <div className="max-width frame">
                          MAX <b>1920</b> &nbsp;{" "}
                          <span className="icon">
                            <img
                              src="/Width_Icon.png"
                              alt=""
                              className="width"
                            />
                            {/* <MdHorizontalSplit /> */}
                          </span>
                          <span
                            className="input-box"
                            style={{ display: "flex" }}
                          >
                            <input
                              type="number"
                              name=""
                              id=""
                              min={100}
                              className="form-control icontrol"
                              value={videoresolution?.width}
                              max={
                                metadata?.width -
                                (metadata?.width * crop.x) / 100
                              }
                              ref={firstinput}
                              onChange={(ert) => {
                                onwidth(ert.target.value);
                              }}
                            />
                            <div
                              className="num-arrows"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                width={15}
                                onClick={(e) => {
                                  firstinput.current.stepUp();
                                  firstinput.current.focus();
                                  onwidth(firstinput.current.value);
                                }}
                                height={15}
                                viewBox="-2 -4 10 10"
                                fill="none"
                                stroke="#354d74"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  name="up"
                                  d="M4.2506 0.333496C4.1256 0.166829 3.8756 0.166829 3.7506 0.333496L0.625604 4.50016C0.471095 4.70617 0.618089 5.00016 0.875603 5.00016L7.1256 5.00016C7.38312 5.00016 7.53011 4.70617 7.3756 4.50016L4.2506 0.333496Z"
                                  fill="#f0b354"
                                />
                              </svg>

                              <svg
                                width={15}
                                onClick={() => {
                                  firstinput.current.stepDown();
                                  firstinput.current.focus();
                                  onwidth(firstinput.current.value);
                                  // firstinput.current.dispatchEvent(
                                  //   new Event("change")
                                  // );
                                }}
                                height={15}
                                viewBox="-2 9 10 10"
                                fill="none"
                                stroke="#354d74"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  name="down"
                                  d="M3.74947 14.6668C3.87447 14.8335 4.12447 14.8335 4.24947 14.6668L7.37447 10.5002C7.52898 10.2942 7.38198 10.0002 7.12447 10.0002H0.874469C0.616954 10.0002 0.46996 10.2942 0.624469 10.5002L3.74947 14.6668Z"
                                  fill="#f0b354"
                                />
                              </svg>
                            </div>
                          </span>
                        </div>
                        <span className="xe"> &nbsp; X &nbsp; </span>
                        <div className="max-height frame">
                          <span
                            className="input-box"
                            style={{ display: "flex" }}
                          >
                            <input
                              type="number"
                              ref={secondinput}
                              name=""
                              id=""
                              value={videoresolution?.height}
                              max={
                                metadata?.height -
                                (metadata?.height * crop.y) / 100
                              }
                              onChange={(ert) => {
                                onheight(ert.target.value);
                              }}
                              min={100}
                              className="form-control icontrol"
                            />
                            <div
                              className="num-arrows"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                stroke="#354d74"
                                width={15}
                                onClick={() => {
                                  secondinput.current.stepUp();
                                  secondinput.current.focus();
                                  onheight(secondinput.current.value);
                                }}
                                height={15}
                                viewBox="-2 -4 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  name="up"
                                  d="M4.2506 0.333496C4.1256 0.166829 3.8756 0.166829 3.7506 0.333496L0.625604 4.50016C0.471095 4.70617 0.618089 5.00016 0.875603 5.00016L7.1256 5.00016C7.38312 5.00016 7.53011 4.70617 7.3756 4.50016L4.2506 0.333496Z"
                                  fill="#f0b354"
                                />
                              </svg>
                              <svg
                                stroke="#354d74"
                                width={15}
                                onClick={() => {
                                  secondinput.current.stepDown();
                                  secondinput.current.focus();
                                  onheight(secondinput.current.value);
                                }}
                                height={15}
                                viewBox="-2 9 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  name="down"
                                  d="M3.74947 14.6668C3.87447 14.8335 4.12447 14.8335 4.24947 14.6668L7.37447 10.5002C7.52898 10.2942 7.38198 10.0002 7.12447 10.0002H0.874469C0.616954 10.0002 0.46996 10.2942 0.624469 10.5002L3.74947 14.6668Z"
                                  fill="#f0b354"
                                />
                              </svg>
                            </div>
                          </span>
                          <span className="icon">
                            {" "}
                            <img
                              src="/Height_Icon.png"
                              alt=""
                              className="height"
                            />
                            {/* <MdBorderVertical /> */}
                          </span>{" "}
                          <b>1080</b> MAX{" "}
                          <span
                            className="icon info"
                            style={{ fontSize: "17px" }}
                          >
                            {" "}
                            <BiInfoCircle />
                          </span>
                        </div>
                      </div>
                      <div className="video-frame-box">
                        <div className="video-frame">
                          {imagedata.map((e) => {
                            return <img src={e} alt="" />;
                          })}
                          <div className="video-slider">
                            <HeaderMemo
                              start={secondtomilisecond(Number(metadata.start))}
                              end={secondtomilisecond(
                                Number(metadata.duration)
                              )}
                              timings={timings}
                              refdata={ref}
                              setTimings={setTimings}
                              newchangeslide
                              setforplaypause={setforplaypause}
                              playpausetimevideo={forplaypause}
                              dynamicdata={dynamicdata}
                              videoduration={metadata.duration}
                              setslider={setslider}
                              slider={slider}
                              dynamicdataforrightslide={
                                dynamicdataforrightslide
                              }
                              settimeformate={settimeformate}
                              toHHMMSS={toHHMMSS}
                              setslidenew={setslidenew}
                              sliderpoints={sliderpoints}
                              setsliderpoints={setsliderpoints}
                            />
                          </div>
                          {/* {isPlaying ? (
                            <div
                              className="main-video-playpoint"
                              style={{
                                transform: `translate(${
                                  (first?.current?.clientWidth * loadedtime) /
                                  100
                                }px, 0px) `,
                                // left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                              }}
                            >
                              <div
                                className="video-playpoint"
                                style={
                                  {
                                    // transform: `translate(${
                                    //   (first?.current?.clientWidth * loadedtime) /
                                    //   100
                                    // }px, 0px) `,
                                    // left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                                  }
                                }
                              >
                                {(slider || isPlaying) && (
                                  <div className="tool-tip">
                                    <span>
                                      {millisToMinutesAndSeconds(
                                        ((loadedtime * metadata.duration) /
                                          100) *
                                          1000
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Draggable bounds="parent" {...dragHandlers}>
                              <div
                                className="main-video-playpoint"
                                style={{
                                  transform: `translate(${
                                    (first?.current?.clientWidth * loadedtime) /
                                    100
                                  }px, 0px) `,
                                  // left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                                }}
                              >
                                <div
                                  className="video-playpoint"
                                  style={
                                    {
                                      // transform: `translate(${
                                      //   (first?.current?.clientWidth * loadedtime) /
                                      //   100
                                      // }px, 0px) `,
                                      // left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                                    }
                                  }
                                >
                                  {(slider || isPlaying) && (
                                    <div className="tool-tip">
                                      <span>
                                        {millisToMinutesAndSeconds(
                                          ((loadedtime * metadata.duration) /
                                            100) *
                                            1000
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Draggable>
                          )} */}

                          <Draggable
                            axis="x"
                            bounds="parent"
                            {...dragHandlers}
                            // allowAnyClick={true}
                            // nodeRef={DRAG}
                            position={Dragposition}
                          >
                            <div
                              ref={DRAG}
                              className="main-video-playpoint"
                              style={
                                {
                                  // transform: `translate(${
                                  //   (first?.current?.clientWidth * loadedtime) /
                                  //   100
                                  // }px, 0px) `,
                                  // left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                                }
                              }
                            >
                              <div
                                className="video-playpoint"
                                style={
                                  {
                                    // transform: `translate(${
                                    //   (first?.current?.clientWidth * loadedtime) /
                                    //   100
                                    // }px, 0px) `,
                                    // left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                                  }
                                }
                              >
                                {(slider || isPlaying) && (
                                  <div className="tool-tip">
                                    <span>
                                      {millisToMinutesAndSeconds(
                                        ((loadedtime * metadata.duration) /
                                          100) *
                                          1000
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Draggable>
                          <div
                            className="main-video-playpoint"
                            style={{
                              left: `${loadtimeforright}%`,
                              backgroundColor: "rgba(0, 0, 0, 0)",
                              width: "0",
                            }}
                          >
                            <div
                              className="video-playpoint"
                              // style={{ left: `${loadedtime}%` }}
                            >
                              {slidenew && (
                                <div className="tool-tip">
                                  <span>
                                    {millisToMinutesAndSeconds(
                                      ((loadtimeforright * metadata.duration) /
                                        100) *
                                        1000
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="fix-frame-box">
                          <div className="fix-frame left">
                            {/* <input
                              type="text"
                              ref={input}
                              pattern="[0-9]"
                              className="form-control icontrol"
                              onChange={onChange}
                              onBlur={onBlur}
                              value={value}
                              style={{
                                margin: "0 !important",
                                width: "40px",
                                border: "none",
                                background: "transparent",
                              }}
                            /> */}

                            <Inputmask
                              onBlur={Blur}
                              style={{
                                margin: "0 !important",
                                width: "60px",
                                border: "none",
                                background: "transparent",
                                textIndent: "4px",
                              }}
                              mask="12:34"
                              alwaysShowMask={true}
                              formatChars={{
                                1: "[0-5]",
                                2: "[0-9]",
                                3: "[0-5]",
                                4: "[0-9]",
                              }}
                              value={starttime.S_start + starttime.S_end}
                              onChange={(e) => {
                                let [start, end] = e.target.value.split(":");

                                setstarttime((ert) => {
                                  return { ...ert, S_start: start, S_end: end };
                                });
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                disabled
                                width={15}
                                onClick={() => {
                                  if (
                                    Number(starttime.S_start) * 60 +
                                      Number(starttime.S_end) ===
                                    Number(starttime.E_start) * 60 +
                                      Number(starttime.E_end) -
                                      1
                                  ) {
                                    return false;
                                  }

                                  setstarttime((oldvalues) => {
                                    let newvalue = Number(oldvalues.S_end) + 1;
                                    let abc = {
                                      S_start: oldvalues.S_start,
                                      S_end:
                                        newvalue < 10
                                          ? `0${newvalue}`
                                          : newvalue,
                                    };
                                    if (newvalue > 59) {
                                      abc = {
                                        S_end: "00",
                                        S_start:
                                          Number(oldvalues.S_start) + 1 < 10
                                            ? `0${
                                                Number(oldvalues.S_start) + 1
                                              }`
                                            : Number(oldvalues.S_start) + 1,
                                      };
                                    }

                                    dynamicdata(
                                      Number(abc?.S_start) * 60 +
                                        Number(abc?.S_end),
                                      metadata.duration
                                    );
                                    setsliderpoints({
                                      ...sliderpoints,
                                      start:
                                        Number(abc?.S_start) * 60 * 1000 +
                                        Number(abc?.S_end) * 1000,
                                    });
                                    setTimings([
                                      {
                                        ...timings[0],
                                        start:
                                          Number(abc?.S_end) +
                                          Number(abc?.S_start) * 60,
                                      },
                                    ]);
                                    return {
                                      ...oldvalues,

                                      ...abc,
                                    };
                                  });
                                }}
                                height={15}
                                viewBox="-2 -4 10 10"
                                fill="none"
                                stroke="#354d74"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  name="up"
                                  d="M4.2506 0.333496C4.1256 0.166829 3.8756 0.166829 3.7506 0.333496L0.625604 4.50016C0.471095 4.70617 0.618089 5.00016 0.875603 5.00016L7.1256 5.00016C7.38312 5.00016 7.53011 4.70617 7.3756 4.50016L4.2506 0.333496Z"
                                  fill="#f0b354"
                                />
                              </svg>
                              <svg
                                width={15}
                                onClick={() => {
                                  if (
                                    Number(starttime.S_start) * 60 +
                                      Number(starttime.S_end) ===
                                    0
                                  ) {
                                    return false;
                                  }

                                  setstarttime((oldvalues) => {
                                    let newvalue = Number(oldvalues.S_end) - 1;
                                    let abc = {
                                      S_start: oldvalues.S_start,
                                      S_end:
                                        newvalue < 10
                                          ? `0${newvalue}`
                                          : newvalue,
                                    };
                                    if (newvalue < 0) {
                                      abc = {
                                        S_end: "59",
                                        S_start:
                                          Number(oldvalues.S_start) - 1 < 10
                                            ? `0${
                                                Number(oldvalues.S_start) - 1
                                              }`
                                            : Number(oldvalues.S_start) - 1,
                                      };
                                    }
                                    dynamicdata(
                                      Number(abc?.S_start) * 60 +
                                        Number(abc?.S_end),
                                      metadata.duration
                                    );
                                    setsliderpoints({
                                      ...sliderpoints,
                                      start:
                                        Number(abc?.S_start) * 60 * 1000 +
                                        Number(abc?.S_end) * 1000,
                                    });
                                    setTimings([
                                      {
                                        ...timings[0],
                                        start:
                                          Number(abc?.S_end) +
                                          Number(abc?.S_start) * 60,
                                      },
                                    ]);

                                    return {
                                      ...oldvalues,

                                      ...abc,
                                    };
                                  });
                                }}
                                height={15}
                                viewBox="-2 9 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  name="down"
                                  d="M3.74947 14.6668C3.87447 14.8335 4.12447 14.8335 4.24947 14.6668L7.37447 10.5002C7.52898 10.2942 7.38198 10.0002 7.12447 10.0002H0.874469C0.616954 10.0002 0.46996 10.2942 0.624469 10.5002L3.74947 14.6668Z"
                                  fill="#f0b354"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="fix-frame right">
                            {/* <input
                              type="text"
                              pattern="[0-9]"
                              className="form-control icontrol"
                              onChange={onChange2}
                              onBlur={onBlur2}
                              value={value2}
                              ref={input2}
                              style={{
                                margin: "0 !important",
                                width: "40px",
                                border: "none",
                                background: "transparent",
                              }}
                            /> */}
                            <Inputmask
                              onBlur={Blur2}
                              style={{
                                margin: "0 !important",
                                width: "60px",
                                border: "none",
                                background: "transparent",
                                textIndent: "4px",
                              }}
                              mask="12:34"
                              alwaysShowMask={true}
                              formatChars={{
                                1: "[0-5]",
                                2: "[0-9]",
                                3: "[0-5]",
                                4: "[0-9]",
                              }}
                              value={starttime.E_start + starttime.E_end}
                              onChange={(e) => {
                                let [start, end] = e.target.value.split(":");

                                setstarttime((ert) => {
                                  return { ...ert, E_start: start, E_end: end };
                                });
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <svg
                                onClick={() => {
                                  if (
                                    Number(starttime.E_start) * 60 +
                                      Number(starttime.E_end) ===
                                    Math.floor(Number(metadata.duration))
                                  ) {
                                    return false;
                                  }
                                  setstarttime((oldvalues) => {
                                    let newvalue = Number(oldvalues.E_end) + 1;
                                    let abc = {
                                      E_start: oldvalues.E_start,
                                      E_end:
                                        newvalue < 10
                                          ? `0${newvalue}`
                                          : newvalue,
                                    };
                                    if (newvalue > 59) {
                                      abc = {
                                        E_end: "00",
                                        E_start:
                                          Number(oldvalues.E_start) + 1 < 10
                                            ? `0${
                                                Number(oldvalues.E_start) + 1
                                              }`
                                            : Number(oldvalues.E_start) + 1,
                                      };
                                    }
                                    setsliderpoints({
                                      ...sliderpoints,
                                      end:
                                        Number(abc?.E_start) * 60 * 1000 +
                                        Number(abc?.E_end) * 1000,
                                    });
                                    setTimings([
                                      {
                                        ...timings[0],
                                        end:
                                          Number(abc?.E_end) +
                                          Number(abc?.E_start) * 60,
                                      },
                                    ]);
                                    return {
                                      ...oldvalues,
                                      ...abc,
                                    };
                                  });
                                }}
                                width={15}
                                height={15}
                                viewBox="-2 -4 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.2506 0.333496C4.1256 0.166829 3.8756 0.166829 3.7506 0.333496L0.625604 4.50016C0.471095 4.70617 0.618089 5.00016 0.875603 5.00016L7.1256 5.00016C7.38312 5.00016 7.53011 4.70617 7.3756 4.50016L4.2506 0.333496Z"
                                  fill="#f0b354"
                                />
                              </svg>
                              <svg
                                onClick={() => {
                                  if (
                                    Number(starttime.E_start) * 60 +
                                      Number(starttime.E_end) ===
                                    Number(starttime.S_start) * 60 +
                                      Number(starttime.S_end) +
                                      1
                                  ) {
                                    return false;
                                  }
                                  setstarttime((oldvalues) => {
                                    let newvalue = Number(oldvalues.E_end) - 1;
                                    let abc = {
                                      E_start: oldvalues.E_start,
                                      E_end:
                                        newvalue < 10
                                          ? `0${newvalue}`
                                          : newvalue,
                                    };
                                    if (newvalue < 0) {
                                      abc = {
                                        E_end: "59",
                                        E_start:
                                          Number(oldvalues.E_start) - 1 < 10
                                            ? `0${
                                                Number(oldvalues.E_start) - 1
                                              }`
                                            : Number(oldvalues.E_start) - 1,
                                      };
                                    }
                                    setsliderpoints({
                                      ...sliderpoints,
                                      end:
                                        Number(abc?.E_start) * 60 * 1000 +
                                        Number(abc?.E_end) * 1000,
                                    });
                                    setTimings([
                                      {
                                        ...timings[0],
                                        end:
                                          Number(abc?.E_end) +
                                          Number(abc?.E_start) * 60,
                                      },
                                    ]);
                                    return {
                                      ...oldvalues,

                                      ...abc,
                                    };
                                  });
                                }}
                                width={15}
                                height={15}
                                viewBox="-2 9 10 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3.74947 14.6668C3.87447 14.8335 4.12447 14.8335 4.24947 14.6668L7.37447 10.5002C7.52898 10.2942 7.38198 10.0002 7.12447 10.0002H0.874469C0.616954 10.0002 0.46996 10.2942 0.624469 10.5002L3.74947 14.6668Z"
                                  fill="#f0b354"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="length-frame-box">
                          <div className="video-length">
                            Video Length{" "}
                            {millisToMinutesAndSeconds(
                              metadata.duration * 1000
                            )}
                            <span className="clock">
                              {/* <BsClockHistory /> */}
                              <img src="/VideoLength_Icon.png" alt="" />
                              <b>00:10</b> Max
                            </span>
                          </div>
                          <div className="video-length frame-seconds">
                            Frame Per Second: 30
                            <span className="clock">
                              {/* <BsFillClockFill /> */}
                              <img src="/FPS_Icon.png" alt="" />
                              <b>30</b> Max
                            </span>
                            <span
                              className="icon info"
                              style={{ fontSize: "17px" }}
                            >
                              {" "}
                              <BiInfoCircle />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert key={"danger"} variant={"danger"}>
                    {errordata.body}
                  </Alert>
                )}
              </Modaldemo>
              <div className="reatake-btn">
                <Button
                  className="btn btn-dark crop-video-btn"
                  onClick={() => setcheck(false)}
                >
                  Retake
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
}

export default Main;
