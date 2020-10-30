// tab导航控制
export var tabNavTriggers = {};
window.addEventListener('keydown', function (e) {
  var focus = document.activeElement;
  if (!focus || focus.tagName == 'INPUT') return;
  switch (e.key) {
    case "Enter": case "Space": // enter, space
      let fn;
      e.preventDefault();
      if (focus.id && (fn = tabNavTriggers[focus.id]))
        fn(focus);
      else
        focus.click();
      break;
    case "Tab": // tab
      break;
    case "Escape":  // escape
      if (pop_on_show)
        pop_on_show();
    // else
  }
});

// 任意点击都可以触发的事件订阅
var global_click_subscribers = [];
document.body.addEventListener("click", function (e) {
  global_click_subscribers.forEach(function (fn) {
    fn(e);
  });
}, true);
export function subscribeClick (fn) {
  global_click_subscribers.push(fn);
};
