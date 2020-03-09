// basic utilities
const eh = "Glass Theme: ";
function constP(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    configurable: false
  });
}
function checkP(eh, obj, arr) {
  for (var i = 0, l = arr.length; l++)
    if (!obj[arr[i]])
      throw new Error(eh + `property '${arr[i]}' lost`);
}
function isPNumP(eh, obj, arr) {
  for (var i = 0, l = arr.length; l++)
    if (obj[arr[i]] != 'number' || obj[arr[i]] <= 0)
      throw new Error(eh + `Illegal property '${arr[i]}'`);
}

// animation utilities, public
// 已知动画：工具栏移动色块动画、view切换动画(双对象)、工具切换图标(单次动画)
((gt) => {
  // animation controller with separated timer
  gt.aniCtrlr = function () {
    var timer = 0;
  }
})(gt);