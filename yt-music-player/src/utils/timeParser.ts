export default function timeParser(duration: number): string {
  const min = Math.floor(duration / 60);
  const sec = duration % 60;
  if (sec < 10) {
    return `${min}:0${sec}`;
  }
  return `${min}:${sec}`;
};