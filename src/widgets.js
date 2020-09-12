((gt, window) => {
  // 收集带有gt-开头的控件
  var widgets = new Map();
  var document = window.document;
  gt(function () {
    var wig = document.body.innerHTML.match(/(?<=id="gt-)[^"]+/g);
    if (!wig) return;
    wig.forEach((name) => {
      widgets.set(name, {obj: null});
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
    #setter;
    #listeners = {};
    get dom() { return this.domTemp || get_element(this); }
    get rendered() { return this.#rendered; }
    get name() { return this.#name; }
    get id() { return 'gt-' + this.#name; }

    constructor (name, value, genFn, valueSetter, valueUpdter) {
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
        if (value === null)
          this.#value = el.innerHTML || el.value;
        else
          valueSetter[0].call(el, this.#value = value);

        this.afterRendering(el);
      }
      else {
        this.html = genFn(name, this.#value = value || '');
        this.#rendered = false;
      }
      widgets.set(name, {obj: this});
    }

    value(value) {
      if (value === null) return this.#value;

      this.#value = value;
      if (!this.#rendered)
        this.html = this.html.replace(this.#setter[1], value);
      else
        this.#setter[0].call(this.dom, value);
      return this;
    }
    width(value) {
      if (typeof value == 'number') value = `${value}px`;
      value = value || 'unset';

      if (!this.#rendered) {
        let pos = this.html.indexOf('style="');
        this.html = pos == -1 ? this.html.replace(/id="/, `style="width: ${value}" id="`) : this.html.replace(/width: [^;"]*/, '').replace(/style="/, `style="width: ${value}; `);
      }
      else
        this.dom.style.width = value;
      return this;
    }
    size(value) {
      if (!this.#rendered) {
        let pos = this.html.indexOf('class="');
        this.html = pos == -1 ? this.html.replace(/id="/, `class="${get_size_class(value)}" id="`) : this.html.replace(/gt-[lgsm]{2,2}/, '').replace(/class="/, `class="${get_size_class(value)}`);
      }
      else
        this.dom.className = this.domTemp.className.replace(/gt-[lgsm]{2,2}/, '') + get_size_class(value);
      return this;
    }
    color(value) {
      value = value || 'none';
      if (!this.#rendered) {
        let pos = this.html.indexOf('class="');
        this.html = pos == -1 ? this.html.replace(/id="/, `class="gtc-${value}" id="`) : this.html.replace(/gtc-[^/s]/, '').replace(/class="/, `class="gtc-${value} `);
      }
      else
        this.dom.className = this.domTemp.className.replace(/gtc-[^/s]/, '') + ' gtc-' + value;
      return this;
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
        this.#listeners[type] = {
          list: list,
          handler: e => {
            list.forEach(listener => {
              listener(e);
            });
          }
        };
      }
    }
  }

  // 文本框对象
  class wgtText extends Widget {
    constructor (name, value) {
      super(
        name, value,
        (name, value) => `<span id="gt-${name}" class="gt-text">${value}</span>`,
        [function (value) { this.innerHTML = value; }, /(?<=>)[^<]*/]
      );
    }
  }

  // 单行输入框，可以监听值的变化
  class wgtInputBox extends Widget {
    #hint;

    constructor (name, value) {
      super(
        name, value,
        (name, value) => `<input type="text" id="gt-${name}" class="gt-input" value="${value}">`,
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
  class wgtButton extends Widget {
    constructor (name, value) {
      super(
        name, value,
        (name, value) => `<button id="gt-${name}" class="gt-btn">${value}</button>`,
        [function (value) {
          this.tagName == 'input' ? (this.value = value) : (this.innerHTML = value);
        }, /(?<=value=">)[^"]*|(?<=">)[^<]*/]
      );
    }
  }

  gt.Widget = function (name) {
    if (widgets.has(name))
      return widgets.get(name).obj;
    return null;
  }

  gt.Widget.Text = wgtText;
  gt.Widget.InputBox = wgtInputBox;
  gt.Widget.Button = wgtButton;
})(gt, window);