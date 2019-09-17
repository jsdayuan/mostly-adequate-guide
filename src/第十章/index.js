console.log('Applicative')

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

let _add = (a, b) => a + b;
let add = curry(_add)

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