class tbkOther {
  #width;
  get width() { return this.#width; };

  constructor (width) {
    this.#width = width;
  }
}

class tbkBar {
  views = {};
  #count = 0;
  #bar = document.createElement("div");
  #stack = [];
  #title = document.createElement("div");
  get count() { return this.#count; };
  get bar() { return this.#bar; };

  constructor(view) {
    if (!(view instanceof tbkView))
      throw new Error(eh + 'Please append gt.toolbar.View to Bar');
    this.views[view.name] = view;
    var e = view.view;
    e.style.zIndex = '0';
    this.#title.className = 'gt-toolbar-title';
    this.#bar.appendChild(this.#title);
    this.#bar.appendChild(e);
    this.#bar.className = 'gt-toolbar';
    this.#bar.style.width = `${view.width}px`;
    this.#stack.push(view);
    this.#stack.top = function () {
      return this[this.length - 1];
    }
  }

  append(view) {
    if (!(view instanceof tbkView))
      throw new Error(eh + 'Please append gt.toolbar.View to Bar');
    this.views[view.name] = view;
    var e = view.view;
    e.style = `width: ${view.width}px; filter: opacity(0); z-index: -1; margin-left: 20px; display: none;`;
    this.#bar.appendChild(e);
  }
  enter(viewName, titleTool) {
    var view = this.views[viewName], now = this.#stack.top();
    var ehh = eh + 'when entering into another view:';
    if (!view) throw new Error(ehh + 'inexistent view');
    if (titleTool && this.#title.innerHTML) throw new Error(ehh + 'title has been set already');
    var bar = this.#bar, stack = this.#stack, titleWrap = this.#title;

    bar.style.overflow = 'hidden';
    view.view.style.display = 'block';
    if (titleTool) {
      let title = now.tools[titleTool];
      if (!title) throw new Error(ehh + 'inexistent tool');
      if (!(title.tool instanceof tbkTool || title.tool instanceof tbkGroup)) throw new Error(ehh + 'illegal tool');
      
      let content = title.tool.tool
      titleWrap.innerHTML = (title.tool instanceof tbkTool ? content : content.slice(content.indexOf('">') + 2, -6)).replace(/ (id|title|tabindex)="[^\s]*/g, '');
      setTimeout(() => {
        now.view.style = `width: ${title.l + 40}px; z-index: ${stack.length}; margin-left: -${title.l}px; overflow: hidden;`;
        // now.disabled = true;
        stack.push(view);
        view.view.style = `width: ${view.width}px; z-index: ${stack.length}; margin-left: 40px;`;
        bar.style.width = `${view.width + 40}px`;
      }, 0);
    }
    else {
      setTimeout(() => {
        now.view.style = `width: ${now.view.width}px; filter: opacity(0); z-index: ${stack.length}; margin-left: -20px`;
        stack.push(view);
        view.view.style = `width: ${view.width}px; z-index: ${stack.length}; margin-left: 0`;
        bar.style.width = `${view.width}px`;
      }, 0);
    }
    setTimeout(() => {
      bar.style.overflow = 'visible';
      now.view.style.display = 'none';
      if (titleTool) titleWrap.style = 'display: block';
    }, 300);
  }
  exit() {
    if (!this.#stack.length) return;
    var bar = this.#bar, stack = this.#stack, title = this.#title;
    var now = stack.pop(), esc = stack.top();
    if (title.innerHTML) {
      title.style.display = 'none';
      title.innerHTML = '';
    }
    now.view.style = `width: ${now.width}px; filter: opacity(0); z-index: -1; margin-left: 20px`;
    esc.view.style.display = 'block';
    bar.style.overflow = 'hidden';
    setTimeout(() => {
      esc.view.style = `width: ${esc.width}px; z-index: ${stack.length}; margin-left: 0`;
    }, 0);
    // next.disabled = false;
    bar.style = `width: ${esc.width}px; overflow: hidden;`;
    setTimeout(() => {
      esc.view.style.overflow = bar.style.overflow = 'visible';
      now.view.style.display = 'none';
    }, 300)
  }
}

// 自定义：onopen onclose
var viewC = 0;
class tbkView {
  tools = {};
  // disabled = false;
  #count = 0;
  #width = 0;
  #view = document.createElement("div");
  #name;
  get count() { return this.#count; };
  get width() { return this.#width; };
  get name() { return this.#name; };
  get view() { return this.#view; };

  constructor(name) {
    var view = this.#view, tools = this.tools, hover = null, thisObj = this;
    view.className = 'gt-toolbar-view';
    var vc = viewC++;
    view.innerHTML += `<div class="gt-toolbar-hover"></div>`;
    view.addEventListener('mouseover', function (e) {
      // if (thisObj.disabled) return;
      if (!hover) hover = view.firstChild;
      var t = tools[e.target.id.match(/(?<=tool-[abm]?-)[^\s]*/) || ''];
      if (!t) return;
      hover.style.filter = 'opacity(.2)';
      hover.style.marginLeft = `${t.l + 2}px`;
      hover.style.width = `${t.tool.width - 4}px`;
    });
    view.addEventListener('mouseleave', function (e) {
      if (!hover) hover = view.firstChild;
      hover.style.filter = 'opacity(0)';
    });
    view.addEventListener('click', function (e) {
      // if (thisObj.disabled) return;
      var t = tools[e.target.id.match(/(?<=tool-)[^\s]*/) || ''];
      if (t) {
        if (t.pop) t.pop.clickHandler(t.shell);
        if (t.click) t.click(t.tool);
      }
    });
    view.addEventListener('mousemove', function (e) {
      // if (thisObj.disabled) return;
      var t = tools[e.target.id.match(/(?<=tool-[abm]?-)[^\s]*/) || ''];
      if (t && t.pop) t.pop.mousemoveHandler(t.shell);
    });
    view.addEventListener('mouseout', function (e) {
      var t = tools[e.target.id.match(/(?<=tool-[abm]?-)[^\s]*/) || ''];
      if (t && t.pop) t.pop.mouseleaveHandler(t.shell);
    });
    view.addEventListener('focus', function (e) {
      e.preventDefault();
      (focus_now = e.target.children[1]).focus();
    });

    this.#name = name;
  }

  append(toolObj, click) {
    if (!(toolObj instanceof tbkTool || toolObj instanceof tbkGroup || toolObj instanceof tbkOther))
      throw new Error(eh + 'illegal tool');
    if (this.tools[toolObj.name]) throw new Error(eh + 'tool name repeat: ' + toolObj.name);
    this.#view.innerHTML += toolObj.tool;
    this.tools[toolObj.name] = {tool : toolObj, click : click, l : this.#width};
    this.#width += toolObj.width;
    this.#view.style.width = `${this.#width}px`;
    this.#count++;
    var view = this.#view;

    if (toolObj instanceof tbkGroup) {
      if (click) toolObj.tools[toolObj.name].click = click;
      let trigger = (this.tools[toolObj.name].pop = new aniTemporaryPop(toolObj.pop, {preserve: true, position: {x: 2, y: 2}, appendTo: toolObj.pop.firstChild, popupStyle: 'border-radius: 10px;'}, null, () => {
        // 背后的高亮消失
        view.firstChild.style.filter = 'opacity(0)';
      })).tabEnterHandler;
      let shell = null;
      Object.defineProperty(this.tools[toolObj.name], 'shell', {
        get: function () {
          if (!shell) shell = document.getElementById(`gt-tgroup-${toolObj.id}`);
          return shell;
        }
      })
      tabNavTriggers[`gt-tgroup-${toolObj.id}`] = function (el) {
        trigger(el);
      }
    }
  }
};

class tbkTool {
  #color; #name; #tool; #empty_mask; #isOn = false;
  get width() { return 40; };
  get name() { return this.#name; };
  get tool() { return this.#tool; };
  get color() { return this.#color; };
  get isOn() { return this.#isOn; };
  
  // name icon [attach color shadow title]
  constructor(obj) {
    var ehh = eh + 'When creating Tool: ';
    if (!obj || typeof obj != 'object') throw new Error(ehh + 'Illegal parameter.');
    if (!obj.name || typeof obj.name != 'string') throw new Error(ehh + 'Illegal name.');
    if (!obj.icon || typeof obj.icon != 'string' || !res[obj.icon]) throw new Error(ehh + 'Illegal icon.');
    if (obj.attach && (typeof obj.attach != 'string' || !res[obj.attach])) throw new Error(ehh + 'Illegal attachment icon');

    var color = obj.color || '-halfR';
    if (color[0] == '-') {
      color = `var(-${color})`;
    }
    var tool = `<div id="tool-${obj.name}" style="--ccc: ${color}" class="gt-tool"`;
    if (obj.title) tool += ` title="${obj.title}"`;
    tool += ' tabindex="0" role="button">';
    if (obj.shadow)
      tool += '<div style="drop-shadow(0 0 1px var(--fullR))">';
    this.#empty_mask = `width: ${res[obj.icon].w}px; height: ${res[obj.icon].h}px; position: absolute;`;
    tool += '<div id="tool-m-' + obj.name + '" style="' + ((obj.attach && res[obj.attach].mask) ? cssMask(obj.attach) : this.#empty_mask) + `"><div id="tool-a-${obj.name}" style="${cssImage(obj.icon)}" class="gt-icon"></div></div><div id="tool-b-${obj.name}"`;
    if (obj.attach) tool += ` style="${cssImage(obj.attach)}"`;
    tool += ' class="gt-icon"></div></div>';
    if (obj.shadow) tool += '</div>';

    this.#color = color;
    this.#name = obj.name;
    this.#tool = tool;
  }
  turnOn() {
    document.getElementById('tool-' + this.#name).className = 'gt-tool gt-rev';
    this.#isOn = true;
  }
  turnOff() {
    document.getElementById('tool-' + this.#name).className = 'gt-tool';
    this.#isOn = false;
  }
  attach(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When attaching icon: Illegal icon');
    document.getElementById('tool-b-' + this.#name).style = cssImage(icon);
    document.getElementById('tool-m-' + this.#name).style = res[icon].mask ? cssMask(icon) : this.#empty_mask;
  }
  change(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When changing icon: Illegal icon');
    document.getElementById('tool-a-' + this.#name).style = cssImage(icon);
  }
};

var tbk_group_cnt = 0;
class tbkGroup {
  tools = {};
  id;
  #tool = '<div class="gt-tool-group" tabindex="0" id="gt-tgroup-';
  #pop = document.createElement("div");
  #count = 0;
  #name;
  get tool() { return this.#tool; };
  get pop() {
    this.#pop.style.height = `${(this.#count + 1) * 40 + 4}px`;
    return this.#pop;
  };
  get count() { return this.#count; };
  get width() { return 40; };
  get name() { return this.#name; };

  constructor(firstTool) {
    if (!(firstTool instanceof tbkTool)) throw new Error(eh + "please use Tool to create Group");
    this.tools[firstTool.name] = {tool: firstTool};
    this.#tool += `${++tbk_group_cnt}">${firstTool.tool}</div>`;
    this.id = tbk_group_cnt;
    this.#pop.className = 'gt-tool-grouppop';
    this.#pop.style.width = '44px';
    this.#pop.innerHTML = '<div style="width: 40px; height: 40px; margin-bottom: -2px;"></div>'
    this.#name = firstTool.name;
    
    var tools = this.tools;
    this.#pop.addEventListener('click', function (e) {
      var t = tools[e.target.id.split('-').pop()];
      if (t) if (t.click) t.click();
      e.stopPropagation();
    });
  }
  
  append(tool, click) {
    if (!(tool instanceof tbkTool)) throw new Error(eh + "please append Tool to Group");
    this.tools[tool.name] = {tool: tool, click: click};
    this.#pop.innerHTML += tool.tool;
    this.#count++;
  }
}

gt.toolbar = {
  Bar: tbkBar,
  View: tbkView,
  Tool: tbkTool,
  Group: tbkGroup,
};