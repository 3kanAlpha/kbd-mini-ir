/** 与えられたURLのドメイン部を返す */
export default function (url: string) {
  if (URL.canParse(url)) {
    return new URL(url).hostname
  }
  return null;
}