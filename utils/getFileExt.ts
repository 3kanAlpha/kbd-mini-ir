/** ファイル名から拡張子を取得する */
export default function (filename: string) {
  return filename.split('.').pop()
}