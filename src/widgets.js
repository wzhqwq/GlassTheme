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