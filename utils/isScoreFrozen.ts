const secondInMillis = 1000;
const minuteInMillis = 60 * secondInMillis;
const hourInMillis = 60 * minuteInMillis;

/** 現在時刻が順位表凍結期間内かどうか判定する */
export default function (endTimestamp: string, hideScoreHr: number): boolean {
  const end = new Date(endTimestamp);
  const endTime = end.getTime();

  const freezeStart = new Date(endTime - hideScoreHr * hourInMillis);

  const now = new Date();
  return freezeStart <= now && now < end;
}