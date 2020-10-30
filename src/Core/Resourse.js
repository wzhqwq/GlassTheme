import eh from "./../GlassTheme";

var res = {};
var maps = [];
var unmMask = {};
var retina = window.devicePixelRatio > 1;

// TYPE: 0image 1spriteMap 2liveSprite

export function loadImage (name, path, path2x) {
  if (typeof path != 'string' || typeof path2x != 'string') throw new Error(eh + "image path should be a string.");
  if (res[name]) throw new Error(eh + `resourse name repeat: ${name}`);

  var p = new Promise(function (rsv, rej) {
    res[name] = { type: 0, path: retina && path2x ? path2x : path };
    var image = new Image();
    image.onload = function () {
      res[name].w = image.width;
      res[name].h = image.height;
      rsv();
    };
    image.src = path;
  });
  return p;
};

export function loadSpriteMap (info, path, path2x) {
  var ehh = eh + "when loading sprite map:";
  path = retina && path2x ? path2x : path;
  if (typeof path != 'string' || typeof path2x != 'string') throw new Error(ehh + "sprite map path should be a string.");

  var p = new Promise(function (rsv, rej) {
    function ok(rsv) {
      checkP(ehh, info, ['width', 'height', 'rows']);
      checkPNumP(ehh, info, ['width', 'height']);

      if (!info.rows instanceof Array || !info.rows.length) {
        throw new Error(ehh + 'Illegal rows array');
      }

      var w = info.width, h = info.height, r = info.rows, i = 0;
      r.forEach(function (col) {
        var j = 0;
        col.forEach(function (item) {
          if (res[item.name]) throw new Error(ehh + `resourse name repeat: ${name}`);

          var name = item.name;
          res[name] = { type: 1, path: maps.length, color: item.color, x: j, y: i, w: w, h: h };
          if (unmMask[name]) res[name].mask = unmMask[name];
          j += w;
        });
        i += h;
      });
      if (info.masks) {
        if (!info.masks instanceof Array) {
          throw new Error(ehh + 'Illegal masks array');
        }

        r = info.masks;
        r.forEach(function (col) {
          var j = 0;
          col.forEach(function (item) {
            item.split(',').forEach(function (item) {
              if (res[item])
                res[item].mask = { path: maps.length, x: j, y: i, w: w, h: h };
              else
                unmMask[item] = { path: maps.length, x: j, y: i, w: w, h: h };
            });
            j += w;
          });
          i += h;
        });
      }

      var img = new Image();
      img.onload = function () {
        maps.push({ path: path, w: img.width, h: img.height });
        rsv();
      };
      img.src = path;
    }
    if (typeof info == "string") {
      var xhr = new XMLHttpRequest();
      xhr.open('get', info);
      xhr.onload = function () {
        info = JSON.parse(xhr.responseText);
        ok(rsv);
      }
      xhr.send();
    }
    else if (typeof info == "object") ok(rsv);
    else
      throw new Error(ehh + "json path should be a string");
  });
  return p;
}

export function cssImage(name) {
  var o = res[name];
  var path = o.type ? maps[o.path].path : o.path;
  var style;
  if (o.color) {
    var color = o.color;
    if (color[0] == '-') {
      color = `var(-${color})`;
    }
    style = `--cc: ${color}; -webkit-mask-image: url(${path}); width: ${o.w}px; height: ${o.h}px;`;
    if (o.type) style += `-webkit-mask-position: -${o.x}px -${o.y}px;`;
    if (retina) style += `-webkit-mask-size: ${maps[o.path].w / 2}px ${maps[o.path].h / 2}px`;
  }
  else {
    style = `background-image: url(${path}); width: ${o.w}px; height: ${o.h}px;`;
    if (o.type) style += `background-position: -${o.x}px -${o.y}px;`;
    if (retina) style += `background-size: ${maps[o.path].w / 2}px ${maps[o.path].h / 2}px`;
  }

  return style;
}
export function cssMask(name) {
  if (!res[name].mask) return;
  var o = res[name].mask;
  var style = `-webkit-mask-image: url(${maps[o.path].path}); width: ${o.w}px; height: ${o.h}px; -webkit-mask-position: -${o.x}px -${o.y}px; position: absolute;`
  if (retina) style += `-webkit-mask-size: ${maps[o.path].w / 2}px ${maps[o.path].h / 2}px`;
  return style;
}

export function loadLiveSprite (name, path, path2x) {
  var ehh = eh + "when loading live sprite:";
  path = retina && path2x ? path2x : path;
  if (typeof path != 'string' || typeof path2x != 'string') throw new Error(ehh + "sprite path should be a string.");


}