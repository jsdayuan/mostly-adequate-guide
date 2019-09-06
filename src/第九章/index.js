console.log('monad～')

//pointed functor
//关于之前functor上的of方法 其实不是用来避免使用new关键字的 
//而是用来将值放到默认最小化上下文中的

function curry(fn, len = fn.length) {
  return (function curried(lastArgs) {
    return function (...prevArgs) {
      let args = [...lastArgs, ...prevArgs]
      if (args.length >= len) {
        return fn(...args)
      }
      return curried(args)
    }
  })([])
}

function unboundMethod(methodName, len) {
  return curry(function (...args) {
    args.length = len;
    let obj = args.pop();
    return obj[methodName](...args)
  }, len)
}

let concat = unboundMethod('concat', 2)
let map = unboundMethod('map', 2)

function compose(...fns) {
  let [fn1, fn2, ...rest] = fns.reverse()

  let composed = function (...args) {
    return fn2(fn1(...args))
  }

  if (!rest.length) {
    return composed
  }
  return compose(...rest.reverse(), composed)
}

function _add(a, b) {
  return a + b
}
let add = curry(_add)

function _test(x, v) {
  console.log(x, v)
  return v
}
let test = curry(_test)
//关键点是把任意值丢到容器里 然后到处使用map的能力

// IO Test
function IO(value) {
  this._value = value
}

IO.of = function (x) {
  return new IO(function () {
    return x
  })
}

IO.prototype.map = function (f) {
  return new IO(compose(f, this._value))
}

let io_test = IO.of('hello ').map(concat('world'))
console.log(io_test._value())

//Maybe Test
function Maybe(x) {
  this._value = x
}

Maybe.of = function (x) {
  return new Maybe(x)
}

Maybe.prototype.isNothing = function () {
  return this._value === undefined || this._value === null
}

Maybe.prototype.map = function (f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this._value))
}

console.log(Maybe.of(123).map(add(1)))

//Either Test
function Either(x) {
  this._value = x
}

Either.of = function (x, f = isNothing) {
  return f(x) ? Left.of(x) : Right.of(x)
}

function isNothing(x) {
  return x === undefined || x === null
}


function Left(x) {
  this._value = x
}

Left.of = function (x) {
  return new Left(x)
}

Left.prototype.map = function () {
  return this
}

function Right(x) {
  this._value = x
}

Right.of = function (x) {
  return new Right(x)
}

Right.prototype.map = function (f) {
  return Right.of(f(this._value))
}

console.log(Either.of('not data').map(concat('123')))

/**
 * IO的构造器接受一个函数作为参数 Maybe和Either可以接受任意类型
 * 实现这种接口的动机是 我们希望能有一种通用的、一致的方式往functor里面填值
 * 
 * (pure point unit return) of 史上最神秘的函数
 * of将在开始使用monad时十分重要 因为到后面 手动把值放回容器是我们自己的责任
 */

// Support
// ===========================

//  readFile :: String -> IO String
var readFile = function (filename) {
  return new IO(function () {
    return filename
  });
};

//  print :: String -> IO String
var print = function (x) {
  return new IO(function () {
    console.log(x);
    return x;
  });
}

// Example
// ===========================
//  cat :: IO (IO String)
var cat = compose(map(print), readFile);

cat(".git/config")._value()._value()
// IO(IO("[core]\nrepositoryformatversion = 0\n"))

//包了一层IO 显得怪怪的

//  safeProp :: Key -> {Key: a} -> Maybe a
var safeProp = curry(function (x, obj) {
  return new Maybe(obj[x]);
});

//  safeHead :: [a] -> Maybe a
var safeHead = safeProp(0);

//  firstAddressStreet :: User -> Maybe (Maybe (Maybe Street) )
var firstAddressStreet = compose(
  map(map(safeProp('street'))), map(safeHead), safeProp('addresses')
);

console.log(firstAddressStreet(
  { addresses: [{ street: { name: 'Mulburry', number: 8402 }, postcode: "WC2N" }] }
))
// Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))

