console.log('compose')

/**
 * 从右向左执行更能反映数学上的含义
 * 
 * 结合律
 * var associative=compose(f,compose(g,h))==compose(compose(f,g),h)
 * true
 * 
 * 所有的组合共有的特性 结合律
 * 
 * 结合律的一大好处是任何一个函数分组都可以被拆开来 然后再以他们自己的方式组合在一起
 * 
 * let l=compose(e,t,h,r)
 * 
 * let last=compose(h,r)
 * compose(e,t,last)
 * 
 * pointfree模式 
 * 函数无需提及将要操作的数据是什么样的
 * 
 */

//非pointfree

var snakeCase = function (word) {
  return word.toLowerCase().replace(' ', '_')
}
//pointfree
var snakeCase2 = compose(replace(' ', '_'), toLowerCase)


//另一个例子
var initials = function (name) {
  return name.splice(' ').map(compose(toUpperCase, head)).join('')
}
//pointfree
var initials2 = compose(join('.'), map(compose(toUpperCase, head)), splice(''))

/**
 * 帮助减少不必要的命名 让代码保持简洁和通用（双刃剑）
 */

//每个函数都接受一个实际参数
//debug
//可以使用这个实用但是不纯的trace函数来追踪代码的执行情况

var trace = curry(function (tag, x) {
  console.log(tag, x)
  return x
})

//范畴学

//对象的搜集
//把类型当作集合对待 因为我们可以利用集合论处理类型

//态射的搜集
//态射是标准的、普通的纯函数

//态射的组合
/**
 * 这就是组合 
 * 前面已经提过 compose是符合结合律的 结合律是在范畴学中对任何组合都适用的一种特性
 * 
 */

//identity这个独特的态射
let id = x => x
//下面这个特性对所有一元函数都成立
compose(id,f)==compose(f,id)==f