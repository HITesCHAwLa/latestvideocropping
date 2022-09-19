import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import { getVideoDimensionsOf } from "./getmetadata";
import ReactCrop from "react-image-crop";
import Video from "./Video";
import "react-image-crop/dist/ReactCrop.css";
import ReactPlayer from "react-player";
// import Modal from "../modal";
import { MdHorizontalSplit, MdBorderVertical } from "react-icons/md";
import { BsClockHistory, BsFillClockFill } from "react-icons/bs";
import { BiInfoCircle } from "react-icons/bi";
import { CgDanger } from "react-icons/cg";

import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import Rangeslider from "./Rangeslider";
import Newrange from "../dualrangeslider/Newrange";
import {
  millisToMinutesAndSeconds,
  secondtomilisecond,
} from "../dualrangeslider/timmer";
import { formatSizeUnits, niceBytes } from "../bytetomb";
import Modaldemo from "../Modaldemo";
import { Alert, Button } from "react-bootstrap";
import { timechange } from "../timetomilisecond";
// import Modal from "react-modal";
const HeaderMemo = React.memo(Newrange);
// Modal.setAppElement("#root");
function Main() {
  const [metadata, setMetadata] = useState();
  const [imagedata, setimagedata] = useState([]);
  const [flag, setFlag] = useState(false);
  const [playpausetime, setPlaypausetime] = useState({});
  const ffmpeg = useRef(null);
  const [show, setShow] = useState(false);
  const [playtimevideo, setplaytimevideo] = useState(0);
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
  const [forplaypause, setforplaypause] = useState({ start: null, end: null });
  const [errordata, setErrordata] = useState({
    title: "",
    body: "",
  });
  const [crop, setCrop] = React.useState({
    height: 360,
    unit: "px",
    width: 640,
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
    let imagedatas = await generateVideoThumbnails(file[0], 4);
    setimagedata(imagedatas);

    setMetadata({ ...data, url: urlfile });
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
        // width: 854px;
        // height: 460px;
        "-vf",
        `crop=${(metadata.width * crop?.width) / 640}:${
          (metadata.height * crop?.height) / 360
        }:${(metadata.width * crop?.x) / 640}:${
          (metadata.height * crop?.y) / 360
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
        height: 360,
        unit: "px",
        width: 640,
        x: 0,
        y: 0,
      });
    } catch (err) {
      throw err;
    }
  }

  const [loadedtime, setloadedtime] = useState(0);

  function dynamicdata(playtime, duration) {
    // if (playtime == duration) {
    //   setloadedtime(0);
    //   return false;
    // }
    let a = playtime * 100;
    let b = a / duration;
    setloadedtime(b);
  }

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
                      onChange={(c, percentCrop) => setCrop(c)}
                      minHeight={100}
                      minWidth={100}
                      // maxHeight={460}
                      maxHeight={360}
                      maxWidth={640}
                      keepSelection={true}
                    >
                      <ReactPlayer
                        ref={ref}
                        id="videoid"
                        url={metadata?.url}
                        playing={isPlaying}
                        className="react-player"
                        progressInterval={30}
                        width="640px"
                        height="360px"
                        controls={true}
                        onDuration={(e) => {}}
                        onClickPreview={(ok) => {
                          // console.log(ok, "onClickPreview");
                        }}
                        onProgress={(e) => {
                          if (e.playedSeconds === e.loadedSeconds) {
                            setisPlaying(false);
                          }

                          if (e.playedSeconds.toFixed(2) >= timings[0].end) {
                            setisPlaying(false);
                          }
                          // setloadedtime((pre) => pre + 3.1);

                          dynamicdata(
                            e.playedSeconds.toFixed(2),
                            e.loadedSeconds
                          );

                          setPlaypausetime({
                            end: e.loadedSeconds,
                            start: e.playedSeconds,
                          });
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
                        {/* <p>
                          Max 1920{" "}
                          <span>
                            <input
                              type="number"
                              name=""
                              id=""
                              className="form-control icontrol"
                            />
                          </span>
                          <span>
                            <MdHorizontalSplit />
                          </span>{" "}
                          <span className="xe">X</span>
                          <span>
                            <MdBorderVertical />
                          </span>
                          <span>
                            <input
                              type="number"
                              name=""
                              id=""
                              className="form-control icontrol"
                            />
                          </span>
                          1080 Max{" "}
                        </p> */}
                        <div className="max-width frame">
                          MAX 1920 &nbsp;{" "}
                          <span className="icon">
                            <MdHorizontalSplit />
                          </span>
                          <span>
                            <input
                              type="number"
                              name=""
                              id=""
                              className="form-control icontrol"
                              value={metadata?.width}
                              disabled
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
                              value={metadata?.height}
                              disabled
                              className="form-control icontrol"
                            />
                          </span>
                          <span className="icon">
                            {" "}
                            <MdBorderVertical />
                          </span>{" "}
                          1080 MAX{" "}
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
                              playtime={playtimevideo}
                              setforplaypause={setforplaypause}
                              playpausetimevideo={forplaypause}
                            />
                          </div>
                          <div
                            className="video-playpoint"
                            style={{ left: `${loadedtime}%` }}
                          ></div>
                        </div>
                        <div className="fix-frame-box">
                          <div className="fix-frame left">
                            <input
                              type="text"
                              disabled
                              className="form-control icontrol"
                              value={millisToMinutesAndSeconds(
                                metadata.start * 1000
                              )}
                              style={{ margin: "0 !important", width: "70px" }}
                            />
                          </div>
                          <div className="fix-frame right">
                            <input
                              disabled
                              type="text"
                              className="form-control icontrol"
                              value={millisToMinutesAndSeconds(
                                metadata.duration * 1000
                              )}
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
                              <BsClockHistory />
                              00:10 Max
                            </span>
                          </div>
                          <div className="video-length frame-seconds">
                            Frame Per Second: 30
                            <span className="clock">
                              <BsFillClockFill />
                              30 Max
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
