(factory => {
  if (typeof module == 'object' && typeof module.exports == 'object')
    module.exports = factory;
  else
    window.gt = factory(window);
})(window => {
// 报错开头
const eh = "Glass Theme: ";
const MAX_ELEMENT_CACHE_SIZE = 500;

// tab导航控制
var tabNavTriggers = {};
window.addEventListener('keydown', function (e) {
  var focus = document.activeElement;
  if (!focus || focus.tagName == 'INPUT') return;
  switch (e.keyCode) {
    case 13: case 32: // enter, space
      let fn;
      e.preventDefault();
      if (focus.id && (fn = tabNavTriggers[focus.id]))
        fn(focus);
      else
        focus.click();
      break;
    case 9: // tab
      break;
    case 27:  // escape
      if (pop_on_show)
        pop_on_show();
      // else
  }
});

// 待加载队列
var loadQueue = [], windowLoaded = false;
gt = function (fn) {
  if (windowLoaded)
    fn();
  else
    loadQueue.push(fn);
}
window.addEventListener("load", function () {
  loadQueue.forEach(fn => setTimeout(fn, 0));
  windowLoaded = true;
});

// gtObject规范
/*
id, name, html: necessary
afterRendering, afterRemoved: event
dom: Element
*/
// 监听绑定（我猜react是这样实现的）
var wait_dom = new Map(), exist_dom = new Map();
var obsvr = new MutationObserver(node_handler);
function render(gtObject) {
  if (!(gtObject instanceof Array)) gtObject = [gtObject];
  gtObject.forEach(o => {
    if (!o.html || !o.id) throw new Error(eh + 'Rendering a nonstandard GlassTheme object.');
    if (wait_dom.has(o.id)) return;
    
    wait_dom.set(o.name, o.onLoaded);
  });
  obsvr.observe(this, { childList: true });

  return this;
}
/*// 准备加入的功能
var insert_wait_zone = document.createElement('div'); 
function insert(gtObject) {
}
*/
function node_handler(change_list) {
  for (let change of change_list) {
    if (change.type == 'childList') {
      if (change.addedNodes.length)
        Array.prototype.forEach.call(change.addedNodes, node => {
          var id = node.id;
          if (!wait_dom.has(id)) return;
          var gt_obj = wait_dom.get(id);
          exist_dom.set(id, gt_obj);
          wait_dom.delete(id);
          setTimeout(gt_obj.afterRendering, 0, node);
        });
      if (change.removedNodes.length)
        Array.prototype.forEach.call(change.removedNodes, node => {
          if (exist_dom.has(node.id)) setTimeout(exist_dom.get(node.id).afterRemoved, 0, node);
        });
    }
  }
}
gt.render = (destination, gtObject) => {
  if (!(destination instanceof Element)) throw new Error(eh + 'please use render function on HTMLElement');
  render.call(destination, gtObject);
};
if ($ && $.fn) {
  $.fn.gtRender = gtObject => {
    render.call(this, Array.prototype.slice.call(gtObject));
    return this;
  }
}

// 由循环队列管理的Element对象缓存
var endless_q_el = new Array();
var endless_qt_el = 0;
/*
  当缓存消失时调用获得dom元素
  @param {Object} gtObject - gtObject元素
  @return {Element} 获得的dom元素
*/
function get_element(gtObject) {
  if (endless_qt_el == MAX_ELEMENT_CACHE_SIZE) endless_qt_el = 0;
  if (endless_q_el[endless_qt_el]) {
    endless_q_el[endless_qt_el] = gtObject;
    endless_q_el[endless_qt_el].domTemp = null;
  }
  else {
    endless_q_el.push(gtObject);
  }
  endless_qt_el++;
  return gtObject.domTemp = document.getElementById(gtObject.id);
}

// 设置Pop等对象用于呈现悬浮元素的根
var mainElement = document.body;
gt.setMainElement = function (element) {
  if (!(element instanceof Element)) throw new Error(eh + "please use an element object as main element");
  mainElement = element;
  element.appendChild(insert_wait_zone);
}

// 任意点击都可以触发的事件订阅
var global_click_subscribers = [];
document.body.addEventListener("click", function (e) {
  global_click_subscribers.forEach(function (fn) {
    fn(e);
  });
}, true);
gt.subscribeClick = function (fn) {
  global_click_subscribers.push(fn);
};

// basic utilities
function d(msg) {
  console.log(msg);
}
function checkP(eh, obj, arr) {
  arr.forEach(function (item) {
    if (!obj[item]) {
      throw new Error(eh + `property '${item}' lost`);
    }
  });
}
function checkPNumP(eh, obj, arr) {
  arr.forEach(function (item) {
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
((gt, window) => {
  // 收集带有gt-开头的控件
  var widgets = new Map();
  var document = window.document;
  gt(function () {
    var wig = document.body.innerHTML.match(/(?<=id="gt-)[^"]+/g);
    if (!wig) return;
    wig.forEach((name) => {
      widgets.set(name, {bound: false});
    });
  });

  // 控件对象，实现对主色、大小的控制，符合gtObject规范
  function get_size_class(value) {
    var size = '';
    switch (value) {
      case 'large':
        size = ' gt-lg';
        break;
      case 'small':
        size = ' gt-sm';
    }
    return size;
  }
  class Widget {
    domTemp;
    html;
    #rendered;
    #value;
    #name;
    #width;
    #listeners = {};
    get dom() { return this.domTemp || get_element(this); }
    get rendered() { return this.#rendered; }
    set value(value) {
      if (!this.#rendered) {
        console.warn(eh + 'Value change on unrendered gtObject is not effective.');
        return;
      }
      this.#setter.call(this.dom, this.#value = value);
    }
    get value() { return this.#value; }
    get name() { return this.#name; }
    get id() { return 'gt-' + this.#name; }
    get width() { return this.#width; }
    set size(value) {
      if (!this.#rendered) {
        console.warn(eh + 'Size change on unrendered gtObject is not effective.');
        return;
      }
      this.elBaseCall(size => {
        this.className = this.className.replace(/gt-[lgsm]{2,2}/, '') + size;
      }, get_size_class(value));
    }
    set color(value) {
      if (!this.#rendered) {
        console.warn(eh + 'Color change on unrendered gtObject is not effective.');
        return;
      }
      this.elBaseCall(color => {
        this.className = this.className.replace(/gtc-[^/s]/, '') + color;
      }, ' gtc-' + value);
    }

    constructor (name, value, width, getDOM, valueSetter, valueUpdter) {
      this.#name = name;
      this.#setter = valueSetter;
      if (widgets.has(name)) {
        if (widgets.get(name).bound)
          throw new Error(`name'${name}' has been bound.`);
        let el = this.dom;
        this.html = el.outerHTML;
        // value
        if (value === null)
          this.#value = el.innerHTML || el.value;
        else {
          this.#value = value;
          valueSetter.call(el, this.#value);
        }
        // width
        if (width === null)
          this.#width = el.getBoundingClientRect().width;
        else {
          this.#width = width;
          el.style.width = typeof width == 'string' ? width : `${width}px`;
        }
        // Support: input[type="text" | "file"] select textarea
        if (valueUpdter)
          this.on('change', (e => {
            this.#value = valueUpdter(e.target);
          }).bind(this));

        this.#rendered = true;
      }
      else {
        dom = getDOM();
        this.#value = value;
        this.#width = width;
        this.#rendered = false;
      }
      widgets.set(name, {bound: true});
    }

    afterRendering (element) {
      this.#rendered = true;
      for (let listener_name in this.#listeners) {
        let t = this.#listeners[listener_name].handler;
        if (t)
          element.addEventListener(listener_name, t);
      }
    }

    afterRemoved (element) {
      this.#rendered = false;
      for (let listener_name in this.#listeners) {
        let t = this.#listeners[listener_name].handler;
        if (t)
          element.removeEventListener(listener_name, t);
      }
    }

    on (type, listener) {
      let t = this.#listeners[type];
      if (t && t.list)
        this.#listeners[type].list.push(listener);
      else {
        let list = [listener];
        let handler = e => {
          list.forEach(listener => {
            listener(e);
          });
        };
        this.#listeners[type] = {list: list, main: handler};
      }
    }

    elBaseCall(fn, arg) {
      fn.call(this.dom, arg);
    }
  }

  // 文本框对象
  class wgtText extends Widget {
    constructor (name, value, width, color) {
      super(
        name, value, width,
        () => `<span id="gt-${name}"${width ? ` style="width: ${width || 'auto'}` : ''}" class="gt-text${color ? ` gtc-${color}` : ''}">${value}</span>`,
        value => { this.innerHTML = value; }
      );
    }
  }

  // 单行输入框，可以监听值的变化
  class wgtInputBox extends Widget {
    constructor (name, value, width, size, color, hint) {
      super(
        name, value, width,
        () => `<input type="text" id="gt-${name}" value="${value}"${width ? ` style="width: ${width}` : ''}${hint ? ` placeholder="${hint}"` : ''} class="gt-input${size ? get_size_class(size) : ''}${color ? ` gtc-${color}` : ''}">`,
        value => { this.value = value; },
        el => el.value
      );
    }
  }

  // 按钮，可以监听点击事件
  class wgtButton extends Widget {
    constructor (name, value, size, color) {
      super(
        name, value, null,
        () => `<button id="gt-${name}" class="gt-btn${size ? get_size_class(size) : ''}${color ? ` gtc-${color}` : ''}"`,
        value => (this.tagName == 'input' ? (this.value = value) : (this.innerHTML = value))
      );
    }
  }

  gt.Widget = {
    Text: wgtText,
    InputBox: wgtInputBox,
    Button: wgtButton
  }
})(gt, window);
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
      r.forEach(function (col) {
        var j = 0;
        col.forEach(function (item) {
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
        r.forEach(function (col) {
          var j = 0;
          col.forEach(function (item) {
            item.split(',').forEach(function (item) {
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
var fix1 = document.createElement("div");
fix1.className = 'gt-fix1';
fix1.style.display = 'none';
var pop_on_show = null;

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
    var fix2 = document.createElement("div"), fix2inside = document.createElement("div");
    mainElement.appendChild(fix1);
    fix2inside.appendChild(pop_up);
    fix2inside.className = 'gt-fix2-inside';
    fix2.appendChild(fix2inside);
    fix2.className = 'gt-fix2';
    var fix2Pos = document.createElement("div");
    fix2Pos.className = 'gt-relative-position';
    fix2Pos.appendChild(fix2);

    var w1 = 0, h1 = 0, x1, y1, x2, y2;
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
      fix11 += `left: ${x1.toFixed(3)}px; top: ${y1.toFixed(3)}px; `;
      fix21 = '';
      if (presrv) {
        let ox = w1 + w2 / 2 - presrv.x, oy = h1 + h21 / 2 - presrv.y;
        x = get_nearest(area.x1, area.x2, x1 + ox) - ox;
        y = get_nearest(area.y1, area.y2, y1 + oy) - oy;
        fix12 += `left: ${x.toFixed(3)}px; top: ${y.toFixed(3)}px; transform: scale(1);`;
        fix22 = `left: ${(x - presrv.x - x1).toFixed(3)}px; top: ${((y -= presrv.y) - y1).toFixed(3)}px; `;
      }
      else {
        x = get_nearest(area.x1, area.x2, x1 + w1 / 2);
        y = get_nearest(area.y1, area.y2, y1 + h1 / 2);
        fix12 += `left: ${(x - w1 / 2).toFixed(3)}px; top: ${(y - h1 / 2).toFixed(3)}px; filter: opacity(0); `;
        fix22 = `left: ${(x - w2 / 2 - x1).toFixed(3)}px; top: ${(y - h21 / 2 - y1).toFixed(3)}px; `;
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
      // 防止pop1被同时使用
      if (pop_on_show) pop_on_show();
      if (timer1) clearTimeout(timer1);
      timer1 = setTimeout(() => {
        // 开始蓄力，进行预备运算
        timer2 = setTimeout(() => {
          // 蓄力完成，转移元素
          console.log("fatal1");
          timer_fatal = setTimeout(() => {
            // fix1开始反弹，fix2预备
            console.log("fatal2");
            timer_fatal = setTimeout(() => {
              // 反弹完成，fix12开始展示
              console.log("fatal3");
              timer_fatal = setTimeout(() => {
                // 展示完成，触发展示事件，可以开始相应的加载
                timer_fatal = 0;
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
            wrapElement.appendChild(fix2Pos);
            fix2.style = fix21;
            fix2inside.style = fix23;
          }, 0);
          timer2 = 0;
          showing = true;
          fix1.style = fix11;
          now = wrapElement;
          origin = wrapElement.firstChild;
          if (fix1.innerHTML != '') throw new Error('foo');
          fix1.appendChild(origin);
          wrapElement.className = wrapElement.className.slice(0, -14);
        }, 500);
        timer1 = 0;
        var pos = wrapElement.getBoundingClientRect();
        if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1) {
          w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
          calc();
        }
        wrapElement.className += ' gt-pop-accmlt';
        pop_on_show = forceStop;
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
    this.tabEnterHandler = function (wrapElement) {
      if (showing || timer_fatal) {
        leave();
        return;
      }
      if (pop_on_show) pop_on_show();
      timer_fatal = setTimeout(() => {
        // 反弹完成，fix12开始展示
        timer_fatal = setTimeout(() => {
          // 展示完成，触发展示事件，可以开始相应的加载
          timer_fatal = 0;
          showing = true;
          pop_on_show = forceStop;
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
      }, 0);
      var pos = wrapElement.getBoundingClientRect();
      if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1) {
        w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
        calc();
      }
      fix1.style = fix11 + 'transform: scale(1);';
      now = wrapElement;
      origin = wrapElement.firstChild;
      fix1.appendChild(origin);
      wrapElement.appendChild(fix2Pos);
      fix2.style = fix21;
      fix2inside.style = fix23;
    }
    function stopAnim() {
      if (timer2) {
        clearTimeout(timer2);
        timer2 = 0;
      }
      if (timer3) {
        clearTimeout(timer3);
        timer3 = 0;
      }
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
      }
    }
    function distruct() {
      console.log("animation hide");
      if (!showing) return;
      stopAnim();
      timer3 = setTimeout(() => {
        timer3 = 0;
        if (!showing) return;
        fix1.style = 'display: none;';
        now.removeChild(fix2Pos);
        now.appendChild(origin);
        showing = false;
        pop_on_show = null;
      }, 300);
      fix1.appendChild(origin);
      fix1.style = fix11 + 'transform: scale(1);';
      fix2.style = fix21;
      if (onHide) onHide();
    }
    function forceStop() {
      if (!showing) return;
      console.log("force stop");
      stopAnim();
      fix1.style = 'display: none;';
      now.appendChild(origin);
      now.removeChild(fix2Pos);
      if (onHide) onHide();
      showing = false;
      pop_on_show = null;
    }
    function leave() {
      if (timer3) return;
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
        forceStop();
        return;
      }
      distruct();
    }
    fix2.onmouseleave = leave;
    fix2.onmousemove = function (e) {
      e.stopPropagation();
    };
    gt.subscribeClick(function () {
      if (showing)
        forceStop();
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
  #title = document.createElement("div");
  get count() { return this.#count; };
  get bar() { return this.#bar; };

  constructor(view) {
    if (!(view instanceof tbkView))
      throw new Error(eh + 'Please append gt.toolbar.View to Bar');
    this.views[view.name] = view;
    var e = view.view;
    e.style.zIndex = '0';
    this.#title.className = 'gt-toolbar-title';
    this.#bar.appendChild(this.#title);
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
    e.style = `width: ${view.width}px; filter: opacity(0); z-index: -1; margin-left: 20px; display: none;`;
    this.#bar.appendChild(e);
  }
  enter(viewName, titleTool) {
    var view = this.views[viewName], now = this.#stack.top();
    var ehh = eh + 'when entering into another view:';
    if (!view) throw new Error(ehh + 'inexistent view');
    if (titleTool && this.#title.innerHTML) throw new Error(ehh + 'title has been set already');
    var bar = this.#bar, stack = this.#stack, titleWrap = this.#title;

    bar.style.overflow = 'hidden';
    view.view.style.display = 'block';
    if (titleTool) {
      let title = now.tools[titleTool];
      if (!title) throw new Error(ehh + 'inexistent tool');
      if (!(title.tool instanceof tbkTool || title.tool instanceof tbkGroup)) throw new Error(ehh + 'illegal tool');
      
      let content = title.tool.tool
      titleWrap.innerHTML = (title.tool instanceof tbkTool ? content : content.slice(content.indexOf('">') + 2, -6)).replace(/ (id|title|tabindex)="[^\s]*/g, '');
      setTimeout(() => {
        now.view.style = `width: ${title.l + 40}px; z-index: ${stack.length}; margin-left: -${title.l}px; overflow: hidden;`;
        // now.disabled = true;
        stack.push(view);
        view.view.style = `width: ${view.width}px; z-index: ${stack.length}; margin-left: 40px;`;
        bar.style.width = `${view.width + 40}px`;
      }, 0);
    }
    else {
      setTimeout(() => {
        now.view.style = `width: ${now.view.width}px; filter: opacity(0); z-index: ${stack.length}; margin-left: -20px`;
        stack.push(view);
        view.view.style = `width: ${view.width}px; z-index: ${stack.length}; margin-left: 0`;
        bar.style.width = `${view.width}px`;
      }, 0);
    }
    setTimeout(() => {
      bar.style.overflow = 'visible';
      now.view.style.display = 'none';
      if (titleTool) titleWrap.style = 'display: block';
    }, 300);
  }
  exit() {
    if (!this.#stack.length) return;
    var bar = this.#bar, stack = this.#stack, title = this.#title;
    var now = stack.pop(), esc = stack.top();
    if (title.innerHTML) {
      title.style.display = 'none';
      title.innerHTML = '';
    }
    now.view.style = `width: ${now.width}px; filter: opacity(0); z-index: -1; margin-left: 20px`;
    esc.view.style.display = 'block';
    bar.style.overflow = 'hidden';
    setTimeout(() => {
      esc.view.style = `width: ${esc.width}px; z-index: ${stack.length}; margin-left: 0`;
    }, 0);
    // next.disabled = false;
    bar.style = `width: ${esc.width}px; overflow: hidden;`;
    setTimeout(() => {
      esc.view.style.overflow = bar.style.overflow = 'visible';
      now.view.style.display = 'none';
    }, 300)
  }
}

// 自定义：onopen onclose
var viewC = 0;
class tbkView {
  tools = {};
  // disabled = false;
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
      // if (thisObj.disabled) return;
      if (!hover) hover = view.firstChild;
      var t = tools[e.target.id.match(/(?<=tool-[abm]?-)[^\s]*/) || ''];
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
      // if (thisObj.disabled) return;
      var t = tools[e.target.id.match(/(?<=tool-)[^\s]*/) || ''];
      if (t) {
        if (t.pop) t.pop.clickHandler(document.getElementById('tool-' + t.tool.name).parentElement);
        if (t.click) t.click(t.tool);
      }
    });
    view.addEventListener('mousemove', function (e) {
      // if (thisObj.disabled) return;
      var t = tools[e.target.id.match(/(?<=tool-[abm]?-)[^\s]*/) || ''];
      if (t && t.pop) t.pop.mousemoveHandler(document.getElementById('tool-' + t.tool.name).parentElement);
    });
    view.addEventListener('mouseout', function (e) {
      var t = tools[e.target.id.match(/(?<=tool-[abm]?-)[^\s]*/) || ''];
      if (t && t.pop) t.pop.mouseleaveHandler(document.getElementById('tool-' + t.tool.name).parentElement);
    });
    view.addEventListener('focus', function (e) {
      e.preventDefault();
      (focus_now = e.target.children[1]).focus();
      console.log(focus_now);
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
      let trigger = (this.tools[toolObj.name].pop = new Pop(toolObj.pop, {preserve: true, position: {x: 2, y: 2}, appendTo: toolObj.pop.firstChild, popupStyle: 'border-radius: 10px;'}, null, () => {
        view.firstChild.style.filter = 'opacity(0)';
      })).tabEnterHandler;
      tabNavTriggers[toolObj.tool.match(/(?<=id=")[^"]+/)[0]] = function (el) {
        trigger(el);
      }
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
  
  // name icon [attach color shadow title]
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
    var tool = `<div id="tool-${obj.name}" style="--ccc: ${color}" class="gt-tool"`;
    if (obj.title) tool += ` title="${obj.title}"`;
    tool += ' tabindex="0" role="button">';
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

var tbk_group_cnt = 0;
class tbkGroup {
  tools = {};
  #tool = '<div class="gt-tool-group" tabindex="0" id="gt-tgroup-';
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
    this.#tool += `${++tbk_group_cnt}">${firstTool.tool}</div>`;
    this.#pop.className = 'gt-tool-grouppop';
    this.#pop.style.width = '44px';
    this.#pop.innerHTML = '<div style="width: 40px; height: 40px; margin-bottom: -2px;"></div>'
    this.#name = firstTool.name;
    
    var tools = this.tools;
    this.#pop.addEventListener('click', function (e) {
      var t = tools[e.target.id.split('-').pop()];
      if (t) if (t.click) t.click();
      e.stopPropagation();
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