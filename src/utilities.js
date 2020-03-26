// basic utilities
const eh = "Glass Theme: ";
function constP(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    configurable: false
  });
}
function checkP(eh, obj, arr) {
  arr.map(function (item) {
    if (!obj[item]) {
      throw new Error(eh + `property '${item}' lost`);
    }
  });
}
function checkPNumP(eh, obj, arr) {
  arr.map(function (item) {
    if (typeof obj[item] != 'number' || obj[item] <= 0) {
      throw new Error(eh + `Illegal property '${item}'`);
    }
  });
}

// animation utilities, public
// 已知动画：工具栏移动色块动画、view切换动画(双对象)、工具切换图标(单次动画)
((gt, eh) => {
  // animation controller class with separated timer
  // duration(ms)
  gt.aniCtrlr = function (element, from, to, duration) {
    var timer = 0;
    var eh = eh + 'When starting animation: ';
    if (typeof element != 'object' || typeof from != 'object' || typeof to != 'object' || typeof duration != 'number')
      throw new Error(eh + 'invalid args.');

    var d = {}, postfix = {};
    var a = {}, b = {};
    var fns = []; 
    const step = Math.ceil(duration / 40);
    var process, last;
    for (var i in from) {
      if (typeof i != 'string' || typeof from[i] != 'string' || typeof to[i] != 'string')
        throw new Error(eh + 'every property or value should be a string');
      var m = from[i].match(/[a-z]+/);
      postfix[i] = m ? m[0] : '';
      d[i] = ((b[i] = parseInt(to[i])) - (a[i] = parseInt(from[i]))) / step;
    }
    var f1 = function () {
      if (process == 0) {
        for (var i in last)
          element.style[i] = from[i];
        fns.map(fn => fn());
        timer = 0;
        return;
      }
      for (var i in last)
        element.style[i] = String(last[i] -= d[i]) + postfix[i];
      process--;
      timer = setTimeout(f1, 40);
    };
    var f2 = function () {
      if (process == step) {
        for (var i in last)
          element.style[i] = to[i];
        fns.map(fn => fn());
        timer = 0;
        return;
      }
      for (var i in last)
        element.style[i] = String((last[i] += d[i]).toFixed(3)) + postfix[i];
      process++;
      timer = setTimeout(f2, 40);
    };
    
    constP(this, 'start', function (rev) {
      if (timer)
        clearTimeout(timer);
      else {
        last = rev ? new Object(b) : new Object(a);
        process = rev ? step : 0;
      }
      if (rev)
        timer = setTimeout(f1, 40);
      else
        timer = setTimeout(f2, 40);
    });
    constP(this, 'abort', function (back) {
      clearTimeout(timer);
      timer = 0;
      var t = back ? from : to;
      for (var i in t)
        element.style[i] = t[i];
    });
    constP(this, 'then', function (fn) {
      fns.push(fn);
      return this;
    })
  }
})(gt, eh);