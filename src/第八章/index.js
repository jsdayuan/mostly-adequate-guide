console.log('特百惠 强大的容器')
/**
 * 如何书写函数式的程序了 即通过管道把数据在一系列纯函数间传递
 */

//创建一个容器

let Container = function (x) {
  this._value = x
}
Container.of = function (x) { return new Container(x) }

console.log(Container.of(3))

//第一个functor

// (a->b)->Container a -> Container b
Container.prototype.map=function(f){
  return new Container(f(this._value))
}

console.log(Container.of(5).map(x=>x*2))

//把值装进一个容器 且只能用map来处理它
//抽象