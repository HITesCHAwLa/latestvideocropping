export function getVideoDimensionsOf(url, file) {
  return new Promise((resolve) => {
    // create the video element
    const video = document.createElement("video");

    // place a listener on it
    video.addEventListener(
      "loadedmetadata",
      () => {
        // retrieve dimensions
        const height = video.videoHeight;
        const width = video.videoWidth;
        const duration = video.duration.toFixed(2);
        const start = video.currentTime;
        const size = file.size;

        // send back result
        resolve({ height, width, duration, start, size });
      },
      false
    );

    // start download meta-datas
    video.src = url;
  });
}
