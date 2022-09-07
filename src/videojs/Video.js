import { fetchFile } from "@ffmpeg/ffmpeg";
import React from "react";
import ReactPlayer from "react-player";

function Video({ file, ffmpeg, crop }) {
  const ref = React.useRef("");
  const [range, setRange] = React.useState(0);
  const [timings, setTimings] = React.useState([
    {
      start: 0,
      end: 0,
    },
  ]);
  async function cropvideo(e) {
    e.target.innerText = "Loading....";
    e.target.setAttribute("disabled", "true");
    try {
      ffmpeg.current.FS("writeFile", "myFile.mp4", await fetchFile(file));
      await ffmpeg.current.run(
        "-i",
        "myFile.mp4",
        "-ss",
        `${timings.start}`,
        "-t",
        `${timings.end - timings.start}`,
        "-vf",
        `crop=${crop?.width}:${crop?.height}:${crop?.x}:${crop?.y}`,
        "-strict",
        "-2",
        "output.mp4"
      );
      const data = ffmpeg.current.FS("readFile", "output.mp4");

      const newurl = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      e.target.innerText = "crop-video";
      e.target.removeAttribute("disabled");
      alert(newurl);
    } catch (err) {
      throw err;
    }
  }
  return (
    <>
      <ReactPlayer
        ref={ref}
        id="videoid"
        url={file}
        className="react-player"
        playing={false}
        width="100%"
        height="100%"
        controls={true}
        // onDuration={(e) => {
        //   setvideoduration(e);
        // }}

        onClickPreview={(ok) => {
          //   console.log(ok, "onClickPreview");
        }}
        onProgress={(e) => {
          setTimings([
            {
              end: e.loadedSeconds,
              start: e.playedSeconds,
            },
          ]);

          // setvideostart(e.playedSeconds);
          // setvideoduration(e.loadedSeconds);
          // setRange(e.played);
        }}
      />
      <button onClick={(e) => cropvideo(e)}>crop-video</button>
    </>
  );
}

export default React.memo(Video);
