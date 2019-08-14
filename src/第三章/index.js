console.log('第三章')
//纯函数总能根据输入来做缓存
//实现缓存的一种典型方式是memoize技术

/**
 * squareNumber(4)  =>16
 * 
 * squareNumber(4)  =>16  从缓存中读取输入4的结果
 */

let squareNumber = x => x * x

function memoize(fn) {
  let cache = {}

  return function (...args) {
    let str = JSON.stringify(args)
    cache[str] = cache[str] || fn(...args)
    return cache[str]
  }
}

console.log(memoize(squareNumber)(4))

