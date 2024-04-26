/** 大会の開催期間に現在時刻が含まれるかどうか判定する */
export default function (startTimestamp: string, endTimestamp: string): boolean {
  return new Date(startTimestamp) <= new Date() && new Date(endTimestamp) > new Date()
}