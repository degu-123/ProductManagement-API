function getMaxBy(arr, key) {
  return arr.reduce((max, item) => item[key] > max[key] ? item : max);
}
function getMinBy(arr, key) {
  return arr.reduce((min, item) => item[key] < min[key] ? item : min);
}
module.exports ={getMaxBy,getMinBy};