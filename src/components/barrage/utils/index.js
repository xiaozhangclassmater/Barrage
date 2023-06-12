// 获取两个数之间的随机数
export function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}