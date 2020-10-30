import { eh, GlassTheme } from "./../GlassTheme";

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
export class FormBlock extends GlassTheme {
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
      if (forms.get(name).obj)
        throw new Error(`name'${name}' has been bound.`);
      this.html = this.dom.outerHTML;
      this.#rendered = true;
    }
    else {
      this.html = `<div class="gt-form-block" id="gtf-${name}"><label class="gt-form-title">${title}</label>${get_html(t1)}<div class="gt-form-msg"></div></div>`;
      this.#rendered = false;
      
      this.value = t1.value;
    }
    forms.set(name, {obj: this});
  }

  #show(msg, color) {
    if (this.#rendered) {
      let tip = this.dom.children[2];
      tip.innerHTML = msg;
      this.dom.className = this.dom.className.split(' ')[0] + (msg ? (color ? ` gt-form-${color}` : ' gt-form-default') : '');
    }
    else
      this.html = this.html.replace(/(?<=>)[^<]*</, msg + '<').replace(/(?<=gt-form-block)[^>]*/, msg ? (color ? ` gt-form-${color}"` : ' gt-form-default"') : '');
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

  afterRendering() {
    this.#rendered = true;
  }
  afterRemoved(element) {
    this.html = element.outerHTML;
    this.#rendered = false;
  }
}

export class RatioGroup {
  html;
  domTemp;
  #name;
  #rendered;
  #listeners = [];
  #value;
  #buffer = '';
  #clear_postpone = false;
  #count = 0;

  get dom() { return this.domTemp || get_element(this); }
  get id() { return 'gtf-' + this.#name; }
  get rendered() { return this.#rendered; }
  get value() { return this.#value; }

  constructor(name) {
    this.#name = name;
    if (forms.has(name)) {
      this.#rendered = true;
    }
    else {
      this.html = `<div class="gt-radio-group" id="gtf-${name}"></div>`
      this.#rendered = false;
    }
    forms.set(name, {obj: this});
  }
  
  append({prefix = '', suffix = '', value} = {}, instantly = false) {
    this.#buffer += `<div onclick="">` + prefix + (value ? `<input type="radio" class="gt-input" id="gtf-${this.#name}-${this.#count++}" name="${this.#name}" value="${value}">` : '') + suffix + '</div>';
    if (instantly) this.update();
  }
  update() {
    if (this.#clear_postpone) {
      this.#clear_postpone = false;
      if (this.#rendered)
        this.dom.innerHTML = this.#buffer;
      else
        this.html = this.html.replace(/(?<=<div[^>]*>)*(?=<\/div>)/, this.#buffer);
    }
    else {
      if (this.#rendered)
        this.dom.innerHTML += this.#buffer;
      else
        this.html = this.html.slice(0, -6) + this.#buffer + '</div>';
    }
    this.#buffer = '';
  }
  clear(instantly = true) {
    this.#buffer = '';
    this.#clear_postpone = true;
    this.#count = 0;
    if (instantly) this.update();
  }

  #clickHandler(e) {
    var name = e.target.name;
    if (name && name == this.#name) {
      let val = e.target.value;
      if (val != this.#value)
        this.#listeners.forEach(fn => fn(this.#value));
      this.#value = val;
    }
  }

  afterRendering(element) {
    element.addEventListener('click', this.#clickHandler.bind(this));
    this.#rendered = true;
  }
  afterRemoved(element) {
    this.html = element.outerHTML;
    element.removeEventListener('click', this.#clickHandler.bind(this));
    this.#rendered = false;
  }

  change(fn) {
    this.#listeners.push(fn);
  }
  unbind(fn) {
    for (var i = this.#listeners.length - 1; i >= 0; i--)
      if (this.#listeners[i] == fn)
        this.#listeners.splice(i, 1);
  }
}

gt.Form = function (name) {
  return forms.has(name) ? forms.get(name).obj : null;
}
