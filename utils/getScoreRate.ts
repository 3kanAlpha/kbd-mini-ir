/** beatmania: スコアとノーツ数からスコアレートを計算する */
export default function (score: number, notes: number): string {
  const maxExScore = notes * 2;
  const rate = score / maxExScore * 100;
  return rate.toFixed(1);
}