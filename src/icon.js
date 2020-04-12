var ikIcon = function (img) {
  var eh = eh + 'When creating icon: ';
  var icon = document.createElement('div');
  icon.className = 'gt-icon';
  var arg1 = arguments[1], arg2 = arguments[2];
  var color = typeof arg1 == 'string' ? arg1 : (typeof arg2 == 'string' ? arg2 : null);
  var pos = typeof arg1 == 'object' ? arg1 : (typeof arg2 == 'object' ? arg2 : null);
  var h, w;

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
      w = pos.w; h = pos.h;
      icon.style = `--cc: ${color}; -webkit-mask-image: url(${url}); -webkit-mask-position: -${pos.x}px -${pos.y}px; width: ${pos.w}px; height: ${pos.h}px`;
    }
    else {
      if (typeof pos == 'object') {
        icon.style = `background-image: url(${url}); background-position: -${pos.x}px -${pos.y}px; width: ${pos.w}px; height: ${pos.h}px`;
        w = pos.w; h = pos.h;
      }
      else {
        img = document.createElement('img');
        img.onload = function () {
          w = parseInt(img.width);
          h = parseInt(img.height);
        }
        icon.appendChild(img);
        img.src = url;
      }
    }
  }
  else {
    throw new Error(eh + "When creating Icon: 'img' should be an element or a url.");
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
  var w = 0, h = 0;

  if (!layers instanceof Array || !layers.length) {
    throw new Error(eh + "Illeagal layer array.");
  }
  layers.map(function (item) {
    // {img, color}
    if (!item instanceof ikIcon) {
      throw new Error(eh + "Every layer should be an instance of iconKit.Icon");
    }
    w = w < item.width ? item.width : w;
    h = h < item.height ? item.height : h;
    if (item.mask) {
      var iconn = document.createElement("div");
      icon.style = `-webkit-mask-image: url(${item.mask.url}); -webkit-mask-position: -${item.mask.x}px -${item.mask.y}px; width: ${item.mask.w}px; height: ${item.mask.h}px`
      icon.className = 'gt-icon'
      iconn.appendChild(icon);
      icon = iconn;
    }
    icon.appendChild(item.icon());
  });
  icon.className = 'gt-icon-group';
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
    throw new Error(eh + 'url should be a String');
  }
  if (typeof config != 'object') {
    throw new Error(eh + 'config should be an Object');
  }
  checkP(eh, config, ['width', 'height', 'rows']);
  checkPNumP(eh, config, ['width', 'height']);
  if (!config.rows instanceof Array || !config.rows.length) {
    throw new Error(eh + 'Illegal rows array');
  }

  var w = config.width, h = config.height, r = config.rows;
  var n = [];
  r.map(function (col, i) {
    var p = 0;
    col.map(function (item) {
      n[item.name] = new ikIcon(url, item.color, {x: p, y: i * h, w: w, h: h});
      p += w;
      if (item.hasMask) {
        n[item.name].mask = {url: url, x: p, y: i * h, w: w, h: h};
        p += w;
      }
    });
  });

  constP(this, 'getIcons', function () {
    var ret = [];
    [].slice.call(arguments).map(function (item) {
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