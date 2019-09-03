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

let split = unboundMethod('split', 2)

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
let filter = unboundMethod('filter', 2)
let concat = unboundMethod('concat', 2)

function _prop(label, obj) {
  return obj[label]
}
let prop = _curry(_prop)

function _add(a, b) {
  return a + b
}
let add = _curry(_add)

let id = id => id

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

Right.of("rain").map(function (str) { return "b" + str; });
// Right("brain")

Left.of("rain").map(function (str) { return "b" + str; });
// Left("rain")

Right.of({ host: 'localhost', port: 80 }).map(prop('host'));
// Right('localhost')

Left.of("rolls eyes...").map(prop("host"));
// Left('rolls eyes...')

var either = function (f, g, e) {
  switch (e.constructor) {
    case Left: return f(e._value);
    case Right: return g(e._value)
  }
}


console.log('///////////////////////////////////////////////////////////////')
/**
 * 王老先生有作用
 */

//通过包裹将一个函数变成纯函数
function getFormStorage(key) {
  return function () {
    return localStorage[key]
  }
}

// functor

let IO = function (f) {
  this._value = f
}

IO.of = function (x) {
  return new IO(function () {
    return x
  })
}

IO.prototype.map = function (f) {
  return new IO(compose(f, this._value))
}

//不同的点在于 _value总是一个函数
//延迟执行这个非纯动作

// io_window :: IO [window]
let io_window = IO.of(window)

let io_window_width = io_window.map(function (win) { return win.innerWidth })
console.log(io_window_width._value())

let io_window_href = io_window.map(prop('location')).map(prop('href')).map(split('/'))
console.log(io_window_href._value())


////// 纯代码库: lib/params.js ///////

//  url :: IO String
var url = new IO(function () { return window.location.href; });

//  toPairs =  String -> [[String]]
var toPairs = compose(map(split('=')), split('&'));

function _last(arr) {
  return arr[arr.length - 1]
}
//  params :: String -> [[String]]
var params = compose(toPairs, _last, split('?'));

let eq = _ => _ //暂不实现
let head = (arr) => arr[0]
//  findParam :: String -> IO Maybe [String]
var findParam = function (key) {
  // return map(compose(Maybe.of, filter(compose(eq(key), head)), params), url);  *********
};

////// 非纯调用代码: main.js ///////

// 调用 __value() 来运行它！
// findParam("searchTerm")._value();  *********

// Maybe(['searchTerm', 'wafflehouse'])

/**
 * 把url包裹在IO里 然后把它传递给他的调用者
 * IO(Maybe([String])) 有三层functor
 * （Array）是最有资格成为mappable的容器类型
 * map functor 让值在不离开容器的情况下修改值
 * monad 一种值类型
 * 
 * _value 像是手榴弹的弹拴 只应该被调用者以最公开的方式拉动 可以将它更名为unsafePerformIO
 */


//异步任务


//一些理论
// map(id) === id 同一律
// compose(map(f), map(g)) === map(compose(f, g)) 结合律

/**
 * 同一律很简单 也很重要 因为这些定律都是可运行的代码 完全可以在我们自己的functor上试验他们
 */

let idLaw1 = map(id)
let idLaw2 = id

console.log(idLaw1(Container.of(2)))
console.log(idLaw2(Container.of(2)))

//Container 2

//组合
let compLaw1 = compose(map(concat('world')), map(concat('hello')))
let compLaw2 = map(compose(concat('world'), concat('hello')))

console.log(compLaw1(Container.of('')))
console.log(compLaw2(Container.of('')))

//Container hello world


/**
 * 在范畴学中 functor接受一个范畴的对象和态射 然后把他们映射到另一个范畴里去
 * 这个新范畴一定会有一个单位元 也一定能够组合态射
 * 把范畴想象成一个有着多个对象的网络 对象之间靠态射链接 
 * functor可以把一个范畴映射到另一个 而且不会破坏原有的网络
 */

 /**
  * maybe范畴：每个对象都有可能不存在 每个态射都有空值检查的范畴
  * 在代码中的实现方式是map包裹每一个函数 用functor包裹每一个类型
  * 代码中的functor实际上是把范畴映射到了一个包含类型和函数的子范畴
  */