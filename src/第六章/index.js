console.log('实例代码')

//转变概念 声明式编程
//不再指出计算机如何工作  而是指出我们明确希望得到的结果

//Utils----------------------------

var Impure = {
  getJSON: _.curry(function(callback, url) {
    $.getJSON(url, callback);
  }),

  setHtml: _.curry(function(sel, html) {
    $(sel).html(html);
  })
};


var img = function (url) {
  return $('<img />', { src: url });
};

var trace = _.curry(function(tag, x) {
  console.log(tag, x);
  return x;
});

////////////////////////////////////////////

var url = function (t) {
  return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + t + '&format=json&jsoncallback=?';
};

var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var srcs = _.compose(_.map(mediaUrl), _.prop('items'));

var images = _.compose(_.map(img), srcs);

//compose(map(compose(img,mediaUrl)),prop('items'))  利用map的结合律将srcs与images合并成一行

var renderImages = _.compose(Impure.setHtml("body"), images);

var app = _.compose(Impure.getJSON(renderImages), url);

app("cats");

/**
 * 有原则的重构
 * 上面的代码有优化空间
 * 获取url的时候map了一次  生成img标签时map了一次  
 * 关于map和组合是有定律的
 */

 //map的组合律
 var law=compose(map(f,map(g)))==map(compose(f,g))
