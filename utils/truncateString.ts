export default function (str: string, limit: number): string {
  const l = countCharacters(str);
  if (l <= limit) return str;

  // limitを越えない文字列を取得
  for (let end = str.length - 1; end > 0; end--) {
    const s = str.slice(0, end);
    if (countCharacters(s) <= limit) {
      return s + "...";
    }
  }

  return str.slice(0, 1) + "...";
}