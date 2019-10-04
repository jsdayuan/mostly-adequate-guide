console.log('Applicative Functor')

function compose(...fns) {
  let [fn1, fn2, ...rest] = fns.reverse()
  function composed(...args) {
    return fn2(fn1(...args))
  }

  if (!rest.length) return composed
  return compose(...rest.reverse(), composed)
}

function curry(fn, len = fn.length) {
  return (function curried(prevArgs) {
    return function (...lastArgs) {
      let args = [...prevArgs, ...lastArgs]
      if (args.length >= len) return fn(...args)
      return curried(args)
    }
  })([])
}

function unboundMethod(methodName, len) {
  return curry(function (...args) {
    args.length = len
    let obj = args.pop()
    return obj[methodName](...args)
  }, len)
}

let _add = (a, b) => a + b;
let add = curry(_add)

let _prop = (name, obj) => obj[name]
let prop = curry(_prop)

function _test(c, v) {
  console.log(c, v)
  return v
}
let test = curry(_test)

let map = unboundMethod('map', 2)

//Container
function Container(x) {
  this.value = x
}

Container.of = function (x) {
  return new Container(x)
}

Container.prototype.map = function (f) {
  return Container.of(f(this.value))
}

Container.prototype.join = function () {
  return this.value
}

Container.prototype.chain = function (f) {
  return this.map(f).join()
}

//IO
function IO(x) {
  this.unsafePerformIO = x
}

IO.of = function (x) {
  return new IO(function () {
    return x
  })
}

IO.prototype.map = function (f) {
  return new IO(compose(f, this.unsafePerformIO))
}

IO.prototype.join = function () {
  return this.unsafePerformIO()
}

IO.prototype.chain = function (f) {
  return this.map(f).join()
}


//掘金Applicative-----------------------------------------------------
window.x = 1;
window.y = 2

const win = IO.of(window)

const xFromWindow = win.map(g => g.x)

const yFromWindow = win.map(g => g.y)

let applicativeTest = xFromWindow.chain(x => {
  return yFromWindow.map(add(x))
})

console.log(applicativeTest.unsafePerformIO(), 'applicativeTest')
//

// applicative 能让不同的functor互相应用

/**
 * 假设有两个不同类型的functor 我们想把这两者作为一个函数的两个参数传递过去来调用这个函数
 * 比如让两个Container的值相加
 * 可以借用chain函数来完成
 */

let testCon = Container.of(2).chain(x => {
  return Container.of(3).map(add(x))
})

console.log(testCon, 'testCon')

/**
 * 只不过这种方式有一种问题 那就是monad的顺序执行问题
 * 所有的代码都会在前一个monad执行完毕后才会执行
 * 这两个值是相互独立的 如果仅仅为了满足monad的顺序要求而延迟创建Container(3) 
 * 是非常没必要的
 */

/**
 * 瓶中之船
 * 能够把functor的函数值应用到另一个functor的值上 ap就是这样一种函数
 * 
 */

Container.prototype.ap = function (other_container) {
  return other_container.map(this.value)
}

let container_ap_test = Container.of(add(2)).ap(Container.of(3))
console.log(container_ap_test, 'container_ap_test')
//Container(5)

let container_ap_test2 = Container.of(2).map(add).ap(Container.of(3))
console.log(container_ap_test2, 'container_ap_test2')

/**
 * Container(3)从monad的牢笼中释放了出来
 *
 * 关于ap函数
 * this.value必须是一个函数
 * 将会接受另一个functor作为参数 因此我们只需map它
 */

//applicative特性
//F.of(x).map(f) == F.of(f).ap(F.of(x))

//另一个例子
IO.prototype.ap = function (functor) {
  return functor.map(this.unsafePerformIO())
}
// 帮助函数：
// ==============
//  $ :: String -> IO DOM
var $ = function (selector) {
  return new IO(function () { return document.querySelector(selector) });
}
//  getVal :: String -> IO String
var getVal = compose(map(prop('value')), $);

// Example:
// ===============
//  signIn :: String -> String -> Bool -> User
var signIn = curry(function (username, password, remember_me) {
  /* signing in */
  return {
    username,
    password,
    remember_me
  }
})

let ioApplicative = IO.of(signIn).ap(getVal('#email')).ap(getVal('#password')).ap(IO.of(false));
// IO({id: 3, email: "gg@allin.com"})

console.log(ioApplicative.unsafePerformIO())

/**
 * signIn 是一个接受三个参数的curry函数，因此我们需要调用ap三次
 * 在每一次ap调用中 signIn就收到一个参数然后运行
 * ap需要调用者及其参数都属于同一类型
 *
 * 函数式编程暂时告一段落
 */



