var tbkBar = function () {
  var ehh = eh + 'When creating tool bar: ';

  var bar = document.createElement('div');
  var outer = document.createElement('div');
  bar.className = 'gt-toolbar';
  outer.className = 'gt-toolbar-out';

  var els = [];
  var views = [].slice.apply(arguments);
  var thisObj = this;
  var ani1 = [];
  console.log(views);
  views.map(function (view, i) {
    if (!view instanceof tbkView) {
      throw new Error(ehh + 'Every view should be an instance of gt.toolbarKit.View');
    }
    view.barObj = thisObj;
    els.push(view.bind(outer));
    ani1.push(new gt.aniCtrlr(els[i], {opacity: '0', marginLeft: `${i * 40}px`}, {opacity: '1', marginLeft: `0`}, 200));
    bar.appendChild(els[i]);
    els[i].style.display = 'none';
  });
  els[0].style.display = 'block';
  
  outer.appendChild(bar);
  outer.style.width = bar.style.width = els[0].style.width;
  var stack = [];
  var title_el = [], ani2 = [];
  stack.push(0);
  
  constP(this, 'enter', function enter (id) {
    var eh = eh + 'When entering into another view: ';
    if (typeof id != 'number' || id <= 0 || id >= views.length) {
      throw new Error(eh + 'Illegal id');
    }
    if (views[id].onenter) {
      views[id].onenter(this);
    }
    var title = arguments[1];
    if (title) {
      var tool;
      if (stack.length != 1) {
        throw new Error(eh + 'You can only create title from main view');
      }
      if (typeof title != 'string' || !(tool = views[0].tools['t' + title])) {
        console.log(views[0].tools);
        throw new Error(eh + 'Illegal tool name');
      }
      if (!tool instanceof tbkBtnTool) {
        throw new Error(eh + 'only button-like tool can be used as title');
      }
      if (!title_el[title]) {
        var t = document.createElement('div');
        t.appendChild(tool.currentIcon.cloneNode(true));
        t.className = 'gt-tool-title';
        t.style.backgroundColor = tool.color;
        outer.appendChild(t);
        title_el[title] = t;
        ani2[title] = new gt.aniCtrlr(t, {opacity: '0', marginLeft: `${tool.position * 40 - 5}px`}, {opacity: '1', marginLeft: `0`}, 200);
      }
      title_el[title].style.display = 'block';
      els[id].style.display = 'block';
      ani1[id].start();
      ani1[stack[stack.length - 1]].start(true);
      if (title)
        ani2[title].start();
      bar.style.width = outer.style.width = els[id].style.width;
      stack.push(id);
    }
  });
  constP(this, 'exit', function () {
  })
  
  constP(this, 'bar', outer);
};

// View类通用，包含视图切换函数，可以作为唯一的主视图与Bar实例绑定
// 自定义：onopen onclose
var tbkView = function () {
  var ehh = eh + 'When creating tool view: ';

  var view = document.createElement('div');
  var hover = document.createElement('div');
  view.className = 'gt-toolbar-view';
  hover.className = 'gt-toolbar-hover';
  view.appendChild(hover);
  var tools = [].slice.apply(arguments);
  var tools_wait = [];
  var els = [];
  var width = 0;
  var thisObj = this;
  tools.map(function (tool, i) {
    if (tool instanceof tbkGroup) {
      tools_wait.push(tool.barReady);
      tool.tools.map(function (tool) {
        els['t' + tool.name] = tool.tool;
        tools['t' + tool.name] = tool;
      })
    }
    else if (tool instanceof tbkBtnTool) {
      els['t' + tool.name] = els[i] = tool.tool;
      tools['t' + tool.name] = tool;
    } else {
      throw new Error(ehh + 'Every tool should be an instance of Tool');
    }

    tool.viewObj = thisObj;
    tool.position = i;
    view.appendChild(tool.tool);
    
    var ml = width + 2;
    width += tool.width;
    
    tool.tool.addEventListener('mouseenter', function () {
      hover.style.width = `${tool.width - 4}px`;
      hover.style.marginLeft = `${ml}px`;
      hover.style.filter = 'opacity(.1)';
    });
  });
  view.style.width = `${width}px`;
  
  view.addEventListener('mouseleave', function () {
    hover.style.filter = 'opacity(0)';
  });

  constP(this, 'elements', els);
  constP(this, 'tools', tools);
  var bound = false;
  constP(this, 'bind', function (outer) {
    if (bound) {
      throw new Error(eh + 'View can only be bound once');
    }
    bound = true;
    tools_wait.map(function (item) {
      item(outer);
    });

    return view;
  });
  constP(this, 'view', view);
};

// icons, name[, color][, useShadow]
var tbkBtnTool = function (icons, name) {
  var ehh = eh + 'When creating Tool: ';
  var color = '-fullR';
  if (!name || typeof name != 'string') {
    throw new Error(ehh + 'Illegal name.');
  }
  if (!icons instanceof Array || !icons.length) {
    throw new Error(ehh + 'Illegal icons array.');
  }

  var tool = document.createElement('div');
  tool.className = 'gt-tool-btn';
  color = arguments[typeof arguments[2] == 'string' ? 2 : 3] || color;
  if (color[0] == '-') {
    color = `var(-${color})`;
  }
  tool.style = `--ccc: ${color}`;
  var el = tool;
  if (arguments[2] === true || arguments[3] === true) {
    el = document.createElement('div');
    tool.appendChild(el);
    el.style.filter = 'drop-shadow(0 0 1px var(--fullR))';
  }

  var els = [];
  icons.map(function (icon, i) {
    if (!icon instanceof ikIcon && !icon instanceof ikIconGroup) {
      throw new Error(ehh + 'Every icon should be an instance of gt.iconKit.Icon or gt.iconKit.IconGroup');
    }
    if (icon.width != icon.height) {
      throw new Error(ehh + 'Every icon should be a square.');
    }
    els.push(icon.icon(icon.width == 30 ? null : {w: 30}));
    el.appendChild(els[i]);
    els[i].style.display = 'none';
  });

  var current = els[0], curId = 0;
  current.style.display = 'block';

  constP(this, 'name', name);
  constP(this, 'tool', tool);
  constP(this, 'color', color);
  constP(this, 'setIcon', function (id) {
    if (typeof id != 'number' || id < 0 || id >= els.length) {
      throw new Error(eh + 'When changing icon: illegal id.');
    }
    current.style.filter = 'opacity(0)';
    current = els[id];
    curId = id;
    current.style.filter = 'opacity(1)';
  });
  Object.defineProperties(this, {
    currentIcon: {
      get: function () {
        return current;
      }
    },
    currentId: {
      get: function () {
        return curId;
      }
    }
  });
};
constP(tbkBtnTool.prototype, 'width', 40);

var tbkGroup = function () {
  var eh = eh + 'When creating tool group: ';
  var tools = [].slice.call(arguments);
  var els = [];
  
  var group = document.createElement('div');
  var pop = document.createElement('div');
  group.className = 'gt-tool-group';
  pop.className = 'gt-tool-grouppop';
  pop.style.display = 'none';
  
  tools.map(function (item) {
    if (!item instanceof tbkBtnTool) {
      throw new Error(eh + 'Every tool should be an instance of gt.toolbarKit.BtnTool');
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
constP(tbkGroup.prototype, 'width', 40);

gt.toolbarKit = {
  Bar: tbkBar,
  View: tbkView,
  BtnTool: tbkBtnTool,
  Group: tbkGroup,
};