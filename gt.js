(factory => {
  if (typeof module == 'object' && typeof module.exports == 'object')
    module.exports = factory;
  else
    window.gt = factory(window);
})(window => {
var gt = {};
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
      console.log(222);
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

gt.iconKit = {
  Icon: ikIcon,
  IconGroup: ikIconGroup,
  IconMap: ikIconMap,
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
  var ani1 = [];
  console.log(views);
  views.map(function (view, i) {
    if (!view instanceof tbkView) {
      throw new Error(ehh + 'Every view should be an instance of gt.toolbarKit.View');
    }
    view.barObj = thisObj;
    els.push(view.bind(outer));
    ani1.push(new gt.aniCtrlr(els[i], {opacity: '0', marginLeft: `${i * 40}px`}, {opacity: '1', marginLeft: `0`}, 200));
    bar.appendChild(els[i]);
    els[i].style.display = 'none';
  });
  els[0].style.display = 'block';
  
  outer.appendChild(bar);
  outer.style.width = bar.style.width = els[0].style.width;
  var stack = [];
  var title_el = [], ani2 = [];
  stack.push(0);
  
  constP(this, 'enter', function enter (id) {
    var eh = eh + 'When entering into another view: ';
    if (typeof id != 'number' || id <= 0 || id >= views.length) {
      throw new Error(eh + 'Illegal id');
    }
    if (views[id].onenter) {
      views[id].onenter(this);
    }
    var title = arguments[1];
    if (title) {
      var tool;
      if (stack.length != 1) {
        throw new Error(eh + 'You can only create title from main view');
      }
      if (typeof title != 'string' || !(tool = views[0].tools['t' + title])) {
        console.log(views[0].tools);
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
        outer.appendChild(t);
        title_el[title] = t;
        ani2[title] = new gt.aniCtrlr(t, {opacity: '0', marginLeft: `${tool.position * 40 - 5}px`}, {opacity: '1', marginLeft: `0`}, 200);
      }
      title_el[title].style.display = 'block';
      els[id].style.display = 'block';
      ani1[id].start();
      ani1[stack[stack.length - 1]].start(true);
      if (title)
        ani2[title].start();
      bar.style.width = outer.style.width = els[id].style.width;
      stack.push(id);
    }
  });
  constP(this, 'exit', function () {
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