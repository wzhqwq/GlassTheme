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
// Animation是对已知元素附加动画的一系列类，因此不是gtObject
gt.Animation = {};
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
// 同样也可以向未加入DOM的元素加入
function render(dest, gtObject) {
  if (!(gtObject instanceof Array)) gtObject = [gtObject];
  var output = ''
  gtObject.forEach(o => {
    if (!o.html || !o.id) throw new Error(eh + 'Rendering a nonstandard GlassTheme object.');
    if (wait_dom.has(o.id)) return;

    wait_dom.set(o.id, o);
    output += o.html;
  });
  obsvr.observe(dest, { childList: true });
  dest.innerHTML = output;

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
        Array.prototype.forEach.call(change.addedNodes, function (node) {
          var id = node.id;
          if (!wait_dom.has(id)) return;
          var gt_obj = wait_dom.get(id);
          exist_dom.set(id, gt_obj);
          wait_dom.delete(id);
          setTimeout(gt_obj.afterRendering.bind(gt_obj), 0, node);
        });
      if (change.removedNodes.length)
        Array.prototype.forEach.call(change.removedNodes, function (node) {
          if (exist_dom.has(node.id)) setTimeout(exist_dom.get(node.id).afterRemoved.bind(gt_obj), 0, node);
        });
    }
  }
}
gt.render = (destination, gtObject) => {
  if (!(destination instanceof Element)) throw new Error(eh + 'please use render function on HTMLElement');
  render(destination, gtObject);
};
if ($ && $.fn) {
  $.fn.gtRender = function (gtObject) {
    render(this[0], gtObject);
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
  else
    endless_q_el.push(gtObject);
  endless_qt_el++;
  return gtObject.domTemp = document.getElementById(gtObject.id);
}

// 设置Pop等对象用于呈现悬浮元素的根
var mainElement = document.body;
gt.setMainElement = function (element) {
  if (!(element instanceof Element)) throw new Error(eh + "please use an element object as main element");
  mainElement = element;
  // element.appendChild(insert_wait_zone);
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
