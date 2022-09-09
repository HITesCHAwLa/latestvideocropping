export function timechange(time) {
  const abc = time.split(":");

  const minutes = Number(abc[0]) * 60;

  const second = Number(abc[1]);

  return minutes + second;
}
