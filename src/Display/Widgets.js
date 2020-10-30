import {GlassTheme, eh} from "./../GlassTheme";

// 控件对象，实现对主色、大小的控制，符合gtComp
function get_size_class(value) {
  var size = '';
  switch (value) {
    case 'large':
      size = 'gt-lg';
      break;
    case 'small':
      size = 'gt-sm';
  }
  return size;
}
class Widget extends GlassTheme {
  html;
  // 当组件成组时，组合组件可以托管点击事件, 渲染触发后会向组合组件更新点击事件
  #click_entrusted = false;
  #rendered;
  #value;
  #name;
  #setter;
  #listeners = {};
  get name() { return this.#name; }
  get id() { return 'gtw-' + this.#name; }

  constructor(name, value, genFn, valueSetter, valueUpdter) {
    if (!name) throw new Error(eh + 'Illegal widget name.');
    this.#name = name;
    this.#setter = valueSetter;
    // Support: input[type="text" | "file"] select textarea
    if (valueUpdter)
      this.on('change', (function (e) {
        this.#value = valueUpdter(e.target);
      }).bind(this));
    if (widgets.has(name)) {
      if (widgets.get(name).obj)
        throw new Error(`name'${name}' has been bound.`);
      let el = this.dom;
      this.html = el.outerHTML;
      // value
      if (value === null || typeof value == 'undefined')
        this.#value = el.innerHTML || el.value;
      else
        valueSetter[0].call(el, this.#value = value);

      this.afterRendering(el);
    }
    else {
      this.html = genFn(name, this.#value = value || '');
      this.#rendered = false;
    }
    widgets.set(name, { obj: this });
  }

  value(value) {
    if (value === null || typeof value == 'undefined') return this.#value;

    this.#value = value;
    if (!this.#rendered)
      this.html = this.html.replace(this.#setter[1], value ? value : '');
    else
      this.#setter[0].call(this.dom, value ? value : '');
    return this;
  }
  width(value) {
    if (typeof value == 'number') value = `${value}px`;
    value = value || 'unset';

    if (!this.#rendered) {
      let pos = this.html.indexOf('style="');
      this.html = pos == -1 ? this.html.replace('>', ` style="width: ${value};">`) : this.html.replace(/[\s]*width:[^;"]*[;]*/, '').replace(/style="/, `style="width: ${value}; `);
    }
    else
      this.dom.style.width = value;
    return this;
  }
  size(value) {
    if (!this.#rendered) {
      let pos = this.html.indexOf('class="');
      this.html = pos == -1 ? this.html.replace('>', ` class="${get_size_class(value)}">`) : this.html.replace(/[\s]*gt-[lgsm]{2,2}/, '').replace(/class="[\s]*/, `class="${get_size_class(value)} `);
    }
    else
      this.dom.className = (this.domTemp.className.replace(/[\s]*gt-[lgsm]{2,2}/, '') + ' ' + get_size_class(value)).replace(/^\s/, '');
    return this;
  }
  color(value) {
    value = value || 'none';
    if (!this.#rendered) {
      let pos = this.html.indexOf('class="');
      this.html = pos == -1 ? this.html.replace('>', ` class="gtc-${value}">`) : this.html.replace(/[\s]*gtc-[^\s"]*/, '').replace(/class="[\s]*/, `class="gtc-${value} `);
    }
    else
      this.dom.className = (this.domTemp.className.replace(/[\s]*gtc-[^\s]*/, '') + ' gtc-' + value).replace(/^\s/, '');
    return this;
  }
  disable(value) {
    if (this.rendered)
      this.dom.disabled = !!value;
    else
      this.html.replace(/disabled="[^"]*"/).replace('>', `disabled="${value ? 'true' : ''}"`);
      return this;
  }

  afterRendering(element) {
    this.#rendered = true;
    for (let listener_name in this.#listeners) {
      if (listener_name == 'click' && this.#click_entrusted) continue;
      let t = this.#listeners[listener_name].handler;
      if (t)
        element.addEventListener(listener_name, t);
    }
  }

  afterRemoved(element) {
    this.#rendered = false;
    this.html = element.innerHTML;
    for (let listener_name in this.#listeners) {
      if (listener_name == 'click' && this.#click_entrusted) continue;
      let t = this.#listeners[listener_name].handler;
      if (t)
        element.removeEventListener(listener_name, t);
    }
  }
}

// 文本框对象
export class Text extends Widget {
  constructor(name, value) {
    super(
      name, value,
      (name, value) => `<span id="gtw-${name}" class="gt-text">${value}</span>`,
      [function (value) { this.innerHTML = value; }, /(?<=>)[^<]*/]
    );
  }
}

// 单行输入框，可以监听值的变化
export class InputBox extends Widget {
  #hint;

  constructor(name, value) {
    super(
      name, value,
      (name, value) => `<input type="text" id="gtw-${name}" class="gt-input" value="${value}">`,
      [function (value) { this.value = value; }, /(?<=value=")[^"]*/],
      el => el.value
    );
  }

  hint(msg) {
    if (msg === null) return this.#hint;

    this.#hint = msg;
    if (this.rendered)
      this.dom.placeholder = msg;
    else {
      var pos = this.html.indexOf('placeholder="');
      this.html = pos == -1 ? this.html.replace(/id="/, `placeholder=${msg} id="`) : this.html.replace(/(?<=placeholder")[^"]*/);
    }
  }
}

// 按钮，可以监听点击事件
export class Button extends Widget {
  constructor(name, value) {
    super(
      name, value,
      (name, value) => `<button id="gtw-${name}" class="gt-btn">${value}</button>`,
      [function (value) {
        this.tagName == 'input' ? (this.value = value) : (this.innerHTML = value);
      }, /(?<=value=">)[^"]*|(?<=">)[^<]*/]
    );
  }
}

// 复选框，value为布尔值
export class Checkbox extends Widget {
  constructor(name, value) {
    super(
      name, null,
      (name) => `<input id="gtw-${name}" class="gt-input" checked="${value ? 'true' : ''}">`
    );
    Object.defineProperty(this, 'value', {
      value: this.set,
      configurable: false,
      writable: false
    });
  }

  set(value) {
    if (this.rendered)
      this.dom.checked = !!value;
    else
      this.html.replace(/checked="[^"]*"/).replace('>', `checked="${value ? 'true' : ''}"`);
      return this;
  }
}

// 开关，value为布尔值

// 控件组，可以委托点击事件
export class Group extends GlassTheme {
  domTemp;
  #html = "";
  #widgets = new Map();
  #size_class;
  #size;
  #name;
  #width;
  #height;
  #direction;
  #grow;
  #style;
  #className;

  get dom() { return this.domTemp || get_element(this); }
  get html() { return `<div class="${this.#className}"${this.#style}>${this.#html}</div>`; }
  get name() { return this.#name; }
  get id() { return `gtw-${this.#name}`; }

  constructor(name, {width, height, size, direction, growable} = {}) {
    this.#name = name;
    this.#size_class = get_size_class(size || '');
    this.#size = size || '';
    this.#width = width;
    this.#height = height;
    this.#direction = direction == 'vertical' ? 'gt-vert' : '';
    this.#grow = growable ? 'gt-grow' : '';
    this.#className = `gtw-group ${this.#size_class}`;
  }

  #click_handler(e) {
    var t = this.#widgets[(e.target.id.match(/(?<=gtw-)[^\s]*/) || [])[0]];
    if (t) t.forEach(listener => listener());
  }

  append(gtComp{
    if (!(gtCompnstanceof Widget))
      throw new Error(eh + "You can only append widget to group.");
    if (gtCompendered)
      throw new Error(eh + "We can't append a rendered widget to group.");
    gtCompize(this.#size);
    this.#html += gtComptml;
    var list = [];
    list.push((gtCompssignClick({list: list}) || []).list);
    this.#widgets.set(gtCompame, list);
    return this;
  }

  afterRendering(element) {
    element.addEventListener('click', this.#click_handler);
  }
  afterRemoved(element) {
    element.removerEventListener('click', this.#click_handler);
  }
}

gt.Widget = function (name) {
  return widgets.has(name) ? widgets.get(name).obj : null;
}