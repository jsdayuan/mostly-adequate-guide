console.log('特百惠 强大的容器')
/**
 * 如何书写函数式的程序 即通过管道把数据在一系列纯函数间传递
 */

function _curry(fn, len = fn.length) {
  return (function curried(prevArgs) {
    return function (...lastArgs) {
      let args = [...prevArgs, ...lastArgs]
      if (args.length >= len) {
        return fn(...args)
      }
      return curried(args)
    }
  })([])
}

function unboundMethod(methodName, len) {
  return _curry(function (...args) {
    let obj = args.pop()
    return obj[methodName](...args)
  }, len)
}

function _test(x, val) {
  console.log(x, val)
  return val
}
let test = _curry(_test)

function compose(...fns) {
  let [fn1, fn2, ...rest] = fns.reverse()

  function composed(...args) {
    return fn2(fn1(...args))
  }

  if (!rest.length) return composed
  return compose(...rest.reverse(), composed)
}

let match = unboundMethod('match', 2)
let map = unboundMethod('map', 2)

function _prop(label, obj) {
  return obj[label]
}
let prop = _curry(_prop)

function _add(a, b) {
  return a + b
}
let add = _curry(_add)

//创建一个容器

let Container = function (x) {
  this._value = x
}
Container.of = function (x) { return new Container(x) }

console.log(Container.of(3))

//第一个functor

// (a->b)->Container a -> Container b
Container.prototype.map = function (f) {
  return Container.of(f(this._value))
}

console.log(Container.of(5).map(x => x * 2))

//把值装进一个容器 且只能用map来处理它
//抽象


//薛定谔的Maybe

let Maybe = function (x) {
  this._value = x
}
Maybe.of = function (x) { return new Maybe(x) }

Maybe.prototype.isNothing = function () {
  return (this._value === null || this._value === undefined)
}

Maybe.prototype.map = function (fn) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this._value))
}

console.log(Maybe.of("Malkovich Malkovich").map(match(/a/ig)))
//=> Maybe(['a', 'a'])

console.log(Maybe.of(null).map(match(/a/ig)))
//=> Maybe(null)

console.log(Maybe.of({ name: "Boris" }).map(prop("age")).map(add(10)))
//=> Maybe(null)

console.log(Maybe.of({ name: "Dinah", age: 14 }).map(prop("age")).map(add(10)))
//=> Maybe(24)


//实际当中 Maybe最常用在那些可能会无法正确返回结果的函数中
// safeHead :: [a] -> Maybe a
let safeHead = function (xs) {
  return Maybe.of(xs[0])
}

var streetName = compose(map(prop('street')), safeHead, prop('addresses'));

console.log(streetName({ addresses: [] }));
// Maybe(null)

console.log(streetName({ addresses: [{ street: "Shady Ln.", number: 4201 }] }));
// Maybe("Shady Ln.")


//有时候函数可以明确表明一个Maybe（null） 来表明失败

// withdrew :: amount -> account -> Maybe account
let withdraw = _curry(function (amount, account) {
  return account.balance >= amount
    ? Maybe.of({ balance: account.balance - amount })
    : Maybe.of(null)
})

let remainingBalance = function (x) { return `Your balance is ${x}` }
let updateLedger = function (x) { return `$${x}` }

//  finishTransaction :: Account -> String
var finishTransaction = compose(remainingBalance, updateLedger, prop('balance')); // <- 假定这两个函数已经在别处定义好了

//  getTwenty :: Account -> Maybe(String)
var getTwenty = compose(map(finishTransaction), withdraw(20));


console.log(getTwenty({ balance: 200.00 }))
// Maybe("Your balance is $180.00")

console.log(getTwenty({ balance: 10.00 }))
// Maybe(null)


//释放容器里的值

/**
 * 应用程序所做的工作就是 获取 更改 保存数据 直到不再需要他们
 * 对数据做这些操作的函数有可能会被map调用
 * 这样的话 数据就不会离开它温暖舒适的容器
 */

//设置逃生口 maybe

// maybe :: b -> (a -> b) -> Maybe a -> b
let maybe = _curry(
  function (x, f, m) {
    return m.isNothing() ? x : f(m._value)
  }
)

// getTwenty2 :: Account -> String
let getTwenty2 = compose(
  maybe("You're broke!", finishTransaction),
  withdraw(20)
)

console.log(getTwenty2({ balance: 200.00 }))
console.log(getTwenty2({ balance: 10.00 }))

//纯错误处理 Either
console.log('///////////////////////////////////////////////////////////////')

function Left(x) {
  this._value = x
}

Left.of = function (x) {
  return new Left(x)
}

Left.prototype.map = function (f) {
  return this
}
// ---
function Right(x) {
  this._value = x
}

Right.of = function (x) {
  return new Right(x)
}

Right.prototype.map = function (f) {
  return Right.of(f(this._value))
}

//Left 和 Right 是我们 Either 抽象类型的两个子类

Right.of("rain").map(function(str){ return "b"+str; });
// Right("brain")

Left.of("rain").map(function(str){ return "b"+str; });
// Left("rain")

Right.of({host: 'localhost', port: 80}).map(prop('host'));
// Right('localhost')

Left.of("rolls eyes...").map(prop("host"));
// Left('rolls eyes...')


