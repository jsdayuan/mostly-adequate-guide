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

function _prop(label, obj) {
  return obj[label]
}
let prop = curry(_prop)

//关键点是把任意值丢到容器里 然后到处使用map的能力

// IO Test
function IO(value) {
  this.unsafePerformIO = value
}

IO.of = function (x) {
  return new IO(function () {
    return x
  })
}

IO.prototype.map = function (f) {
  return new IO(compose(f, this.unsafePerformIO))
}

let io_test = IO.of('hello ').map(concat('world'))
console.log(io_test.unsafePerformIO(), 'io_test')

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

console.log(Maybe.of(123).map(add(1)), 'maybe_test')

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

console.log(Either.of('not data').map(concat('123')), 'either_test')

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
    return x;
  });
}

// Example
// ===========================
//  cat :: IO (IO String)
var cat = compose(map(print), readFile);

cat(".git/config").unsafePerformIO().unsafePerformIO()
// IO(IO("[core]\nrepositoryformatversion = 0\n"))

//包了一层IO 显得怪怪的


//另一个例子

//正常的无嵌套
let normalMaybe = compose(map(prop('street')), map(prop(0)), map(prop('addresses')), Maybe.of)
console.log(normalMaybe(
  { addresses: [{ street: { name: 'Mulburry', number: 8402 }, postcode: "WC2N" }] }
), 'functor_maybe')

//monad
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
), 'monad')
// Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))

//这里的functor同样也是嵌套的 三个可能失败的地方都用了maybe
//嵌套的functor是monad的主要使用场景！！
//monad像洋葱 当我们用map剥开嵌套的functor获取里面的值时 就像剥洋葱一样让人忍不住想哭
//幸好我们有join

Maybe.prototype.join = function () {
  return this.isNothing() ? Maybe.of(null) : this._value
}

IO.prototype.join = function () {
  return this.unsafePerformIO()
}

let mmo = Maybe.of(Maybe.of('nun_chucks'))
console.log(mmo)
console.log(mmo.join(), 'join_maybe')

let ioio = IO.of(IO.of('hello world'))
console.log(ioio.unsafePerformIO().unsafePerformIO())
console.log(ioio.join().unsafePerformIO(), 'join_io')

//如果有两层相同的嵌套 就可以用join把他们压扁到一块去
//这种结合的能力 functor之间的联姻 就是monad之所以成为monad的原因

/**
 * monad是可以变扁（flatten）的pointed functor
 * 一个functor只要他有join和of方法 并遵循一些定律 那么他就是一个monad
 */

//把monad魔法作用到firstAddressStreet上

//Monad m => m(m a) -> m a
let join = function (mma) { return mma.join() }

let firstAddressStreet2 = compose(
  join, map(safeProp('street')), join, map(safeHead), safeProp('addresses')
)
console.log(firstAddressStreet2(
  { addresses: [{ street: { name: 'Mulburry', number: 8402 }, postcode: "WC2N" }] }
), 'monad_join')

