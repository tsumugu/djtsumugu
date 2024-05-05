export const insertArrayInArray = (
  baseArray: any[],
  insertArray: any[],
  insertIndex: number // 1
) => {
  const headOfBaseArray = baseArray.slice(0, insertIndex);
  const tailOfBaseArray = baseArray.slice(insertIndex);
  return headOfBaseArray.concat(insertArray.concat(tailOfBaseArray));
};
