/** スコア情報の順位を付加する ただし同じスコアには同じ順位を付ける */
export default function (data: any) {
  let counter = 1;
  let currentRank = 1;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      data[i].rank = currentRank;
    } else {
      if (data[i].score === data[i - 1].score) {
        data[i].rank = currentRank;
      } else {
        currentRank = counter;
        data[i].rank = currentRank;
      }
    }
    counter++;
  }
}