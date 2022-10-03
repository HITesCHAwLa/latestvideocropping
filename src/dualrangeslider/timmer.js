export function secondtomilisecond(timmer) {
  return timmer * 1000;
}
export function millisToMinutesAndSeconds(videotime) {
  var minutes = Math.floor(videotime / 60000);
  var seconds = ((videotime % 60000) / 1000).toFixed(0);
  // return minutes + "0:" + (seconds < 10 ? "0" : "") + seconds;
  return `${minutes < 9 ? `0${minutes}` : minutes}:${
    seconds < 10 ? `0${seconds}` : seconds
  }`;
}

export function fordualrangeslider(videotime) {
  return (videotime / 1000).toFixed(2);
}
