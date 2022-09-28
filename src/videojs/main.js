import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import { getVideoDimensionsOf } from "./getmetadata";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ReactPlayer from "react-player";
import { MdHorizontalSplit, MdBorderVertical } from "react-icons/md";
import { BsClockHistory, BsFillClockFill } from "react-icons/bs";
import { BiInfoCircle } from "react-icons/bi";
import { CgDanger } from "react-icons/cg";

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

const HeaderMemo = React.memo(Newrange);
function Main() {
  const [metadata, setMetadata] = useState();
  const [imagedata, setimagedata] = useState([]);
  const [slider, setslider] = useState(false);
  const [flag, setFlag] = useState(false);
  const ffmpeg = useRef(null);
  const [show, setShow] = useState(false);
  const [check, setcheck] = useState(false);
  const [ready, setReady] = React.useState(false);
  const ref = React.useRef("");
  const [filevalue, setfilevalue] = useState("");
  const [urldata, seturldata] = useState("");
  const [isPlaying, setisPlaying] = useState(false);
  const [timings, setTimings] = React.useState([
    {
      start: 0,
      end: 0,
    },
  ]);
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
    if (data.size > 4000000) {
      setErrordata({
        title: "Size Limit Reached",
        body: `The Maximum video size allowed is 4 MB, your file is ${formatSizeUnits(
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
    let imagedatas = await generateVideoThumbnails(file[0], 9);
    setimagedata(imagedatas);
    setvideoresolution({ width: data.width, height: data.height });

    setMetadata({ ...data, url: urlfile });
    setsliderpoints({
      start: secondtomilisecond(Number(data?.start)),
      end: secondtomilisecond(Number(data?.duration)),
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
      setPrevValue(e);

      return event.target.value;
    });
  };

  const onBlur = (event) => {
    const value = event.target.value;
    const seconds = Math.max(0, getSecondsFromHHMMSS(value));

    if (
      seconds > metadata?.duration ||
      seconds >= getSecondsFromHHMMSS(value2)
    ) {
      setValue(preValue);
      return false;
    }

    setsliderpoints((ert) => {
      return {
        ...ert,
        start: Number(seconds * 1000),
      };
    });
    setTimings([
      {
        start: Number(seconds),
        end: timings?.[0]?.end,
      },
    ]);
    dynamicdata(Number(seconds), metadata.duration);
    ref.current.seekTo(Number(seconds), "seconds");

    const time = toHHMMSS(seconds);
    setValue(time);
  };

  const onChange2 = (event) => {
    setValue2((e) => {
      setPrevValue2(e);

      return event.target.value;
    });
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
                        controls={true}
                        onDuration={(e) => {}}
                        onClickPreview={(ok) => {
                          // console.log(ok, "onClickPreview");
                        }}
                        onProgress={(e) => {
                          if (e.playedSeconds === e.loadedSeconds) {
                            setisPlaying(false);
                            setslider(false);
                          }

                          if (e.playedSeconds.toFixed(2) >= timings[0].end) {
                            setisPlaying(false);
                            setslider(false);
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
                          <span>
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
                              onChange={(ert) => {
                                if (ert.target.value >= metadata.width) {
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
                                        (
                                          (Number(metadata.width) * 100) /
                                          metadata.width
                                        ).toFixed(2)
                                      ),
                                    };
                                  });
                                  return false;
                                }
                                setvideoresolution((e) => {
                                  return {
                                    ...e,
                                    width: Number(ert.target.value),
                                  };
                                });
                                setCrop((e) => {
                                  return {
                                    ...e,
                                    width: Number(
                                      (
                                        (Number(ert.target.value) * 100) /
                                        metadata.width
                                      ).toFixed(2)
                                    ),
                                  };
                                });
                              }}
                            />
                          </span>
                        </div>
                        <span className="xe"> &nbsp; X &nbsp; </span>
                        <div className="max-height frame">
                          <span>
                            <input
                              type="number"
                              name=""
                              id=""
                              value={videoresolution?.height}
                              max={
                                metadata?.height -
                                (metadata?.height * crop.y) / 100
                              }
                              onChange={(ert) => {
                                if (ert.target.value > metadata.height) {
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
                                        (
                                          (Number(metadata.height) * 100) /
                                          metadata.height
                                        ).toFixed(2)
                                      ),
                                    };
                                  });
                                  return false;
                                }
                                setvideoresolution((e) => {
                                  return {
                                    ...e,
                                    height: Number(ert.target.value),
                                  };
                                });
                                setCrop((e) => {
                                  return {
                                    ...e,
                                    height: Number(
                                      (
                                        (Number(ert.target.value) * 100) /
                                        metadata.height
                                      ).toFixed(2)
                                    ),
                                  };
                                });
                              }}
                              min={100}
                              className="form-control icontrol"
                            />
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
                              setslidenew={setslidenew}
                              sliderpoints={sliderpoints}
                              setsliderpoints={setsliderpoints}
                            />
                          </div>
                          <div
                            className="main-video-playpoint"
                            style={{
                              left: `${loadedtime > 100 ? 100 : loadedtime}%`,
                            }}
                          >
                            <div
                              className="video-playpoint"
                              style={{ left: `${loadedtime}%` }}
                            >
                              {(slider || isPlaying) && (
                                <div className="tool-tip">
                                  <span>
                                    {millisToMinutesAndSeconds(
                                      ((loadedtime * metadata.duration) / 100) *
                                        1000
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
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
                            <input
                              type="text"
                              pattern="[0-9]"
                              className="form-control icontrol"
                              onChange={onChange}
                              onBlur={onBlur}
                              value={value}
                              style={{ margin: "0 !important", width: "70px" }}
                            />
                          </div>
                          <div className="fix-frame right">
                            <input
                              type="text"
                              pattern="[0-9]"
                              className="form-control icontrol"
                              onChange={onChange2}
                              onBlur={onBlur2}
                              value={value2}
                              style={{ margin: "0 !important", width: "70px" }}
                            />
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
                            <span>
                              <CgDanger />
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
