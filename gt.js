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
/* ((gt, eh) => {
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
})(gt, eh); */

var res = {};
var maps = [];
var unmMask = {};
var retina = window.devicePixelRatio == 2;

// TYPE: 0image 1spriteMap 2liveSprite

gt.loadImage = function (name, path, path2x) {
  if (typeof path != 'string' || typeof path2x != 'string') throw new Error(eh + "image path should be a string.");
  if (res[name]) throw new Error(eh + `resourse name repeat: ${name}`);

  var p = new Promise(function (rsv, rej) {
    res[name] = {type: 0, path: retina && path2x ? path2x : path};
    var image = new Image();
    image.onload = function() {
      res[name].w = image.width;
      res[name].h = image.height;
      rsv();
    };
    image.src = path;
  });
  return p;
};

gt.loadSpriteMap = function (info, path, path2x) {
  var ehh = eh + "when loading sprite map:";
  path = retina && path2x ? path2x : path;
  if (typeof path != 'string' || typeof path2x != 'string') throw new Error(ehh + "sprite map path should be a string.");

  var p = new Promise(function (rsv, rej) {
    function ok(rsv) {
      checkP(ehh, info, ['width', 'height', 'rows']);
      checkPNumP(ehh, info, ['width', 'height']);
  
      if (!info.rows instanceof Array || !info.rows.length) {
        throw new Error(ehh + 'Illegal rows array');
      }
    
      var w = info.width, h = info.height, r = info.rows, i = 0;
      r.map(function (col) {
        var j = 0;
        col.map(function (item) {
          if (res[item.name]) throw new Error(ehh + `resourse name repeat: ${name}`);
  
          var name = item.name;
          res[name] = {type : 1, path : maps.length, color : item.color, x : j, y : i, w : w, h : h};
          if (unmMask[name]) res[name].mask = unmMask[name];
          j += w;
        });
        i += h;
      });
      if (info.masks) {
        if (!info.masks instanceof Array) {
          throw new Error(ehh + 'Illegal masks array');
        }

        r = info.masks;
        r.map(function (col) {
          var j = 0;
          col.map(function (item) {
            item.split(',').map(function (item) {
              if (res[item])
                res[item].mask = {path : maps.length, x : j, y : i, w : w, h : h};
              else
                unmMask[item] = {path : maps.length, x : j, y : i, w : w, h : h};
              j += w;
            });
          });
          i += h;
        });
      }
      
      var img = new Image();
      img.onload = function () {
        maps.push({path : path, w : img.width, h : img.height});
        rsv();
      };
      img.src = path;
    }
    if (typeof info == "string") {
      var xhr = new XMLHttpRequest();
      xhr.open('get', info);
      xhr.onload = function () {
        info = JSON.parse(xhr.responseText);
        ok(rsv);
      }
      xhr.send();
    }
    else if (typeof info == "object") ok(rsv);
    else
      throw new Error(ehh + "json path should be a string");
  });
  return p;
}

function cssImage(name) {
  var o = res[name];
  var path = o.type ? maps[o.path].path : o.path;
  var style;
  if (o.color) {
    var color = o.color;
    if (color[0] == '-') {
      color = `var(-${color})`;
    }
    style = `--cc: ${color}; -webkit-mask-image: url(${path}); width: ${o.w}px; height: ${o.h}px;`;
    if (o.type) style += `-webkit-mask-position: -${o.x}px -${o.y}px;`;
    if (retina) style += `-webkit-mask-size: ${maps[o.path].w / 2}px ${maps[o.path].h / 2}px`;
  }
  else {
    icon.style = `background-image: url(${path}); width: ${o.w}px; height: ${o.h}px;`;
    if (o.type) style += `background-position: -${o.x}px -${o.y}px;`;
    if (retina) style += `background-size: ${maps[o.path].w / 2}px ${maps[o.path].h / 2}px`;
  }

  return style;
}
function cssMask(name) {
  if (!res[name].mask) return;
  var o = res[name].mask;
  var style = `-webkit-mask-image: url(${maps[o.path].path}); width: ${o.w}px; height: ${o.h}px; -webkit-mask-position: -${o.x}px -${o.y}px; position: absolute;`
  if (retina) style += `-webkit-mask-size: ${maps[o.path].w / 2}px ${maps[o.path].h / 2}px`;
  return style;
}

gt.loadLiveSprite = function (name, path, path2x) {
  var ehh = eh + "when loading live sprite:";
  path = retina && path2x ? path2x : path;
  if (typeof path != 'string' || typeof path2x != 'string') throw new Error(ehh + "sprite path should be a string.");

  
}
/* var tbkBar = function () {
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
      if (!tool instanceof tbkTool) {
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
*/
class tbkOther {
  #width;
  get width() { return this.#width; };

  constructor (width) {
    this.#width = width;
  }
}

class tbkBar {
  views = {};
  #count = 0;
  #bar = document.createElement("div");
  #stack = [];
  get count() { return this.#count; };
  get bar() { return this.#bar; };

  constructor(view) {
    if (!(view instanceof tbkView))
      throw new Error(eh + 'Please append gt.toolbar.View to Bar');
    this.views[view.name] = view;
    var e = view.view;
    e.style.zIndex = '0';
    this.#bar.appendChild(e);
    this.#bar.className = 'gt-toolbar';
    this.#bar.style.width = `${view.width}px`;
    this.#stack.push(view);
    this.#stack.top = function () {
      return this[this.length - 1];
    }
  }

  append(view) {
    if (!(view instanceof tbkView))
      throw new Error(eh + 'Please append gt.toolbar.View to Bar');
    this.views[view.name] = view;
    var e = view.view;
    e.style = `width: ${view.width}px; filter: opacity(0); z-index: -1; margin-left: 20px`;
    this.#bar.appendChild(e);
  }
  enter(viewName, titleTool) {
    var view = this.views[viewName], title, now = this.#stack.top();
    var ehh = eh + 'when entering into another view:';
    if (!view) throw new Error(ehh + 'inexistent view');

    if (titleTool) {
      title = now.tools[titleTool];
      if (!title) throw new Error(ehh + 'inexistent tool');
      if (title.tool.width != 40) throw new Error(ehh + 'illegal tool');

      now.view.style = `width: ${title.l + 40}px; z-index: ${this.#stack.length}; margin-left: -${title.l}px; background-color: var(--priC)`;
      now.disabled = true;
      this.#stack.push(view);
      view.view.style = `width: ${view.width}px; z-index: ${this.#stack.length}; margin-left: 40px; box-shadow: 1px 0 4px 2px var(--bgC)`;
      this.#bar.style.width = `${view.width + 40}px`;
    }
    else {
      now.view.style = `width: ${now.view.width}px; filter: opacity(0); z-index: ${this.#stack.length}; margin-left: -20px`;
      this.#stack.push(view);
      view.view.style = `width: ${view.width}px; z-index: ${this.#stack.length}; margin-left: 0`;
      this.#bar.style.width = `${view.width}px`;
    }
  }
  exit() {
    if (!this.#stack.length) return;
    var now = this.#stack.pop();
    now.view.style = `width: ${now.width}px; filter: opacity(0); z-index: -1; margin-left: 20px`;
    now = this.#stack.top();
    now.view.style = `width: ${now.width}px; z-index: ${this.#stack.length}; margin-left: 0`;
    now.disabled = false;
    this.#bar.style.width = `${now.width}px`;
  }
}

// 自定义：onopen onclose
var viewC = 0;
class tbkView {
  tools = {};
  disabled = false;
  #count = 0;
  #width = 0;
  #view = document.createElement("div");
  #name;
  get count() { return this.#count; };
  get width() { return this.#width; };
  get name() { return this.#name; };
  get view() { return this.#view; };

  constructor(name) {
    var view = this.#view, tools = this.tools, hover = null, thisObj = this;
    view.className = 'gt-toolbar-view';
    var vc = viewC++;
    view.innerHTML += `<div id="viewhover-${vc}" class="gt-toolbar-hover"></div>`;
    view.addEventListener('mouseover', function (e) {
      if (thisObj.disabled) return;
      if (!hover) hover = document.getElementById(`viewhover-${vc}`);
      var t = tools[e.target.id.split('-')[2] || '-'];
      if (!t) return;
      console.log(e.target.id);
      hover.style.filter = 'opacity(.2)';
      hover.style.marginLeft = `${t.l + 2}px`;
      hover.style.width = `${t.tool.width - 4}px`;
    });
    view.addEventListener('mouseleave', function (e) {
      if (!hover) hover = document.getElementById(`viewhover-${vc}`);
      if (e.target == view)
        hover.style.filter = 'opacity(0)';
    });
    view.addEventListener('click', function (e) {
      if (thisObj.disabled) return;
      var t = tools[e.target.id.split('-').pop()];
      if (t && t.click) t.click();
    })

    this.#name = name;
  }

  append(toolObj, click) {
    if (!(toolObj instanceof tbkTool || toolObj instanceof tbkGroup || toolObj instanceof tbkOther))
      throw new Error(eh + 'illegal tool');
    if (this.tools[toolObj.name]) throw new Error(eh + 'tool name repeat: ' + toolObj.name);
    this.#view.innerHTML += toolObj.tool;
    this.tools[toolObj.name] = {tool : toolObj, click : click, l : this.#width};
    this.#width += toolObj.width;
    this.#view.style.width = `${this.#width}px`;
    this.#count++;
  }
};

class tbkTool {
  #color; #name; #tool;
  get width() { return 40; };
  get name() { return this.#name; };
  get tool() { return this.#tool; };
  get color() { return this.#color; };
  
  // name icon [attach color shadow]
  constructor(obj) {
    var ehh = eh + 'When creating Tool: ';
    if (!obj || typeof obj != 'object') throw new Error(ehh + 'Illegal parameter.');
    if (!obj.name || typeof obj.name != 'string') throw new Error(ehh + 'Illegal name.');
    if (!obj.icon || typeof obj.icon != 'string' || !res[obj.icon]) throw new Error(ehh + 'Illegal icon.');
    if (obj.attach && (typeof obj.attach != 'string' || !res[obj.attach])) throw new Error(ehh + 'Illegal attachment icon');

    var color = obj.color || '-halfR';
    if (color[0] == '-') {
      color = `var(-${color})`;
    }
    var tool = `<div id="tool-${obj.name}" style="--ccc: ${color}" class="gt-tool">`;
    if (obj.shadow)
      tool += '<div style="drop-shadow(0 0 1px var(--fullR))">';
    tool += '<div id="tool-m-' + obj.name + '" style="' + (obj.attach ? cssMask(obj.attach) : `width: ${res[obj.icon].w}px; height: ${res[obj.icon].h}px; position: absolute;`) + `"><div id="tool-a-${obj.name}" style="${cssImage(obj.icon)}" class="gt-icon"></div></div><div id="tool-b-${obj.name}"`;
    if (obj.attach) tool += ` style="${cssImage(obj.attach)}"`;
    tool += ' class="gt-icon"></div></div>';
    if (obj.shadow) tool += '</div>';

    this.#color = color;
    this.#name = obj.name;
    this.#tool = tool;
  }
  turnOn() {
    document.getElementById('tool-' + this.#name).className = 'gt-tool-btn gt-rev';
  }
  turnOff() {
    document.getElementById('tool-' + this.#name).className = 'gt-tool-btn';
  }
  attach(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When attaching icon: Illegal icon');
    document.getElementById('tool-b-' + this.#name).style = cssImage(icon);
    if (res[icon].mask) document.getElementById('tool-m-' + this.#name).style = cssMask(icon);
  }
  change(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When changing icon: Illegal icon');
    document.getElementById('tool-a-' + this.#name).style = cssImage(icon);
  }
};

var tbkGroup = function () {
  var ehh = eh + 'When creating tool group: ';
  var tools = [].slice.call(arguments);
  var els = [];
  
  var group = document.createElement('div');
  var pop = document.createElement('div');
  group.className = 'gt-tool-group';
  pop.className = 'gt-tool-grouppop';
  pop.style.display = 'none';
  
  tools.map(function (item) {
    if (!item instanceof tbkTool) {
      throw new Error(ehh + 'Every tool should be an instance of gt.toolbarKit.BtnTool');
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
// constP(tbkGroup.prototype, 'width', 40);

gt.toolbar = {
  Bar: tbkBar,
  View: tbkView,
  Tool: tbkTool,
  Group: tbkGroup,
};

return gt;
});