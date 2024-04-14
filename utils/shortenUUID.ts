export default function (uuid: string): string {
  return uuid.split('-').join('')
}