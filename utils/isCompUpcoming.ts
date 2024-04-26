/** 大会の開始日時が現在時刻よりも後かどうか判定する */
export default function (startTimestamp: string): boolean {
  return new Date(startTimestamp) > new Date()
}