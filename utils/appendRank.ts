/** スコア情報の順位を付加する */
export default function (data: any) {
  return data.map((item: any, index: number) => {
    item.rank = index + 1;
    return item;
  });
}