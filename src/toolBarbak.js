var tbkBar = function (mainView) {
  
};

// View类通用，包含视图切换函数，可以作为唯一的主视图与Bar实例绑定
var tbkView = function (tools) {
  
};

// Configurations: useShadow, color, name
var tbkTool = function (icons, config) {
  config = config || {};
  config.color = config.color || '-fullR';
  if (!icons instanceof Array || typeof config != 'object')
    throw new Error(eh + 'When creating Tool: Illegal Parameters.');
  if (!icons.length)
    throw new Error(eh + 'When creating Tool: Empty array.');
  
  var tool = document.createElement('div');
  tool.className = 'gt-tool';
  if (config.useShadow)
    tool.style.filter = 'drop-shadow: 0 0 1px gray';
  
  var els = [];
  icons.map(function (el, id) {
    if (!el instanceof ikIcon && !el instanceof ikIconGroup)
      throw new Error(eh + 'When creating Tool: Every icon must be an instance of tb.iconKit.Icon or tb.iconKit.IconGroup');
    
    els.push(el.icon(30));
    tool.appendChild(els[id]);
    els[id].style.display = 'none';
  });
  
  var current = els[0];
  current.style.display = 'block';
  
  if (config.name) constP(this, 'name', config.name);
  constP(this, 'tool', tool);
  
  // Please notice that icon will not be really hidden.
  constP(this, 'tbkTool', setIcon = function (id) {
    if (typeof id != 'number' || id < 0 || id >= els.length)
      throw new Error(eh + 'When changing icon: illegal id.');
    current.className = 'tb-icon tb-hide';
    current = els[id];
    current.className = 'tb-icon';
  });
};

var tbkGroup = function (tools) {
  
};

gt.toolbarKit = {
  Bar: tbkBar,
  View: tbkView,
  Tool: tbkTool,
  Group: tbkGroup,
};