console.log('类型签名')

//  strLength :: String -> Number
var strLength = function (s) {
  return s.length;
}

//  join :: String -> [String] -> String
var join = curry(function (what, xs) {
  return xs.join(what);
});

//  match :: Regex -> String -> [String]
var match = curry(function (reg, s) {
  return s.match(reg);
});

//  replace :: Regex -> String -> String -> String
var replace = curry(function (reg, sub, s) {
  return s.replace(reg, sub);
});

// ////////////////////////////////////

//  id :: a -> a
var id = function (x) {
  return x;
}

//  map :: (a -> b) -> [a] -> [b]
var map = curry(function (f, xs) {
  return xs.map(f);
});

/**
 * 这里的 id 函数接受任意类型的 a 并返回同一个类型的数据。和普通代码一样，我们也可以在类型签名中使用变量。把变量命名为 a 和 b 只是一种约定俗成的习惯，你可以使用任何你喜欢的名称。对于相同的变量名，其类型也一定相同。这是非常重要的一个原则，所以我们必须重申：a -> b 可以是从任意类型的 a 到任意类型的 b，但是 a -> a 必须是同一个类型。例如，id 可以是 String -> String，也可以是 Number -> Number，但不能是 String -> Bool。

相似地，map 也使用了变量，只不过这里的 b 可能与 a 类型相同，也可能不相同。我们可以这么理解：map 接受两个参数，第一个是从任意类型 a 到任意类型 b 的函数；第二个是一个数组，元素是任意类型的 a；map 最后返回的是一个类型 b 的数组。
 */


//一些其他的例子

//  head :: [a] -> a
var head = function (xs) {
  return xs[0];
}

//  filter :: (a -> Bool) -> [a] -> [a]
var filter = curry(function (f, xs) {
  return xs.filter(f);
});

//  reduce :: (b -> a -> b) -> b -> [a] -> b
var reduce = curry(function (f, x, xs) {
  return xs.reduce(f, x);
});

//自由定理
// head :: [a] -> a
compose(f, head) == compose(head, map(f));

// filter :: (a -> Bool) -> [a] -> [a]
compose(map(f), filter(compose(p, f))) == compose(filter(p), map(f));

// 类型约束