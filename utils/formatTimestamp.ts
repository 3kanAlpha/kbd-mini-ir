export default function (timestamp: string) {
  const padZero = function (num: number) {
    return num.toString().padStart(2, '0')
  }

  const d = new Date(timestamp)

  // 日付をyyyy/mm/dd hh:mm形式に整形する
  return `${d.getFullYear()}/${padZero(d.getMonth() + 1)}/${padZero(d.getDate())} ${padZero(d.getHours())}:${padZero(d.getMinutes())}`
}