(factory => {
  if (typeof module == 'object' && typeof module.exports == 'object')
    module.exports = factory;
  else
    window.gt = factory(window);
})(window => {
var gt = {};
// basic utilities
const eh = "Glass Theme: ";
function d(msg) {
  console.log(msg);
}
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

    this.d = {}; this.postfix = {};
    this.a = {}; this.b = {};
    this.step = Math.ceil(duration / 40);
    this.from = from; this.to = to; this.element = element;
    this.timer = 0; this.progress = 0; this.last = {};
    this.static = true;
    this.callBk = null;
    for (var i in from) {
      if (typeof i != 'string' || typeof from[i] != 'string' || typeof to[i] != 'string')
        throw new Error(eh + 'every property or value should be a string');
      var m = from[i].match(/[a-z]+/) || to[i].match(/[a-z]+/);
      this.postfix[i] = m ? m[0] : '';
      this.d[i] = ((this.b[i] = parseInt(to[i])) - (this.a[i] = parseInt(from[i]))) / this.step;
      if (this.d[i])
        this.static = false;
    }
  }
  function f1(obj) {
    with (obj) {
      if (progress == 0) {
        for (var i in last)
          element.style[i] = from[i];
        timer = 0;
        if (callBk) callBk.call(element);
        return;
      }
      for (var i in last)
        element.style[i] = String((last[i] -= d[i]).toFixed(3)) + postfix[i];
      progress--;
      timer = setTimeout(f1, 40, obj);
    }
  };
  function f2(obj) {
    with (obj) {
      if (progress == step) {
        for (var i in last)
          element.style[i] = to[i];
        timer = 0;
        if (callBk) callBk.call(element);
        return;
      }
      for (var i in last)
        element.style[i] = String((last[i] += d[i]).toFixed(3)) + postfix[i];
      progress++;
      timer = setTimeout(f2, 40, obj);
    }
  };
  constP(gt.aniCtrlr.prototype, 'start', function (rev) {
    if (this.static) return;
    with (this) {
      if (timer)
        clearTimeout(timer);
      else {
        last = rev ? Object.assign({}, b) : Object.assign({}, a);
        progress = rev ? step : 0;
      }
      if (rev)
        timer = setTimeout(f1, 0, this);
      else
        timer = setTimeout(f2, 0, this);
      callBk = null;
      return { then: function (fn) {
        callBk = fn;
      } };
    }
  });
  constP(gt.aniCtrlr.prototype, 'abort', function (back) {
    clearTimeout(this.timer);
    this.timer = 0;
    var t = back ? this.from : this.to;
    for (var i in t)
      this.element.style[i] = this.t[i];
  });
})(gt, eh);

var ikIcon = function (img) {
  var eh = eh + 'When creating icon: ';
  var icon = document.createElement('div');
  icon.className = 'gt-icon';
  var arg1 = arguments[1], arg2 = arguments[2];
  var color = typeof arg1 == 'string' ? arg1 : (typeof arg2 == 'string' ? arg2 : null);
  var pos = typeof arg1 == 'object' ? arg1 : (typeof arg2 == 'object' ? arg2 : null);
  var h, w;

  if (img && img instanceof Element) {
    icon.appendChild(img);
    if (color) {
      throw new Error(eh + 'Element with color is not supported.');
    }
  }
  else if (typeof img == 'string') {
    var url = img;
    if (color) {
      if (color[0] == '-') {
        color = `var(-${color})`;
      }
      if (!pos) {
        throw new Error(eh + 'size & position are needed');
      }
      w = pos.w; h = pos.h;
      icon.style = `--cc: ${color}; -webkit-mask-image: url(${url}); -webkit-mask-position: -${pos.x}px -${pos.y}px; width: ${pos.w}px; height: ${pos.h}px`;
    }
    else {
      if (typeof pos == 'object') {
        icon.style = `background-image: url(${url}); background-position: -${pos.x}px -${pos.y}px; width: ${pos.w}px; height: ${pos.h}px`;
        w = pos.w; h = pos.h;
      }
      else {
        img = document.createElement('img');
        img.onload = function () {
          w = parseInt(img.width);
          h = parseInt(img.height);
        }
        icon.appendChild(img);
        img.src = url;
      }
    }
  }
  else {
    throw new Error(eh + "When creating Icon: 'img' should be an element or a url.");
  }

  constP(this, 'icon', function (size) {
    var ret = icon.cloneNode(true);
    if (size) {
      var wrap = document.createElement('div');
      wrap.appendChild(ret);
      wrap.style = `width: ${size.w}px; height: ${size.h}`;
      if (size.w && size.h) {
        ret.style.transform = `scaleX(${Number(size.w / pos.w).toFixed(2)}) scaleY(${Number(size.h / pos.h).toFixed(2)})`;
      } else {
        ret.style.transform = `scale(${size.w ? Number(size.w / pos.w).toFixed(2) : Number(size.h / pos.h).toFixed(2)})`;
        if (size.w) {
          size.h = size.w / w * h;
        }
        else {
          size.w = size.h / h * w;
        }
      }
      if (size.w < pos.w) {
        ret.style.marginLeft = `-${(pos.w - size.w) / 2}px`;
      }
      if (size.h < pos.h) {
        ret.style.marginTop = `-${(pos.h - size.h) / 2}px`;
      }
    }
    return ret;
  });
  constP(this, 'width', pos.w); constP(this, 'height', pos.h);
};

var ikIconGroup = function (layers) {
  var eh = eh + 'When creating icon group: ';
  var icon = document.createElement('div');
  var w = 0, h = 0;

  if (!layers instanceof Array || !layers.length) {
    throw new Error(eh + "Illeagal layer array.");
  }
  layers.map(function (item) {
    // {img, color}
    if (!item instanceof ikIcon) {
      throw new Error(eh + "Every layer should be an instance of iconKit.Icon");
    }
    w = w < item.width ? item.width : w;
    h = h < item.height ? item.height : h;
    if (item.mask) {
      var iconn = document.createElement("div");
      icon.style = `-webkit-mask-image: url(${item.mask.url}); -webkit-mask-position: -${item.mask.x}px -${item.mask.y}px; width: ${item.mask.w}px; height: ${item.mask.h}px`
      icon.className = 'gt-icon'
      iconn.appendChild(icon);
      icon = iconn;
    }
    icon.appendChild(item.icon());
  });
  icon.className = 'gt-icon-group';
  icon.style = `width: ${w}px; height: ${h}px`;

  constP(this, 'icon', function (size) {
    var ret = icon.cloneNode(true);
    if (size) {
      var wrap = document.createElement('div');
      wrap.appendChild(ret);
      wrap.style = `width: ${size.w}px; height: ${size.h}`;
      if (size.w && size.h) {
        ret.style.transform = `scaleX(${Number(size.w / w).toFixed(2)}) scaleY(${Number(size.h / h).toFixed(2)})`;
      } else {
        ret.style.transform = `scale(${size.w ? Number(size.w / w).toFixed(2) : Number(size.h / h).toFixed(2)})`;
        if (size.w) {
          size.h = size.w / w * h;
        }
        else {
          size.w = size.h / h * w;
        }
      }
      if (size.w < w) {
        ret.style.marginLeft = `-${(w - size.w) / 2}px`;
      }
      if (size.h < h) {
        ret.style.marginTop = `-${(h - size.h) / 2}px`;
      }
    }
    return ret;
  });
  constP(this, 'width', w);  constP(this, 'height', h);
};


var ikIconMap = function (url, config) {
  var eh = eh + 'When creating iconMap: ';
  var icons = [];
  if (typeof url != 'string') {
    throw new Error(eh + 'url should be a String');
  }
  if (typeof config != 'object') {
    throw new Error(eh + 'config should be an Object');
  }
  checkP(eh, config, ['width', 'height', 'rows']);
  checkPNumP(eh, config, ['width', 'height']);
  if (!config.rows instanceof Array || !config.rows.length) {
    throw new Error(eh + 'Illegal rows array');
  }

  var w = config.width, h = config.height, r = config.rows;
  var n = [];
  r.map(function (col, i) {
    var p = 0;
    col.map(function (item) {
      n[item.name] = new ikIcon(url, item.color, {x: p, y: i * h, w: w, h: h});
      p += w;
      if (item.hasMask) {
        n[item.name].mask = {url: url, x: p, y: i * h, w: w, h: h};
        p += w;
      }
    });
  });

  constP(this, 'getIcons', function () {
    var ret = [];
    [].slice.call(arguments).map(function (item) {
      ret.push(n[item]);
    });
    return ret;
  });
};

function ikIconAnim(src, width, height, frames, duration) {
  var icon = document.createElement('div');
  icon.style = `background-image: url('${src}'); width: ${width}px; height: ${height}px; transition: background-position ${duration.toFixed(3)} steps(${frames})`;
  this.icon = icon;
  var current = 0;
  
  constP(this, 'play', function (infinite) {
    if (infinite === undefined)
      infinite = true;  // default value
    icon.style.backgroundPosition
  });
  constP(this, 'playTo', function (frameId) {
    if (typeof frameId != 'number' || frameId < 0 || frameId >= frames)
      throw new Error('In playTo: illegal frame id.');
    icon.style.backgroundPosition = `0 ${frameId * width}px`;
  });
}

gt.iconKit = {
  Icon: ikIcon,
  IconGroup: ikIconGroup,
  IconMap: ikIconMap,
  IconAnimation: ikIconAnim
}
var tbkBar = function () {
  var ehh = eh + 'When creating tool bar: ';

  var bar = document.createElement('div');
  var outer = document.createElement('div');
  bar.className = 'gt-toolbar';
  outer.className = 'gt-toolbar-out';

  var els = [];
  var views = [].slice.apply(arguments);
  var thisObj = this;
  views.map(function (view, i) {
    if (!view instanceof tbkView) {
      throw new Error(ehh + 'Every view should be an instance of gt.toolbarKit.View');
    }
    view.barObj = thisObj;
    els.push(view.bind(outer));
    bar.appendChild(els[i]);
    els[i].style.display = 'none';
    views[i].aniIn = new gt.aniCtrlr(els[i], {opacity: '0', marginLeft: '20px'}, {opacity: '1', marginLeft: '0'}, 200);
    views[i].aniOut = new gt.aniCtrlr(els[i], {opacity: '1', marginLeft: '0'}, {opacity: '0', marginLeft: '-20px'}, 200);
  });
  els[0].style.display = 'block';
  
  outer.appendChild(bar);
  outer.style.width = bar.style.width = els[0].style.width;
  var stack = [];
  var title_el = [], ani1 = [], ani2 = [];
  stack.push(0);
  var exitHdl, offset = 0;
  
  constP(this, 'enter', function (id) {
    var eh = eh + 'When entering into another view: ';
    if (typeof id != 'number' || id <= 0 || id >= views.length) {
      throw new Error(eh + 'Illegal id');
    }
    if (views[id].onenter) {
      views[id].onenter(this);
    }
    var title = arguments[1];
    var last = stack[stack.length - 1];
    if (title) {
      var tool;
      offset = 40;
      if (stack.length != 1) {
        throw new Error(eh + 'You can only create title from main view');
      }
      if (typeof title != 'string' || !(tool = views[0].tools['t' + title])) {
        throw new Error(eh + 'Illegal tool name');
      }
      if (!tool instanceof tbkBtnTool) {
        throw new Error(eh + 'only button-like tool can be used as title');
      }
      if (!title_el[title]) {
        var t = document.createElement('div');
        t.appendChild(tool.currentIcon.cloneNode(true));
        t.className = 'gt-tool-title';
        t.style.backgroundColor = tool.color;
        var exit = this.exit;
        t.addEventListener("click", function () {
          exit();
        })
        outer.appendChild(t);
        title_el[title] = t;
        ani1[title] = new gt.aniCtrlr(els[0], {opacity: '1', marginLeft: '0'}, {opacity: '0', marginLeft: `-${tool.position * 40}px`}, 200);
        ani2[title] = new gt.aniCtrlr(t, {opacity: '0', marginLeft: `${tool.position * 40 + 5}px`}, {opacity: '1', marginLeft: '5px'}, 200);
      }
      title_el[title].style.display = 'block';
      els[id].style.display = 'block';
      
      var viewAni = new gt.aniCtrlr(els[id], {opacity: '0', marginLeft: `${tool.position * 40 + 40}px`}, {opacity: '1', marginLeft: `40px`}, 200);
      viewAni.start();
      ani1[title].start().then(function () {
        this.style.display = "none";
      });
      ani2[title].start();
      exitHdl = function () {
        els[0].style.display = "block";
        viewAni.start(true).then(function () {
          this.style.display = "none";
        });
        ani1[title].start(true);
        ani2[title].start(true).then(function () {
          this.style.display = "none";
        });
        offset = 0;
        stack.pop();
      }
    }
    else {
      views[id].aniIn.start();
      views[last].aniOut.start();
      if (stack.length == 1) exitHdl = null;
    }
    bar.style.width = outer.style.width = `${parseInt(els[id].style.width) + offset}px`;
    stack.push(id);
  });
  constP(this, 'exit', function () {
    if (stack.length == 1) return;
    if (stack.length == 2 && exitHdl)
      exitHdl();
    else {
      views[stack.pop()].aniIn.start(true).then(function () {
        this.style.display = "none";
      });
      var now = stack[stack.length - 1];
      els[now].style.display = "block";
      views[now].aniOut.start(true);
    }
    bar.style.width = outer.style.width = `${parseInt(els[stack[stack.length - 1]].style.width) + offset}px`;
  })
  
  constP(this, 'bar', outer);
};

// View类通用，包含视图切换函数，可以作为唯一的主视图与Bar实例绑定
// 自定义：onopen onclose
var tbkView = function () {
  var ehh = eh + 'When creating tool view: ';

  var view = document.createElement('div');
  var hover = document.createElement('div');
  view.className = 'gt-toolbar-view';
  hover.className = 'gt-toolbar-hover';
  view.appendChild(hover);
  var tools = [].slice.apply(arguments);
  var tools_wait = [];
  var els = [];
  var width = 0;
  var thisObj = this;
  tools.map(function (tool, i) {
    if (tool instanceof tbkGroup) {
      tools_wait.push(tool.barReady);
      tool.tools.map(function (tool) {
        els['t' + tool.name] = tool.tool;
        tools['t' + tool.name] = tool;
      })
    }
    else if (tool instanceof tbkBtnTool) {
      els['t' + tool.name] = els[i] = tool.tool;
      tools['t' + tool.name] = tool;
    } else {
      throw new Error(ehh + 'Every tool should be an instance of Tool');
    }

    tool.viewObj = thisObj;
    tool.position = i;
    view.appendChild(tool.tool);
    
    var ml = width + 2;
    width += tool.width;
    
    tool.tool.addEventListener('mouseenter', function () {
      hover.style.width = `${tool.width - 4}px`;
      hover.style.marginLeft = `${ml}px`;
      hover.style.filter = 'opacity(.1)';
    });
  });
  view.style.width = `${width}px`;
  
  view.addEventListener('mouseleave', function () {
    hover.style.filter = 'opacity(0)';
  });

  constP(this, 'elements', els);
  constP(this, 'tools', tools);
  var bound = false;
  constP(this, 'bind', function (outer) {
    if (bound) {
      throw new Error(eh + 'View can only be bound once');
    }
    bound = true;
    tools_wait.map(function (item) {
      item(outer);
    });

    return view;
  });
  constP(this, 'view', view);
};

// icons, name[, color][, useShadow]
var tbkBtnTool = function (icons, name) {
  var ehh = eh + 'When creating Tool: ';
  var color = '-fullR';
  if (!name || typeof name != 'string') {
    throw new Error(ehh + 'Illegal name.');
  }
  if (!icons instanceof Array || !icons.length) {
    throw new Error(ehh + 'Illegal icons array.');
  }

  var tool = document.createElement('div');
  tool.className = 'gt-tool-btn';
  color = arguments[typeof arguments[2] == 'string' ? 2 : 3] || color;
  if (color[0] == '-') {
    color = `var(-${color})`;
  }
  tool.style = `--ccc: ${color}`;
  var el = tool;
  if (arguments[2] === true || arguments[3] === true) {
    el = document.createElement('div');
    tool.appendChild(el);
    el.style.filter = 'drop-shadow(0 0 1px var(--fullR))';
  }

  var els = [];
  icons.map(function (icon, i) {
    if (!icon instanceof ikIcon && !icon instanceof ikIconGroup) {
      throw new Error(ehh + 'Every icon should be an instance of gt.iconKit.Icon or gt.iconKit.IconGroup');
    }
    if (icon.width != icon.height) {
      throw new Error(ehh + 'Every icon should be a square.');
    }
    els.push(icon.icon(icon.width == 30 ? null : {w: 30}));
    el.appendChild(els[i]);
    els[i].style.display = 'none';
  });

  var current = els[0], curId = 0;
  current.style.display = 'block';

  constP(this, 'name', name);
  constP(this, 'tool', tool);
  constP(this, 'color', color);
  constP(this, 'setIcon', function (id) {
    if (typeof id != 'number' || id < 0 || id >= els.length) {
      throw new Error(eh + 'When changing icon: illegal id.');
    }
    current.style.filter = 'opacity(0)';
    current = els[id];
    curId = id;
    current.style.filter = 'opacity(1)';
  });
  Object.defineProperties(this, {
    currentIcon: {
      get: function () {
        return current;
      }
    },
    currentId: {
      get: function () {
        return curId;
      }
    }
  });
};
constP(tbkBtnTool.prototype, 'width', 40);

var tbkGroup = function () {
  var eh = eh + 'When creating tool group: ';
  var tools = [].slice.call(arguments);
  var els = [];
  
  var group = document.createElement('div');
  var pop = document.createElement('div');
  group.className = 'gt-tool-group';
  pop.className = 'gt-tool-grouppop';
  pop.style.display = 'none';
  
  tools.map(function (item) {
    if (!item instanceof tbkBtnTool) {
      throw new Error(eh + 'Every tool should be an instance of gt.toolbarKit.BtnTool');
    }
    pop.appendChild(item.tool);
    els[item.name] = item.tool;
  });
  
  var t;
  var first = pop.firstChild;
  group.appendChild(first);
  
  group.addEventListener('mouseenter', function() {
    t = setTimeout(function () {
      group.className = 'gt-tool-group gt-acmlt';
      t = setTimeout(function () {
        pop.insertBefore(first, pop.firstChild);
        pop.style.display = 'block';
        pop.className = 'gt-tool-grouppop gt-pop';
        group.className = 'gt-tool-group';
      }, 500);
    }, 200);
  });
  
  var f0 = function () {
    if (t) {
      clearTimeout(t);
      t = 0;
      group.className = 'gt-tool-group';
    }
  };
  group.addEventListener('mouseleave', f0);
  group.addEventListener('click', f0);
  var thisObj = this;
  var f1 = function () {
    pop.className = 'gt-tool-grouppop';
    pop.style.display = 'none';
    group.appendChild(first);
    thisObj.viewObj.view.dispatchEvent(new MouseEvent('mouseleave'));
  };
  pop.addEventListener('mouseleave', f1);
  pop.addEventListener('click', f1);
  
  constP(this, 'elements', els);
  constP(this, 'tools', tools);
  constP(this, 'tool', group);
  constP(this, 'name', '[group]');
  constP(this, 'barReady', function(outer) {
    outer.appendChild(pop);
    var pos = thisObj.position;
    pop.style.marginLeft = `${pos * 40}px`;
    tools.map(function (tool) {
      tool.position = pos;
    })
  });
};
constP(tbkGroup.prototype, 'width', 40);

gt.toolbarKit = {
  Bar: tbkBar,
  View: tbkView,
  BtnTool: tbkBtnTool,
  Group: tbkGroup,
};

return gt;
});