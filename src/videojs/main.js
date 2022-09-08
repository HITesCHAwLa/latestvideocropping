import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import React, { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import { getVideoDimensionsOf } from "./getmetadata";
import ReactCrop from "react-image-crop";
import Video from "./Video";
import "react-image-crop/dist/ReactCrop.css";
import ReactPlayer from "react-player";
// import Modal from "../modal";
import { MdHorizontalSplit, MdBorderVertical } from "react-icons/md"
import {BsClockHistory, BsFillClockFill} from "react-icons/bs"
import {CgDanger} from "react-icons/cg"

import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import Rangeslider from "./Rangeslider";
import Newrange from "../dualrangeslider/Newrange";
import {
  millisToMinutesAndSeconds,
  secondtomilisecond,
} from "../dualrangeslider/timmer";
import { formatSizeUnits, niceBytes } from "../bytetomb";
import Modaldemo from "../Modaldemo";
import { Button } from "react-bootstrap";
// import Modal from "react-modal";
const HeaderMemo = React.memo(Newrange);
// Modal.setAppElement("#root");
function Main() {
  const [metadata, setMetadata] = useState();
  const [imagedata, setimagedata] = useState([]);
  const [flag, setFlag] = useState(false);
  const ffmpeg = useRef(null);
  const [show, setShow] = useState(false);
  const [check, setcheck] = useState(false);
  const [ready, setReady] = React.useState(false);
  const ref = React.useRef("");
  const [range, setRange] = React.useState(0);
  const [urldata, seturldata] = useState("");
  const [centredModal, setCentredModal] = useState(false);
  const [timings, setTimings] = React.useState([
    {
      start: 0,
      end: 0,
    },
  ]);
  const [errordata, setErrordata] = useState({
    title: "",
    body: "",
  });
  const [crop, setCrop] = React.useState({
    height: 338,
    unit: "px",
    width: 640,
    x: 0,
    y: 0,
  });

  async function uploadFile(file) {
    setFlag(true);
    let urlfile = URL.createObjectURL(file[0]);

    let data = await getVideoDimensionsOf(urlfile, file[0]);
    // alert(JSON.stringify(data));
    if (data.height > 1032 && data.width > 1920) {
      alert(
        `Not valid resolution your video resolution is ${data.width} X ${data.height}`
      );
      setFlag(false);
      return false;
    }
    if (data.size > 4000000) {
      alert(
        `The Maximum video size allowed is 4 MB, your file is ${formatSizeUnits(
          data.size
        )} . Please try using a smaller sized video`
      );
      setFlag(false);
      return false;
    }
    if (Number(data.duration * 1000) > 20000) {
      alert(`video Length is  ${data.duration}s. Maximum allow 20s`);
      setFlag(false);
      return false;
    }
    let imagedatas = await generateVideoThumbnails(file[0], 4);
    setimagedata(imagedatas);

    setMetadata({ ...data, url: urlfile });
    setFlag(false);
    setcheck(true);
    setShow(true)
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
  const [first, setfirst] = useState({ min: "", max: "" });
  // useEffect(() => {
  //   if (check) {
  //     const mySlider = new DoubleSlider(document.getElementById("my-slider"));
  //     mySlider.addEventListener("slider:change", () => {
  //       const { min, max } = mySlider.value;
  //       if (min < max) {
  //         setfirst({ min, max });
  //       }
  //     });
  //   }
  // }, [check]);

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
        `crop=${(metadata.width * crop?.width) / 640}:${(metadata.height * crop?.height) / 338
        }:${(metadata.width * crop?.x) / 640}:${(metadata.height * crop?.y) / 338
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
      setShow(false)
    } catch (err) {
      throw err;
    }
  }
  //   useEffect(() => {
  //     if (check) {
  //       const mySlider = new DoubleSlider(document.getElementById("my-slider"));
  //       console.log(mySlider, "=============");
  //       mySlider.addEventListener("slider:change", () => {
  //         const { min, max } = mySlider.value;
  //         ref.current.seekTo(min);
  //         console.log(ref.current);
  //         console.log(`Min is: ${min}, max is: ${max}`);
  //       });
  //     }
  //   }, [check, timings]);
  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = "#f00";
  }

  function closeModal() {
    setIsOpen(false);
  }
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
  return (
    ready && (
      <div className="video-main-box">
        <div className="video-box">
          {!check ? (
            <div className="choose-video">
              {" "}
              <input
                type="file"
                className="hidden"
                id="up_file"
                onChange={(e) => uploadFile(e.target.files, e.target.value, e)}
              />
              <FileDrop
                onDrop={(e) => uploadFile(e)}
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
              onProgress={(e) => { }}
            ></video>
          ) : ""}
          {check && (
            <>


              <Modaldemo check={check} clickhandle={cropvideo} setcheck={setcheck} show={show} setShow={setShow}>
                <ReactCrop
                  crop={crop}
                  onChange={(c, percentCrop) => setCrop(c)}
                  minHeight={100}
                  minWidth={100}
                  maxHeight={340}
                  keepSelection={true}
                >
                  <ReactPlayer
                    ref={ref}
                    id="videoid"
                    url={metadata?.url}
                    className="react-player"
                    playing={false}
                    width="100%"
                    height="100%"
                    controls={true}
                    onDuration={(e) => { }}
                    onClickPreview={(ok) => {
                      // console.log(ok, "onClickPreview");
                    }}
                    onProgress={(e) => {
                      setTimings([
                        {
                          end: e.loadedSeconds,
                          start: e.playedSeconds,
                        },
                      ]);


                    }}
                  />
                  {/* <video
                width="100%"
                height="100%"
                src={metadata?.url}
                controls
                onProgress={(e) => {
                  console.log(
                    e,
                    "--------------------------------------------"
                  );
                }}
              ></video> */}
                </ReactCrop>
                <div className="videoframe-slider-box">
                  <div className="frame-content">
                    <p>Max 1920 <span><MdHorizontalSplit /></span> <span className="xe">X</span><span><MdBorderVertical /></span>1080 Max <span></span></p>
                  </div>
                  <div className="video-frame-box">
                    <div className="video-frame">
                      {imagedata.map((e) => {
                        return <img src={e} alt="" />;
                      })}
                      <div className="video-slider">
                        <HeaderMemo
                          start={secondtomilisecond(Number(metadata.start))}
                          end={secondtomilisecond(Number(metadata.duration))}
                          setTimings={setTimings}
                          newchangeslide
                        />
                      </div>
                    </div>
                  </div>
                  <div className="length-frame-box">
                    <div className="video-length">Video Length 00:10 <span className="clock"><BsClockHistory/>00:10 Max</span></div>
                    <div className="video-length frame-seconds">Frame Per Second: 30<span className="clock"><BsFillClockFill/>30 Max</span><span><CgDanger/></span></div>
                  </div>

                  {/* <div
                  className="video-slider"
                  id="my-slider"
                  data-min={metadata?.start}
                  data-max={metadata?.duration}
                  data-range={metadata?.duration}
                  step={0.1}
                ></div> */}
                </div>
              </Modaldemo>
              <div className="reatake-btn">
                <Button
                  className="btn btn-dark crop-video-btn"
                  onClick={() => setcheck(false)}
                >
                  Retake
                </Button>
              </div>
              {/* {urldata !== "" && (
                  <video
                    width="100%"
                    height="100%"
                    src={urldata}
                    controls
                    style={{ marginTop: "80px" }}
                    onProgress={(e) => {}}
                  ></video>
                )} */}

              {/* <div
              id="my-slider"
              data-min={0}
              data-max={metadata?.duration}
              data-range={metadata?.duration}
            ></div> */}

              {/* <Rangeslider /> */}
              {/* <Rangeslider
              data={
                <div style={{ width: "100%", height: "65px", display: "flex" }}>
                  {imagedata.map((e) => {
                    return <img src={e} alt="" style={{ width: "auto" }} />;
                  })}
                </div>
              }
            /> */}
            </>
          )}
        </div>
      </div>
    )
  );
}

export default Main;
