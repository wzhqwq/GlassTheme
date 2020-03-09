var tbkBar = function () {
  var ehh = eh + 'When creating tool bar: ';

  var els = [];
  var views = [].shift.apply(arguments);
  views.map(function (view) {
    if (!view instanceof tbkView) {
      throw new Error(ehh + 'Every view must be an instance of gt.toolbarKit.View');
    }
    els.push(view.bind());
  });

  var bar = document.createElement('div');
  var outter = document.createElement('div');
  bar.className = 'gt-toolbar';
  outter.className = 'gt-toolbar-out';
  var mainvel = els[0];
  bar.appendChild(mainvel);
  outter.appendChild(bar);
  bar.style.width = mainvel.style.width;
  var stack = [];
  var title_el;

  constP(this, 'enter', function (id) {
    var eh = eh + 'When entering another view: ';
    if (typeof id != 'number' || id <= 0 || id >= views.length) {
      throw new Error(eh + 'Illegal id');
    }
    if (views[id].onenter) {
      views[id].onenter(this);
    }
    var title = arguments[1];
    if (title) {
      var tool;
      if (stack.length) {
        throw new Error(eh + 'You can only create title from main view');
      }
      if (typeof title != 'string' || !(tool = views[0].tools[title])) {
        throw new Error(eh + 'Illegal tool name');
      }
      if (!tool instanceof tbkBtnTool) {
        throw new Error(eh + 'only button-like tool can be used as title');
      }
      title_el = tool.tool.cloneNode(true);
      title_el.className = 'gt-tool gt-tool-title';
    }
  });   
  
  constP(this, 'bar', outter);
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
  var tools = [].shift.apply(arguments);
  var els = [];
  var width = 0;
  tools.map(function (tool) {
    if (!tool instanceof tbkTool) {
      throw new Error(ehh + 'Every tool must be an instance of Tool');
    }
    if (tool instanceof tbkGroup) {
      
    }
    else
      els[tool.name] = tool.tool;
    view.appendChild(tool.tool);
    
    var ml = width + 2;
    width += tool.width;
    
    tool.tool.addEventListener('mouseenter', function () {
      hover.style.width = `${tool.width - 4}px`;
      hover.style.marginLeft = `${ml}px`;
      hover.style.filter = 'opacity(.2)';
    });
  });
  view.style.width = `${width}px`;
  
  view.addEventListener('mouseleave', function () {
    hover.style.filter = 'opacity(0)';
  })

  constP(this, 'elements', els);
  constP(this, 'tools', tools);
  var bound = false;
  constP(this, 'bind', function () {
    if (bound) {
      throw new Error(eh + 'View can only be bound once');
    }
    bound = true;
    return view;
  });
};

// private
var tbkTool = function (name, width) {
  constP(this, 'name', name);
  constP(this, 'tool', document.createElement('div'));
  constP(this, 'width', width);
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

  this.__proto__ = new tbkTool(name, 40);
  var tool = this.tool;
  tool.className = 'gt-tool-btn';
  color = arguments[typeof arguments[2] == 'string' ? 2 : 3] || color;
  if (color[0] == '-') {
    color = `var(-${color})`;
  }
  tool.style = `--ccc: ${color}`;
  if (arguments[2] === true || arguments[3] === true) {
    tool.style.filter = 'drop-shadow: 0 0 1px gray';
  }

  var els = [];
  icons.map(function (icon, i) {
    if (!icon instanceof ikIcon && !icon instanceof ikIconGroup) {
      throw new Error(ehh + 'Every icon must be an instance of gt.iconKit.Icon or gt.iconKit.IconGroup');
    }
    if (icon.width != icon.height) {
      throw new Error(ehh + 'Every icon must be a square.');
    }
    els.push(icon.icon(icon.width == 40 ? null : {w: 40}));
    els[i].style.zoom = '.75';
    tool.appendChild(els[i]);
    els[i].style.display = 'none';
  });

  var current = els[0];
  current.style.display = 'block';

  constP(this, 'setIcon', function (id) {
    if (typeof id != 'number' || id < 0 || id >= els.length) {
      throw new Error(eh + 'When changing icon: illegal id.');
    }
    current.style.filter = 'opacity(0)';
    current = els[id];
    current.style.filter = 'opacity(1)';
  });
};

var tbkGroup = function () {
  var eh = eh + 'When creating tool group: ';
  var tools = [].slice.call(arguments);
  var els = [];
  
  this.__proto__ = new tbkTool('', 40);
  var pop = document.createElement('div');
  group.className = 'gt-tool-group';
  pop.className = 'gt-tool-groupout';
  
  
  tools.map(function (item) {
    if (!item instanceof tbkBtnTool) {
      throw new Error(eh + 'Every tool must be an instance of gt.toolbarKit.BtnTool');
    }
    pop.appendChild(item.tool);
    els[item.name] = item.tool;
  });
  
  var t;
  this.tool.addEventListener('mouseenter', function() {
    t = setTimeout((tool, pop, t) => {
      tool.className = 'gt-tool-group gt-acmlt';
      
    }, 200, tool, pop, t);
  })
  
  constP(this, 'elements', els);
  constP(this, 'tools', tools);
};

gt.toolbarKit = {
  Bar: tbkBar,
  View: tbkView,
  BtnTool: tbkBtnTool,
  Group: tbkGroup,
};