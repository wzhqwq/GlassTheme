// 包管理器

var package = function (name, code) {
  var pack = {};
  window.require = function(name) {
    if (!pack[name]) return null, console.error("Module Error: Module '" + name + "' do not exist.");
    var p = new Object(pack[name]);
    console.info("Module Start: " + name);
    p();
    return p.exports;
  }

  Object.defineProperties(window.module = {}, {
    exports: {
      set: function foo(o) {
        foo.caller.exports = o;
      }
    },
  });

  package = function (name, code) {
    if (pack[name]) return 0, console.error("Module '" + name + "' already exists.");
    pack[name] = code;
  }
  package.main = function () {
    if (!pack["main"]) return 0, console.log("Module Error: Main module do not exist.");
    pack["main"]();
  }
  return package(name, code);
};

var constP = (obj, name, value) => {
  Object.defineProperty(obj, name, {value: value, configurable: false});
};

// 工具栏包, 将会统一管理在import出的实例中添加的工具栏
package("toolBar", function () {
  // public vars
  var bars = [], popTimer = 0;
  var lightf1 = function () {
      if (this.hover) return;
      this.hover = true;
      $(this).addClass("gt-tool-hover");
    },
    unltf1 = function () {
      this.hover = false;
      $(this).removeClass("gt-tool-hover");
    },
    lightf2 = function () {
      if (this.opened) return;
      this.opened = true;
      $(this).addClass("gt-tool-hover");
      timer1 = setTimeout(function (el) {
        $(el).removeClass("gt-tool-hover").addClass("gt-tool-pop");
      }, 700, this);
      document.body.addEventListener("click", unltf2);
    },
    unltf2 = function () {
      this.opened = false;
      $(this).removeClass("gt-tool-hover").removeClass("gt-tool-pop");
      console.log("leave");
      clearTimeout(timer1);
      document.body.removeEventListener("click", unltf2);
    };

  var viewMgr = function () {
    
  }

  var builder = function (tools) {
    var bar = document.createElement('div'), count = tools.length;
    var mainView = document.createElement('div');
    bar.className = "gt-toolbar";
    mainView.className = "gt-toolbar-view";
    $(bar).css("width", 40 * count);
    tools.map(function (el, i) {
      constP(el, "idInBar", i);
      mainView.appendChild(el.tool);
    });
    bar.appendChild(mainView);
    bars.push(this);

    constP(this, "bar", bar);
    constP(this, "view", mainView);
    constP(this, "tools", tools);
    constP(this, "count", count);
    constP(this, "id", bars.length);
  }
  builder.prototype.say = function () {
    console.log("I'm alive!");
  }
  builder.prototype.addSecondaryView = function (titleTool, tools) {
    if (typeof titleTool != "number" || titleTool < 0 || titleTool > this.count)
      return;
    var tool = this.tools[parseInt(titleTool)];
    var title = document.createElement('div'),
      view = document.createElement('div');
    var count = tools.length + 1;

    switch (tool.type) {
    case 1:
      title = tool.tool.cloneNode(true);
      break;
    case 2:
      title = tool.tools[0].tool.cloneNode(true);
      break;
    }
    title.className = "gt-tool gt-tool-rev gt-tool-title";

    view.appendChild(title);
    tools.map(function (el) {
      view.appendChild(el.tool);
    });
    view.className = "gt-toolbar-view";
    this.bar.appendChild(view);
    var thisObj = this;
    var delta, progress = 0, p = 40 * tool.idInBar;

    function slide(hide, ) {
      if ((delta > 0 && progress == 100) || (delta < 0 && progress == 0)) {
        slideTimer = 0;
        if (progress) {
          thisObj.view.style.display = "none";
          view.style.marginTop = "0";
        }
        else {
          view.style.display = "none";
          thisObj.view.style = "-45px";
        }
        return;
      }
      progress += delta;
      progress = progress > 100 ? 100 : (progress < 0 ? 0 : progress);
      $(view).css("marginLeft", p * (1 - progress / 100)).css("opacity", progress / 100);
      $(thisObj.view).css("marginLeft", -p * progress / 100).css("opacity", 1 - progress / 100);
      slideTimer = setTimeout(slide, 10);
    }

    tool.enter = function () {
      thisObj.bar.style = `width: ${count * 40 + 5}px;`;
      view.style.display = "block";
      delta = 6; slide();
    }
    tool.back = function () {
      thisObj.bar.style = `width: ${thisObj.count * 40}px`;
    }
  }

  function getMask(img, color) {
    var mask = document.createElement('div');

    mask.appendChild(img);
    mask.className = "gt-tool-mask";
    img.style.borderBottom = "6px transparent solid";
    if (color) {
      if (color[0] == '-') color = "var(-" + color + ")";
      mask.style = `--ia: ${color}`;
    }
    return mask;
  }

  builder.tool = function (useMask, inner, color) {
    if (!inner) return 0;
    var tool = document.createElement('div');

    color = color || "-fullR";
    if (color[0] == '-') color = `var(-${color})`;
    tool.style = `--ia: ${color}`;

    if (!(inner instanceof Array))
      inner = useMask ? [{img: inner, color: color}] : [{img: inner, shadow: false}];

    inner.map(function(piece, i) {
      piece = piece.img;
      if (typeof piece == "string") {
        piece.replace(/(\:\/\/)/, "¥");
        var src = piece.split(":");
        src[0].replace(/[¥]/, "://");
        var img;

        if (src.length != 1) {
          img = document.createElement('div');
          img.style = `background-image: url(${src[0]}); background-position: -${Number(src[1]) * 30}px -${Number(src[2]) * 30}px`;
          img.className = "gt-tool-limit";
        } else {
          img = document.createElement('img');
          img.src = src[0];
          img.className = "gt-tool-limit";
        }

        inner[i].img = img;
      }
    });
    if (useMask)
      inner.map(function(el) {
        tool.appendChild(getMask(el.img, el.color));
      });
    else
      inner.map(function(el) {
        tool.appendChild(el.img);
        el.img.style.marginBottom = "40px";
        if (el.shadow)
          el.img.style.filter = "drop-shadow(0 0 1px gray)";
      });

    tool.className = "gt-tool";
    tool.addEventListener("mouseenter", lightf1);
    tool.addEventListener("mouseleave", unltf1);

    constP(this, "tool", tool);
    constP(this, "type", 1);
    this.click = function (handler) {
      tool.addEventListener("click", handler);
      return this;
    }
  }

  builder.toolGroup = function (tools) {
    var group = document.createElement('div'), container = document.createElement('div');
    tools.map(function(el) {
      container.appendChild(el.tool);
    });

    group.className = "gt-tool-group";
    group.appendChild(container);
    container.className = "gt-tool-group-container";
    container.style = `--count: ${tools.length}`;
    container.addEventListener("mouseenter", lightf2);
    container.addEventListener("mouseleave", unltf2);

    constP(this, "type", 2);
    constP(this, "tool", group);
    constP(this, "tools", tools);
  }
    
  
  module.exports = builder;
});


package("main", function () {
  var bg = "icons_s.png";
  var toolBar = require("toolBar");
  var Tool = toolBar.tool;
  var Group = toolBar.toolGroup;

  var basic = new toolBar([
    new Tool(true, bg + ":0:0", "-fullR").click(function () {
      $(this).toggleClass("gt-tool-rev")
    }),
    new Group([
      new Tool(true, bg + ":1:0"),
      new Tool(true, bg + ":2:0")
    ]),
    new Group([
      new Tool(true, bg + ":3:0"),
      new Tool(true, bg + ":4:0")
    ]),
    new Tool(true, bg + ":5:0"),
    new Tool(true, bg + ":6:0")
  ]);
  var run = new toolBar([
    new Group([
      new Tool(true, bg + ":7:0", "-green"),
      new Tool(true, [{img: bg + ":8:0", color: "-green"}, {img: bg + ":9:0", color: "-blue"}])
    ]),
    new Group([
      new Tool(true, bg + ":10:0", "-orange"),
      new Tool(true, [{img: bg + ":11:0", color: "-orange"}, {img: bg + ":9:0", color: "-blue"}]),
      new Tool(false, [{img: bg + ":12:0", shadow: true}])
    ]),
    new Group([
      new Tool(true, [{img: bg + ":13:0", color: "-blue"}, {img: bg + ":14:0", color: "-green"}], "-blue"),
      new Tool(true, [{img: bg + ":15:0", color: "-blue"}, {img: bg + ":16:0", color: "-orange"}]),
      new Tool(true, [{img: bg + ":18:0", color: "-blue"}, {img: bg + ":17:0", color: "-fullR"}])
    ])
  ]);

  /*run.addSecondaryView(1, [
    new Tool(true, bg + ":0:1", "-orange"),
    new Tool(true, bg + ":2:1", "-red"),
    new Tool(true, bg + ":3:1"),
    new Tool(true, bg + ":4:1"),
    new Tool(true, bg + ":5:1"),
  ]);
  run.tools[1].tools[1].click(function () {
    console.log(1);
    run.tools[1].enter();
  });*/

  $('.main').append(basic.bar).append(run.bar);
});
package("fUtils", function () {
  
});

window.onload = () => package.main();
  