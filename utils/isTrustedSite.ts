export default function (url: string): boolean {
  const hostname = getHostnameFromURL(url);
  if (!hostname) {
    return false;
  }

  const trusted = [
    'twitter.com',
    'x.com',
    'imgur.com'
  ]

  return trusted.includes(hostname);
}