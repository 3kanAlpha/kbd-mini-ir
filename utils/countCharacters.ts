export default function countCharacters(str: string): number {
  let counter = 0;
  for (let i = 0; i < str.length; i++) {
    const codePoint = str.codePointAt(i);
    if (typeof codePoint === "undefined") continue;
    if (codePoint <= 0x7F) counter += 1;
    else counter += 2;
  }
  return counter;
}