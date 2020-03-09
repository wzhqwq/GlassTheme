(factory => {
  if (typeof module == 'object' && typeof module.exports == 'object')
    module.exports = factory;
  else
    window.gt = factory(window);
})(window => {
var gt = {};
// basic utilities
const eh = "Glass Theme: ";
function constP(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    configurable: false
  });
}
function checkP(eh, obj, arr) {
  arr.map(function (item) {
    if (!obj[item]) {
      throw new Error(eh + `property '${item}' lost`);
    }
  });
}
function checkPNumP(eh, obj, arr) {
  arr.map(function (item) {
    if (typeof obj[item] != 'number' || obj[item] <= 0) {
      throw new Error(eh + `Illegal property '${item}'`);
    }
  });
}

// animation utilities, public
// 已知动画：工具栏移动色块动画、view切换动画(双对象)、工具切换图标(单次动画)
((gt) => {
  // animation controller with separated timer
  gt.aniCtrlr = function () {
    var timer = 0;
  }
})(gt);

var ikIcon = function (img) {
  var eh = eh + 'When creating icon: ';
  var icon = document.createElement('div');
  icon.className = 'gt-icon';
  var color = typeof arguments[1] == 'string' ? arguments[1] : arguments[2];
  var pos = typeof arguments[1] == 'object' ? arguments[1] : arguments[2];

  if (img && img instanceof Element) {
    icon.appendChild(img);
    if (color) {
      throw new Error(eh + 'Element with color is not supported.');
    }
  }
  else if (typeof img == 'string') {
    var url = img;
    if (color) {
      if (color[0] == '-') {
        color = `var(-${color})`;
      }
      if (!pos) {
        throw new Error(eh + 'size & position are needed');
      }
      icon.style = `background-color: ${color}; -webkit-mask-image: url(${url}); -webkit-mask-position: -${pos.x}px -${pos.y}px; width: ${pos.w}px; height: ${pos.h}px`;
    }
    else {
      if (typeof pos == 'object') {
        icon.style = `background-image: url(${url}); background-position: -${pos.x}px -${pos.y}px; width: ${pos.w}px; height: ${pos.y}px`;
      }
      else {
        img = document.createElement('img');
        img.src = url;
        icon.appendChild(img);
      }
    }
  }
  else {
    throw new Error(eh + "When creating Icon: 'img' must be an element or a url.");
  }

  constP(this, 'icon', function (size) {
    var ret = icon.cloneNode(true);
    if (size) {
      var wrap = document.createElement('div');
      wrap.appendChild(ret);
      wrap.style = `width: ${size.w}px; height: ${size.h}`;
      if (size.w && size.h) {
        ret.style.transform = `scaleX(${Number(size.w / pos.w).toFixed(2)}) scaleY(${Number(size.h / pos.h).toFixed(2)})`;
      } else {
        ret.style.transform = `scale(${size.w ? Number(size.w / pos.w).toFixed(2) : Number(size.h / pos.h).toFixed(2)})`;
        if (size.w) {
          size.h = size.w / w * h;
        }
        else {
          size.w = size.h / h * w;
        }
      }
      if (size.w < pos.w) {
        ret.style.marginLeft = `-${(pos.w - size.w) / 2}px`;
      }
      if (size.h < pos.h) {
        ret.style.marginTop = `-${(pos.h - size.h) / 2}px`;
      }
    }
    return ret;
  });
  constP(this, 'width', pos.w); constP(this, 'height', pos.h);
};

var ikIconGroup = function (layers) {
  var eh = eh + 'When creating icon group: ';
  var icon = document.createElement('div');
  icon.className = 'gt-icon-group';
  var w = 0, h = 0;

  if (!layers instanceof Array || !layers.length) {
    throw new Error(eh + "Illeagal layer array.");
  }
  layers.map(function (item) {
    // {img, color}
    if (!item instanceof ikIcon) {
      throw new Error(eh + "Every layer must be an instance of iconKit.Icon");
    }
    w = w < item.width ? item.width : w;
    h = h < item.height ? item.height : h;
    icon.appendChild(item.icon());
  });
  icon.style = `width: ${w}px; height: ${h}px`;

  constP(this, 'icon', function (size) {
    var ret = icon.cloneNode(true);
    if (size) {
      var wrap = document.createElement('div');
      wrap.appendChild(ret);
      wrap.style = `width: ${size.w}px; height: ${size.h}`;
      if (size.w && size.h) {
        ret.style.transform = `scaleX(${Number(size.w / w).toFixed(2)}) scaleY(${Number(size.h / h).toFixed(2)})`;
      } else {
        ret.style.transform = `scale(${size.w ? Number(size.w / w).toFixed(2) : Number(size.h / h).toFixed(2)})`;
        if (size.w) {
          size.h = size.w / w * h;
        }
        else {
          size.w = size.h / h * w;
        }
      }
      if (size.w < w) {
        ret.style.marginLeft = `-${(w - size.w) / 2}px`;
      }
      if (size.h < h) {
        ret.style.marginTop = `-${(h - size.h) / 2}px`;
      }
    }
    return ret;
  });
  constP(this, 'width', w);  constP(this, 'height', h);
};


var ikIconMap = function (url, config) {
  var eh = eh + 'When creating iconMap: ';
  var icons = [];
  if (typeof url != 'string') {
    throw new Error(eh + 'url must be a String');
  }
  if (typeof config != 'object') {
    throw new Error(eh + 'config must be an Object');
  }
  checkP(eh, config, ['width', 'height', 'rows']);
  checkPNumP(eh, config, ['width', 'height']);
  if (!config.rows instanceof Array || !config.rows.length) {
    throw new Error(eh + 'Illegal rows array');
  }

  var w = config.width, h = config.height, r = config.rows;
  var n = [];
  r.map(function (col, i) {
    col.map(function (item, j) {
      n[item.name] = new ikIcon(url, item.color, {x: j * w, y: i * h, w: w, h: h});
    });
  });

  constP(this, 'getIcons', function (name) {
    var ret = [];
    if (typeof name == 'string') {
      name = [name];
    }
    name.map(function (item) {
      ret.push(n[item]);
    });
    return ret;
  });
};

gt.iconKit = {
  Icon: ikIcon,
  IconGroup: ikIconGroup,
  IconMap: ikIconMap,
}
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

return gt;
});