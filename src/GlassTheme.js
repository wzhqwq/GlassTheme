// 报错开头
export var eh = "Glass Theme: ";

// 设置Pop等对象用于呈现悬浮元素的根
var mainElement = document.body;
/*
  设置Pop等对象用于呈现悬浮元素的根
  @param {Element} element - 用于呈现悬浮元素的根
*/
export function setMainElement(element) {
  if (!(element instanceof Element)) throw new Error(eh + "please use an element object as main element");
  mainElement = element;
  // element.appendChild(insert_wait_zone);
}
/*
  获得用于呈现悬浮元素的根
  @return {Element} 用于呈现悬浮元素的根
*/
export function getMainElement() {
  return mainElement;
}