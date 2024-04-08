/** 与えられた文字列sの長さがlengthLimit以下かどうか検証する */
export default function (s: string, lengthLimit: number): boolean | string {
  if (s.trim().length > lengthLimit) {
    return `この項目は${lengthLimit}文字以下で入力してください。`
  }

  return true;
}