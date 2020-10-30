// 待加载队列
var loadQueue = [], windowLoaded = false;
/*
  监听文档加载完成，若已完成则直接调用
  @param {Function} fn - 加载完成回调函数
*/
export default function load (fn) {
  if (windowLoaded)
    fn();
  else
    loadQueue.push(fn);
}
window.addEventListener("load", function () {
  loadQueue.forEach(fn => setTimeout(fn, 0));
  windowLoaded = true;
});

// 资源预加载相关