export default function (value: string): boolean | string {
  if (value.trim().length > 0) {
    return true;
  }

  return "この項目は必須です。"
}