export default function (date: string, time: string): boolean {
  const timestamp = date + 'T' + time + "+09:00";
  const d = new Date(timestamp);

  return d.toString() !== 'Invalid Date';
}