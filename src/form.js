// 收集以gtf-开头的表单控件
var forms = new Map();
gt(function () {
  var fms = document.body.innerHTML.match(/(?<=id="gtf-)[^"]*/g);
  if (!fms) return;
  fms.forEach(name => {
    forms.set(name, { obj: null });
  })
});

// 控件块，name为相应控件的name
class fmFormBlock {
  html;
  domTemp;
  #name;
  #rendered;
  #widget;

  get name() { return this.#name; }
  get id() { return 'gtf-' + this.#name; }
  get dom() { return this.domTemp || get_element(this); }
  get rendered() { return this.#rendered; }

  constructor(name, title) {
    if (!widgets.has(name))
      throw new Error(eh + `It's an unknown name(${name}) of widget to bind the block.`);
    this.#name = name;
    var t1 = this.#widget = widgets.get(name).obj;
    if (t1 === null)
      throw new Error(eh + `The widget named '${name}' is not initialized.`);
    if (forms.has(name)) {
      this.html = this.dom.outerHTML;
      this.#rendered = true;
      return;
    }
    
    this.html = `<div class="gt-form-block" id="gtf-${name}"><label class="gt-form-title">${title}</label>${get_html(t1)}<div class="gt-form-msg"></div></div>`;
    this.#rendered = false;

    this.value = t1.value;
  }

  #show(msg, color) {
    if (this.#rendered) {
      let tip = this.dom.children[2];
      tip.innerHTML = msg;
      this.dom.className = this.dom.className.split(' ')[0] + (color ? ` gt-form-${color}` : '');
    }
    else
      this.html = this.html.replace(/(?<=>)[^<]*</, msg + '<').replace(/(?<=gt-form-block)[^>]*/, color ? '"' : ` gt-form-${color}"`);
    this.#widget.color(color);
  }

  tip(msg) {
    this.#show(msg);
  }
  warn(msg) {
    this.#show(msg, 'warning');
  }
  err(msg) {
    this.#show(msg, 'danger');
  }
  color(color) {
    if (this.#rendered) {
      let tip = this.dom.children[2];
      tip.className = tip.className.split(' ')[0] + (color ? ` gtc-${color}` : '');
    }
    else
      this.html = this.html.replace(/(?<=gt-form-msg)[^>]*/, color ? '"' : ` gtc-${color}"`);
    this.#widget.color(color);
  }
}

// 选框组，统一控制选框控件，输出选择情况，选框类型必须和选框组类型相符
class fmCbGroup {
  #name;
  #boxes;

  constructor(name, multi) {
    
  }
}

gt.Form = function (name) {
  return forms.has(name) ? fms.get(name).obj : null;
}

gt.Form.FormBlock = fmFormBlock;