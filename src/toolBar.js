/* var tbkBar = function () {
  var ehh = eh + 'When creating tool bar: ';

  var bar = document.createElement('div');
  var outer = document.createElement('div');
  bar.className = 'gt-toolbar';
  outer.className = 'gt-toolbar-out';

  var els = [];
  var views = [].slice.apply(arguments);
  var thisObj = this;
  views.map(function (view, i) {
    if (!view instanceof tbkView) {
      throw new Error(ehh + 'Every view should be an instance of gt.toolbarKit.View');
    }
    view.barObj = thisObj;
    els.push(view.bind(outer));
    bar.appendChild(els[i]);
    els[i].style.display = 'none';
    views[i].aniIn = new gt.aniCtrlr(els[i], {opacity: '0', marginLeft: '20px'}, {opacity: '1', marginLeft: '0'}, 200);
    views[i].aniOut = new gt.aniCtrlr(els[i], {opacity: '1', marginLeft: '0'}, {opacity: '0', marginLeft: '-20px'}, 200);
  });
  els[0].style.display = 'block';
  
  outer.appendChild(bar);
  outer.style.width = bar.style.width = els[0].style.width;
  var stack = [];
  var title_el = [], ani1 = [], ani2 = [];
  stack.push(0);
  var exitHdl, offset = 0;
  
  constP(this, 'enter', function (id) {
    var eh = eh + 'When entering into another view: ';
    if (typeof id != 'number' || id <= 0 || id >= views.length) {
      throw new Error(eh + 'Illegal id');
    }
    if (views[id].onenter) {
      views[id].onenter(this);
    }
    var title = arguments[1];
    var last = stack[stack.length - 1];
    if (title) {
      var tool;
      offset = 40;
      if (stack.length != 1) {
        throw new Error(eh + 'You can only create title from main view');
      }
      if (typeof title != 'string' || !(tool = views[0].tools['t' + title])) {
        throw new Error(eh + 'Illegal tool name');
      }
      if (!tool instanceof tbkTool) {
        throw new Error(eh + 'only button-like tool can be used as title');
      }
      if (!title_el[title]) {
        var t = document.createElement('div');
        t.appendChild(tool.currentIcon.cloneNode(true));
        t.className = 'gt-tool-title';
        t.style.backgroundColor = tool.color;
        var exit = this.exit;
        t.addEventListener("click", function () {
          exit();
        })
        outer.appendChild(t);
        title_el[title] = t;
        ani1[title] = new gt.aniCtrlr(els[0], {opacity: '1', marginLeft: '0'}, {opacity: '0', marginLeft: `-${tool.position * 40}px`}, 200);
        ani2[title] = new gt.aniCtrlr(t, {opacity: '0', marginLeft: `${tool.position * 40 + 5}px`}, {opacity: '1', marginLeft: '5px'}, 200);
      }
      title_el[title].style.display = 'block';
      els[id].style.display = 'block';
      
      var viewAni = new gt.aniCtrlr(els[id], {opacity: '0', marginLeft: `${tool.position * 40 + 40}px`}, {opacity: '1', marginLeft: `40px`}, 200);
      viewAni.start();
      ani1[title].start().then(function () {
        this.style.display = "none";
      });
      ani2[title].start();
      exitHdl = function () {
        els[0].style.display = "block";
        viewAni.start(true).then(function () {
          this.style.display = "none";
        });
        ani1[title].start(true);
        ani2[title].start(true).then(function () {
          this.style.display = "none";
        });
        offset = 0;
        stack.pop();
      }
    }
    else {
      views[id].aniIn.start();
      views[last].aniOut.start();
      if (stack.length == 1) exitHdl = null;
    }
    bar.style.width = outer.style.width = `${parseInt(els[id].style.width) + offset}px`;
    stack.push(id);
  });
  constP(this, 'exit', function () {
    if (stack.length == 1) return;
    if (stack.length == 2 && exitHdl)
      exitHdl();
    else {
      views[stack.pop()].aniIn.start(true).then(function () {
        this.style.display = "none";
      });
      var now = stack[stack.length - 1];
      els[now].style.display = "block";
      views[now].aniOut.start(true);
    }
    bar.style.width = outer.style.width = `${parseInt(els[stack[stack.length - 1]].style.width) + offset}px`;
  })
  
  constP(this, 'bar', outer);
};
 */
class tbkBar {
  views = {};
  #count = 0;
  #bar = document.createElement("div");
  #stack = [];
  get count() { return this.#count; };
  get bar() { return this.#bar; };

  constructor(view) {
    if (!(view instanceof tbkView))
      throw new Error(eh + 'Please append gt.toolbar.View to Bar');
    this.views[view.name] = view;
    var e = view.view;
    e.style.zIndex = '0';
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
    e.style = `width: ${view.width}px; filter: opacity(0); z-index: -1; margin-left: 20px`;
    this.#bar.appendChild(e);
  }
  enter(viewName, titleTool) {
    var view = this.views[viewName], title, now = this.#stack.top();
    var ehh = eh + 'when entering into another view:';
    if (!view) throw new Error(ehh + 'inexistent view');

    if (titleTool) {
      title = now.tools[titleTool];
      if (!title) throw new Error(ehh + 'inexistent tool');
      if (title.tool.width != 40) throw new Error(ehh + 'illegal tool');

      now.view.style = `width: ${title.l + 40}px; z-index: ${this.#stack.length}; margin-left: -${title.l}px`;
      this.#stack.push(view);
      view.view.style = `width: ${view.width}px; z-index: ${this.#stack.length}; margin-left: 40px;`;
      this.#bar.style.width = `${view.width + 40}px`;
    }
    else {
      now.view.style = `width: ${now.view.width}px; filter: opacity(0); z-index: ${this.#stack.length}; margin-left: -20px`;
      this.#stack.push(view);
      view.view.style = `width: ${view.width}px; z-index: ${this.#stack.length}; margin-left: 0`;
      this.#bar.style.width = `${view.width}px`;
    }
  }
  exit() {
    if (!this.#stack.length) return;
    var now = this.#stack.pop();
    now.view.style = `width: ${now.width}px; filter: opacity(0); z-index: -1; margin-left: 20px`;
    now = this.#stack.top();
    now.view.style = `width: ${now.width}px; z-index: ${this.#stack.length}; margin-left: 0`;
    this.#bar.style.width = `${now.width}px`;
  }
}

// 自定义：onopen onclose
class tbkView {
  tools = {};
  #count = 0;
  #width = 0;
  #view = document.createElement("div");
  #hover = document.createElement("div");
  #name;
  get count() { return this.#count; };
  get width() { return this.#width; };
  get name() { return this.#name; };
  get view() { return this.#view; };

  constructor(name) {
    var view = this.#view, hover = this.#hover, tools = this.tools;
    view.className = 'gt-toolbar-view';
    hover.className = 'gt-toolbar-hover';
    view.appendChild(hover);
    view.addEventListener('mouseover', function (e) {
      hover.style.filter = 'opacity(.2)';
      var t = tools[e.target.id.split('-').pop()];
      if (!t) return;
      hover.style.marginLeft = `${t.l + 2}px`;
      hover.style.width = `${t.tool.width - 4}px`;
    });
    view.addEventListener('mouseleave', function (e) {
      if (e.target == view)
        hover.style.filter = 'opacity(0)';
    });
    view.addEventListener('click', function (e) {
      var t = tools[e.target.id.split('-').pop()];
      if (t && t.click) t.click();
    })

    this.#name = name;
  }

  append(toolObj, click) {
    if (this.tools[toolObj.name]) throw new Error(eh + 'tool name repeat: ' + toolObj.name);
    this.#view.appendChild(toolObj.tool);
    this.tools[toolObj.name] = {tool : toolObj, click : click, l : this.#width};
    this.#width += toolObj.width;
    this.#view.style.width = `${this.#width}px`;
    this.#count++;
    if (toolObj instanceof tbkTool || toolObj instanceof tbkGroup) {
    }
  }
};

class tbkTool {
  #color; #name; #tool;
  get width() { return 40; };
  get name() { return this.#name; };
  get tool() { return this.#tool; };
  get color() { return this.#color; };
  
  // name icon [attach color shadow]
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
    var tool = document.createElement("div");
    tool.id = 'tool-' + obj.name;
    tool.style = `--ccc: ${color}`;
    tool.className = 'gt-tool';
    var inner = '';
    if (obj.shadow)
      inner += '<div style="drop-shadow(0 0 1px var(--fullR))">';
    inner += '<div id="tool-m-' + obj.name + '" style="' + (obj.attach ? cssMask(obj.attach) : `width: ${res[obj.icon].w}px; height: ${res[obj.icon].h}px; position: absolute;`) + `"><div id="tool-a-${obj.name}" style="${cssImage(obj.icon)}" class="gt-icon"></div></div><div id="tool-b-${obj.name}"`;
    if (obj.attach) inner += ` style="${cssImage(obj.attach)}"`;
    inner += ' class="gt-icon"></div>';
    if (obj.shadow) inner += '</div>';
    tool.innerHTML = inner;

    this.#color = color;
    this.#name = obj.name;
    this.#tool = tool;
  }
  turnOn() {
    this.#tool.className = 'gt-tool-btn gt-rev';
  }
  turnOff() {
    this.#tool.className = 'gt-tool-btn';
  }
  attach(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When attaching icon: Illegal icon');
    document.getElementById('tool-b-' + this.#name).style = cssImage(icon);
    if (res[icon].mask) document.getElementById('tool-m-' + this.#name).style = cssMask(icon);
  }
  change(icon) {
    if (!icon || typeof icon != 'string' || !res[icon]) throw new Error(eh + 'When changing icon: Illegal icon');
    document.getElementById('tool-a-' + this.#name).style = cssImage(icon);
  }
};

var tbkGroup = function () {
  var ehh = eh + 'When creating tool group: ';
  var tools = [].slice.call(arguments);
  var els = [];
  
  var group = document.createElement('div');
  var pop = document.createElement('div');
  group.className = 'gt-tool-group';
  pop.className = 'gt-tool-grouppop';
  pop.style.display = 'none';
  
  tools.map(function (item) {
    if (!item instanceof tbkTool) {
      throw new Error(ehh + 'Every tool should be an instance of gt.toolbarKit.BtnTool');
    }
    pop.appendChild(item.tool);
    els[item.name] = item.tool;
  });
  
  var t;
  var first = pop.firstChild;
  group.appendChild(first);
  
  group.addEventListener('mouseenter', function() {
    t = setTimeout(function () {
      group.className = 'gt-tool-group gt-acmlt';
      t = setTimeout(function () {
        pop.insertBefore(first, pop.firstChild);
        pop.style.display = 'block';
        pop.className = 'gt-tool-grouppop gt-pop';
        group.className = 'gt-tool-group';
      }, 500);
    }, 200);
  });
  
  var f0 = function () {
    if (t) {
      clearTimeout(t);
      t = 0;
      group.className = 'gt-tool-group';
    }
  };
  group.addEventListener('mouseleave', f0);
  group.addEventListener('click', f0);
  var thisObj = this;
  var f1 = function () {
    pop.className = 'gt-tool-grouppop';
    pop.style.display = 'none';
    group.appendChild(first);
    thisObj.viewObj.view.dispatchEvent(new MouseEvent('mouseleave'));
  };
  pop.addEventListener('mouseleave', f1);
  pop.addEventListener('click', f1);
  
  constP(this, 'elements', els);
  constP(this, 'tools', tools);
  constP(this, 'tool', group);
  constP(this, 'name', '[group]');
  constP(this, 'barReady', function(outer) {
    outer.appendChild(pop);
    var pos = thisObj.position;
    pop.style.marginLeft = `${pos * 40}px`;
    tools.map(function (tool) {
      tool.position = pos;
    })
  });
};
// constP(tbkGroup.prototype, 'width', 40);

gt.toolbar = {
  Bar: tbkBar,
  View: tbkView,
  Tool: tbkTool,
  Group: tbkGroup,
};