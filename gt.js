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
var mainElement = document.body;
gt.setMainElement = function (element) {
  if (!(element instanceof Element)) throw new Error(eh + "please use an element object as main element");
  mainElement = element;
}
var global_click_subscribers = [];
document.body.addEventListener("click", function (e) {
  global_click_subscribers.map(function (fn) {
    fn(e);
  });
})
gt.subscribeClick = function (fn) {
  global_click_subscribers.push(fn);
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
              });
              j += w;
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
    style = `background-image: url(${path}); width: ${o.w}px; height: ${o.h}px;`;
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
/*
场景：toolbar group的弹出（原地，blur）
    数据点预览（居中，replace）
    部分应用的预览（原地，replace）
    用户头像的用户资料预览（原地）
custom:
  preserve:Boolean
  resistance:Object
  position:Object
  appendTo:Element
*/
class Pop {
  mousemoveHandler;
  mouseleaveHandler;
  clickHandler;

  constructor(pop_up, custom, onShow, onHide) {
    if (!pop_up instanceof Element) throw new Error(eh + "wrong pop up element used to create Pop");
    if (!~pop_up.style.width.search('px') || (!~pop_up.style.height.search('px') && !(~pop_up.style.maxHeight.search('px') && ~pop_up.style.minHeight.search('px'))))
      throw new Error(eh + "size of pop-up element should be absolute digital");
    var presrv = null, resis = {};
    if (custom) {
      if (custom.resistance) resis = custom.resistance;
      if (custom.preserve) {
        presrv = custom.position || {x: 0, y: 0};
        if (!custom.appendTo) throw new Error(eh + "original element need to be appended to an element in the pop-up element when you choose to preserve it");
      }
    }

    var timer1 = 0, timer2 = 0, timer3 = 0, timer_fatal = 0, break_promise = false, now, origin, showing = false;
    var fix1 = document.createElement("div"), fix2 = document.createElement("div"), fix2inside = document.createElement("div");
    fix1.className = 'gt-fix1'; fix1.style.display = 'none';
    mainElement.appendChild(fix1);
    fix2inside.appendChild(pop_up);
    fix2inside.className = 'gt-fix2-inside';
    fix2.appendChild(fix2inside);
    mainElement.appendChild(fix2);
    fix2.className = 'gt-fix2'; fix2.style.display = 'none';

    var w1 = 0, h1 = 0, x1, y1;
    var w2 = parseInt(pop_up.style.width),
    h21 = parseInt(pop_up.style.height) || parseInt(pop_up.style.minHeight),
    h22 = parseInt(pop_up.style.height) || parseInt(pop_up.style.maxHeight);
    var area = {}, fix11, fix12, fix21, fix22, fix23;

    if (resis.left == undefined) resis.left = -(1 << 30);
    if (resis.right == undefined) resis.right = 1 << 30;
    if (resis.top == undefined) resis.top = -(1 << 30);
    if (resis.bottom == undefined) resis.bottom = 1 << 30;
    if (resis.right - resis.left < w2) throw new Error(eh + "resistance area can not contain pop up element in width");
    area.x1 = resis.left + w2 / 2; area.x2 = resis.right - w2 / 2;
    if (resis.bottom - resis.top < h21) throw new Error(eh + "resistance area can not contain pop up element in height");
    area.y1 = resis.top + h21 / 2; area.y2 = resis.bottom - h21 / 2;

    function get_nearest(a, b, c) {
      return c < a ? a : (c > b ? b : c)
    }
    function calc() {
      var x, y, h2;
      fix11 = fix12 = `width: ${w1.toFixed(3)}px; height: ${h1.toFixed(3)}px; `;
      fix11 += (fix21 = `left: ${x1.toFixed(3)}px; top: ${y1.toFixed(3)}px; `);
      if (presrv) {
        let ox = w1 + w2 / 2 - presrv.x, oy = h1 + h21 / 2 - presrv.y;
        x = get_nearest(area.x1, area.x2, x1 + ox) - ox;
        y = get_nearest(area.y1, area.y2, y1 + oy) - oy;
        fix12 += `left: ${x.toFixed(3)}px; top: ${y.toFixed(3)}px; transform: scale(1);`;
        fix22 = `left: ${(x - presrv.x).toFixed(3)}px; top: ${(y -= presrv.y).toFixed(3)}px; `;
      }
      else {
        x = get_nearest(area.x1, area.x2, x1 + w1 / 2);
        y = get_nearest(area.y1, area.y2, y1 + h1 / 2);
        fix12 += `left: ${(x - w1 / 2).toFixed(3)}px; top: ${(y - h1 / 2).toFixed(3)}px; filter: opacity(0); `;
        fix22 = `left: ${(x - w2 / 2).toFixed(3)}px; top: ${(y - h21 / 2).toFixed(3)}px; `;
      }
      fix22 += `width: ${w2.toFixed(3)}px; height: ${(h2 = Math.min(h22, resis.bottom - y + h21 / 2)).toFixed(3)}px; filter: opacity(1);`;
      if (w2 / w1 < h2 / h1) { // taller, scale using width
        fix21 += `width: ${w2.toFixed(3)}px; height: ${(h1 * w2 / w1).toFixed(3)}px; transform: scale(${(w1 / w2).toFixed(3)});`;
        fix23 = `margin-top: -${((h2 - h1 * w2 / w1) / 2).toFixed(3)}px;`;
        if (!presrv) fix12 += `transform: scale(${(w2 / w1).toFixed(3)});`;
      }
      else {
        fix21 += `width: ${(w1 * h2 / h1).toFixed(3)}px; height: ${h2.toFixed(3)}px; transform: scale(${(h1 / h2).toFixed(3)});`;
        fix23 = `margin-left: -${((w2 - w1 * h2 / h1) / 2).toFixed(3)}px;`;
        if (!presrv) fix12 += `transform: scale(${(h2 / h1).toFixed(3)});`;
      }
      if (custom && custom.popupStyle) {
        fix21 += custom.popupStyle;
        fix22 += custom.popupStyle;
      }
    }

    this.mousemoveHandler = function (wrapElement) {
      if (break_promise || timer3) return;
      if (timer2) {
        clearTimeout(timer2); timer2 = 0;
        wrapElement.className = wrapElement.className.slice(0, -14);
        break_promise = true;
        return;
      }
      if (timer1) clearTimeout(timer1);
      timer1 = setTimeout(() => {
        // 开始蓄力，进行预备运算
        timer2 = setTimeout(() => {
          // 蓄力完成，转移元素
          setTimeout(() => {
            // fix1开始反弹，fix2预备
            timer_fatal = setTimeout(() => {
              // 反弹完成，fix12开始展示
              timer_fatal = setTimeout(() => {
                // 展示完成，触发展示事件，可以开始相应的加载
                timer_fatal = 0;
                showing = true;
                if (presrv) {
                  custom.appendTo.appendChild(origin);
                  fix1.style = 'z-index: 90; transform: scale(1);';
                }
                else
                  fix1.style = fix12 + 'z-index: 90;';
                if (onShow) onShow([wrapElement, origin, pop_up]);
              }, 300);
              fix1.style = fix12;
              fix2.style = fix22;
              fix2inside.style = '';
            }, 300);
            fix1.style.transform = 'scale(1)';
            fix2.style = fix21;
            fix2inside.style = fix23;
          }, 0);
          timer2 = 0;
          fix1.style = fix11;
          now = wrapElement;
          origin = wrapElement.firstChild;
          fix1.appendChild(origin);
          wrapElement.className = wrapElement.className.slice(0, -14);
        }, 500);
        timer1 = 0;
        var pos = wrapElement.getBoundingClientRect();
        if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1)
          w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
          calc();
        wrapElement.className += ' gt-pop-accmlt';
      }, 100);
    };
    this.mouseleaveHandler = function () {
      if (timer1) {
        clearTimeout(timer1);
        timer1 = 0;
      }
      break_promise = false;
    };
    this.clickHandler = function (wrapElement) {
      break_promise = true;
      if (timer1) {
        clearTimeout(timer1);
        timer1 = 0;
      }
      if (timer2) {
        clearTimeout(timer2);
        timer2 = 0;
        wrapElement.className = wrapElement.className.slice(0, -14);
      }
    };
    function distruct() {
      timer3 = setTimeout(() => {
        fix1.style = fix2.style = 'display: none;';
        now.appendChild(origin);
        timer3 = 0;
      }, 300);
      fix1.appendChild(origin);
      fix1.style = fix11 + 'transform: scale(1);';
      fix2.style = fix21;
      if (onHide) onHide();
    }
    fix2.onmouseleave = function () {
      if (timer3) return;
      showing = false;
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
        fix1.style = fix2.style = 'display: none;';
        now.appendChild(origin);
        if (onHide) onHide();
        return;
      }
      distruct();
    };
    gt.subscribeClick(function () {
      if (showing) {
        distruct();
        showing = false;
      }
    });
  }
}
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
    view.innerHTML += `<div class="gt-toolbar-hover"></div>`;
    view.addEventListener('mouseover', function (e) {
      if (thisObj.disabled) return;
      if (!hover) hover = view.firstChild;
      var t = tools[e.target.id.split('-')[2] || '-'];
      if (!t) return;
      hover.style.filter = 'opacity(.2)';
      hover.style.marginLeft = `${t.l + 2}px`;
      hover.style.width = `${t.tool.width - 4}px`;
    });
    view.addEventListener('mouseleave', function (e) {
      if (!hover) hover = view.firstChild;
      hover.style.filter = 'opacity(0)';
    });
    view.addEventListener('click', function (e) {
      if (thisObj.disabled) return;
      var t = tools[e.target.id.split('-').pop()];
      if (t) {
        if (t.pop) t.pop.clickHandler(document.getElementById('tool-' + t.tool.name).parentElement);
        if (t.click) t.click(t.tool);
      }
    });
    view.addEventListener('mousemove', function (e) {
      if (thisObj.disabled) return;
      var t = tools[e.target.id.split('-')[2] || '-'];
      if (t && t.pop) t.pop.mousemoveHandler(document.getElementById('tool-' + t.tool.name).parentElement);
    });
    view.addEventListener('mouseout', function (e) {
      var t = tools[e.target.id.split('-')[2] || '-'];
      if (t && t.pop) t.pop.mouseleaveHandler(document.getElementById('tool-' + t.tool.name).parentElement);
    });

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
    var view = this.#view;

    if (toolObj instanceof tbkGroup) {
      if (click) toolObj.tools[toolObj.name].click = click;
      this.tools[toolObj.name].pop = new Pop(toolObj.pop, {preserve: true, position: {x: 2, y: 2}, appendTo: toolObj.pop.firstChild, popupStyle: 'border-radius: 10px;'}, null, () => {
        view.firstChild.style.filter = 'opacity(0)';
      });
    }
  }
};

class tbkTool {
  #color; #name; #tool; #empty_mask; #isOn = false;
  get width() { return 40; };
  get name() { return this.#name; };
  get tool() { return this.#tool; };
  get color() { return this.#color; };
  get isOn() { return this.#isOn; };
  
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
    this.#empty_mask = `width: ${res[obj.icon].w}px; height: ${res[obj.icon].h}px; position: absolute;`;
    tool += '<div id="tool-m-' + obj.name + '" style="' + ((obj.attach && res[obj.attach].mask) ? cssMask(obj.attach) : this.#empty_mask) + `"><div id="tool-a-${obj.name}" style="${cssImage(obj.icon)}" class="gt-icon"></div></div><div id="tool-b-${obj.name}"`;
    if (obj.attach) tool += ` style="${cssImage(obj.attach)}"`;
    tool += ' class="gt-icon"></div></div>';
    if (obj.shadow) tool += '</div>';

    this.#color = color;
    this.#name = obj.name;
    this.#tool = tool;
  }
  turnOn() {
    document.getElementById('tool-' + this.#name).className = 'gt-tool gt-rev';
    this.#isOn = true;
  }
  turnOff() {
    document.getElementById('tool-' + this.#name).className = 'gt-tool';
    this.#isOn = false;
  }
  attach(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When attaching icon: Illegal icon');
    document.getElementById('tool-b-' + this.#name).style = cssImage(icon);
    document.getElementById('tool-m-' + this.#name).style = res[icon].mask ? cssMask(icon) : this.#empty_mask;
  }
  change(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When changing icon: Illegal icon');
    document.getElementById('tool-a-' + this.#name).style = cssImage(icon);
  }
};

class tbkGroup {
  tools = {};
  #tool = '<div class="gt-tool-group">';
  #pop = document.createElement("div");
  #count = 0;
  #name;
  get tool() { return this.#tool; };
  get pop() {
    this.#pop.style.height = `${(this.#count + 1) * 40 + 4}px`;
    return this.#pop;
  };
  get count() { return this.#count; };
  get width() { return 40; };
  get name() { return this.#name; };

  constructor(firstTool) {
    if (!(firstTool instanceof tbkTool)) throw new Error(eh + "please use Tool to create Group");
    this.tools[firstTool.name] = {tool: firstTool};
    this.#tool += firstTool.tool + '</div>';
    this.#pop.className = 'gt-tool-grouppop';
    this.#pop.style.width = '44px';
    this.#pop.innerHTML = '<div style="width: 40px; height: 40px; margin-bottom: -2px;"></div>'
    this.#name = firstTool.name;
    
    var tools = this.tools;
    this.#pop.addEventListener('click', function (e) {
      var t = tools[e.target.id.split('-').pop()];
      if (t) if (t.click) t.click();
    });
  }
  
  append(tool, click) {
    if (!(tool instanceof tbkTool)) throw new Error(eh + "please append Tool to Group");
    this.tools[tool.name] = {tool: tool, click: click};
    this.#pop.innerHTML += tool.tool;
    this.#count++;
  }
}

gt.toolbar = {
  Bar: tbkBar,
  View: tbkView,
  Tool: tbkTool,
  Group: tbkGroup,
};

return gt;
});