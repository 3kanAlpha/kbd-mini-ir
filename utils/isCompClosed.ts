/** 大会の終了日時が現在時刻よりも前かどうか判定する */
export default function (endTimestamp: string): boolean {
  return new Date(endTimestamp) < new Date()
}