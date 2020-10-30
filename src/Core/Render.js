import {GlassTheme, eh} from "./../GlassTheme";

// 监听绑定（我猜react是这样实现的）
var wait_dom = new Map(), exist_dom = new Map();
var obsvr = new MutationObserver(node_handler);
// 同样也可以向未加入DOM的元素加入
export function render(dest, gtComp) {
  obsvr.observe(dest, { childList: true });
  dest.innerHTML = getHTML(gtComp);
  return this;
}
export function waitRender(gtComp) {
  if (!gtComp) return;
  if (!(gtComp instanceof Array)) gtComp = [gtComp];
  var output = '';
  gtComp.forEach(o => {
    if (!(o instanceof Gt)) throw new Error(eh + 'Rendering a nonstandard GlassTheme instance.');
    if (wait_dom.has(o.id)) return;

    wait_dom.set(o.id, o);
    output += o.html;
  });

  return output;
}
/*// 准备加入的功能
var insert_wait_zone = document.createElement('div'); 
function insert(gtComp) {
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
          if (exist_dom.has(node.id)) {
            let gt_obj = exist_dom.get(node.id);
            setTimeout(gt_obj.afterRemoved.bind(gt_obj), 0, node);
          }
        });
    }
  }
}
