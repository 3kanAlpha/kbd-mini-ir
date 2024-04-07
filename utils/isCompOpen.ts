/** 現在時刻が大会のスコア登録期限より前かどうか検証する */
export default function (timestamp: string) {
  return new Date(timestamp) > new Date()
}