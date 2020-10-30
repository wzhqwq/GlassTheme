import load from "../Core/Load";

const MAX_ELEMENT_CACHE_SIZE = 500;

export class Component {
  domTemp;
  #rendered;
  #outer;
  #inner = '';
  #className = '';
  #styles = '';
  #name;
  #idprefix;

  get dom() { return domTemp || get_element(this); }
  get html() {
    return this.#outer
      .replace('@{style}', this.#styles)
      .replace('@{classes}', this.#className)
      .replace('@{inner}', this.#inner)
      .replace('style=""', '')
      .replace('class=""', '');
  }
  get rendered() { return this.#rendered; }
  set className(value) {
    if (this.#rendered)
      this.dom.className = value;
    else
      this.#className = value;
  }
  get className() {
    return this.#rendered ? this.dom.className : this.#className;
  }
  set styles(value) {
    if (this.#rendered)
      this.dom.style = value;
    else
      this.#styles = value;
  }
  get styles() {
    return this.#rendered ? this.dom.styles : this.#styles;
  }
  set inner(value) {
    if (this.#rendered)
      this.dom.innerHTML = value;
    else
      this.#inner = value;
  }
  get inner() { return this.#rendered ? this.dom.innerHTML : this.#inner; }
  get id() { return this.#idprefix + this.#name; }
  get name() { return this.#name; }

  constructor(name, prefix) {
    this.#name = name;
    this.#idprefix = prefix;
  }

  addClass(className) {
    if (this.className == '')
      this.className = className;
    else
      this.className += ' ' + className;
  }
  removeClass(className) {
    this.className = this.className.replace(className, '').replace('  ', ' ').trim();
  }
  css(styleName, value) {
    if (typeof value == 'number' && styleName.match(/[\S]*width|[\S]*height|padding[\S]*|margin[\S]*|border[\S]*|top|left|bottom|right/))
      value = `${value}px`;
    if (this.styles.match(styleName))
      this.styles = this.styles.replace(new RegExp(`(?<=${styleName}: )[^;]*`), value);
  }
  removeCss(styleName) {
    this.styles = this.styles.replace(new RegExp(`${styleName}: [^;]*[;]*`), value);
  }
  setAttr(name, value) {
    if (this.#rendered)
      this.dom.setAttribute(name, value);
    // 还没想好怎么写，先咕着吧
  }

  afterRendering() {
    this.#rendered = true;
  }
  afterRemoved(element) {
    this.#rendered = false;
    var html = element.outerHTML;
    this.#className = (html.match(/(?<=class=")[^"]*/) || [])[0];
    this.#styles = (html.match(/(?<=style=")[^"]*/) || [])[0];
    if (!this.#styles.match(/;$/))
      this.#styles += ';';
    this.#outer = html
    .replace(/(?<=^<[^>]*) class="[^"]*"/, '@{classes}')
    .replace(/(?<=^<[^>]*) style="[^"]*"/, '@{style}')
    .replace(/(?<=>)[\s\S]*(?=<)/, '@{inner}');
    this.#inner = element.innerHTML;
  }

  on(type, listener) {
    let t = this.#listeners[type];
    if (t && t.list)
      this.#listeners[type].list.push(listener);
    else {
      let list = [listener];
      this.#listeners[type] = {
        list: list,
        handler: e => {
          list.forEach(listener => listener(e));
        }
      };
    }
    return this;
  }
  unbind(type, listener) {
    let t = this.#listeners[type];
    if (t) {
      t = t.list;
      for (var i = t.length - 1; i >= 0; i--)
        if (t[i] == listener) {
          t.splice(i, 1);
          break;
        }
    }
  }

  click(listener) {
    this.on('click', listener);
    return this;
  }
  focus(listener) {
    this.on('focus', listener);
    return this;
  }
  blur(listener) {
    this.on('blur', listener);
    return this;
  }

  assignClick(obj) {
    this.#click_entrusted = true;
    var t = this.#listeners['click'];
    this.#listeners['click'] = obj;
    return t;
  }

  static getTypeMap(type) {
    return namesByType[type] || (namesByType[type] = new Map());
  }
}

var namesByType = {};
load(() => {
  var names = document.body.innerHTML.match(/(?<=id="gt-)[^"]*/g);
  if (!names) return;
  names.forEach(name => {
    var type = (name.match(/^[^-]*(?=-[\S]*)/) || ["gt"])[0];
    getTypeMap(type).set(type == 'gt' ? name : name.replace(type + '-', ''));
  });
});

// 由循环队列管理的Element对象缓存
var endless_q_el = new Array();
var endless_qt_el = 0;
/*
  当缓存消失时调用获得dom元素
  @param {GlassTheme} gtComp - GlassTheme对象
  @return {Element} 获得的dom元素
*/
export function getElement(gtComp) {
  if (endless_qt_el == MAX_ELEMENT_CACHE_SIZE) endless_qt_el = 0;
  if (endless_q_el[endless_qt_el]) {
    endless_q_el[endless_qt_el] = gtComp;
    endless_q_el[endless_qt_el].domTemp = null;
  }
  else
    endless_q_el.push(gtComp);
  endless_qt_el++;
  return gtComp.domTemp = document.getElementById(gtComp.id);
}
