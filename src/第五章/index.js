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

var snakeCase=function(word){
  return word.toLowerCase().replace(' ','_')
}
//pointfree
var snakeCase2=compose(replace(' ','_'),toLowerCase)


//另一个例子
var initials=function (name){
  return name.splice(' ').map(compose(toUpperCase,head)).join('')
}
//pointfree
var initials2=compose(join('.'),map(compose(toUpperCase,head)),splice(''))
