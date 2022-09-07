import React, { useEffect, useRef, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
function MainFile() {
  const [ready, setReady] = useState(false);
  const ffmpeg = useRef(null);
  const load = async () => {
    await ffmpeg.current.load();

    setReady(true);
  };
  useEffect(() => {
    try {
      ffmpeg.current = createFFmpeg({
        log: true,
        corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
      });
    } catch (err) {
      throw err;
    }
    load();
  }, []);

  console.log(ready);
  return ready ? <div>MainFilesss</div> : <h1>hello</h1>;
}

export default MainFile;
