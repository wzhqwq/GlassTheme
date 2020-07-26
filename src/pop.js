/*
场景：toolbar group的弹出（原地，blur）
    数据点预览（居中，replace）
    部分应用的预览（原地，replace）
    用户头像的用户资料预览（原地）
custom:
  preserve:Boolean
  resistance:Object
  position:Object
  appendTo:Element
*/
class Pop {
  mousemoveHandler;
  mouseleaveHandler;
  clickHandler;

  constructor(pop_up, custom, onShow) {
    if (!pop_up instanceof Element) throw new Error(eh + "wrong pop up element used to create Pop");
    if (!~pop_up.style.width.search('px') || (!~pop_up.style.height.search('px') && !(~pop_up.style.maxHeight.search('px') && ~pop_up.style.minHeight.search('px'))))
      throw new Error(eh + "size of pop-up element should be absolute digital");
    var presrv = null, resis = {};
    if (custom) {
      if (custom.resistance) resis = custom.resistance;
      if (custom.preserve) {
        presrv = custom.position || {x: 0, y: 0};
        if (!custom.appendTo) throw new Error(eh + "original element need to be appended to an element in the pop-up element when you choose to preserve it");
      }
    }

    var timer1 = 0, timer2 = 0, timer3 = 0, timer_fatal = 0, break_promise = false, now, origin, showing = false;
    var fix1 = document.createElement("div"), fix2 = document.createElement("div"), fix2inside = document.createElement("div");
    fix1.className = 'gt-fix1'; fix1.style.display = 'none';
    mainElement.appendChild(fix1);
    fix2inside.appendChild(pop_up);
    fix2inside.className = 'gt-fix2-inside';
    fix2.appendChild(fix2inside);
    mainElement.appendChild(fix2);
    fix2.className = 'gt-fix2'; fix2.style.display = 'none';

    var w1 = 0, h1 = 0, x1, y1;
    var w2 = parseInt(pop_up.style.width),
    h21 = parseInt(pop_up.style.height) || parseInt(pop_up.style.minHeight),
    h22 = parseInt(pop_up.style.height) || parseInt(pop_up.style.maxHeight);
    var area = {}, fix11, fix12, fix21, fix22, fix23;

    if (resis.left == undefined) resis.left = -(1 << 30);
    if (resis.right == undefined) resis.right = 1 << 30;
    if (resis.top == undefined) resis.top = -(1 << 30);
    if (resis.bottom == undefined) resis.bottom = 1 << 30;
    if (resis.right - resis.left < w2) throw new Error(eh + "resistance area can not contain pop up element in width");
    area.x1 = resis.left + w2 / 2; area.x2 = resis.right - w2 / 2;
    if (resis.bottom - resis.top < h21) throw new Error(eh + "resistance area can not contain pop up element in height");
    area.y1 = resis.top + h21 / 2; area.y2 = resis.bottom - h21 / 2;

    function get_nearest(a, b, c) {
      return c < a ? a : (c > b ? b : c)
    }
    function calc() {
      var x, y, h2;
      fix11 = fix12 = `width: ${w1.toFixed(3)}px; height: ${h1.toFixed(3)}px; `;
      fix11 += (fix21 = `left: ${x1.toFixed(3)}px; top: ${y1.toFixed(3)}px; `);
      if (presrv) {
        let ox = w1 + w2 / 2 - presrv.x, oy = h1 + h21 / 2 - presrv.y;
        x = get_nearest(area.x1, area.x2, x1 + ox) - ox;
        y = get_nearest(area.y1, area.y2, y1 + oy) - oy;
        fix12 += `left: ${x.toFixed(3)}px; top: ${y.toFixed(3)}px; transform: scale(1);`;
        fix22 = `left: ${(x - presrv.x).toFixed(3)}px; top: ${(y -= presrv.y).toFixed(3)}px; `;
      }
      else {
        x = get_nearest(area.x1, area.x2, x1 + w1 / 2);
        y = get_nearest(area.y1, area.y2, y1 + h1 / 2);
        fix12 += `left: ${(x - w1 / 2).toFixed(3)}px; top: ${(y - h1 / 2).toFixed(3)}px; filter: opacity(0); `;
        fix22 = `left: ${(x - w2 / 2).toFixed(3)}px; top: ${(y - h21 / 2).toFixed(3)}px; `;
      }
      fix22 += `width: ${w2.toFixed(3)}px; height: ${(h2 = Math.min(h22, resis.bottom - y + h21 / 2)).toFixed(3)}px; filter: opacity(1);`;
      if (w2 / w1 < h2 / h1) { // taller, scale using width
        fix21 += `width: ${w2.toFixed(3)}px; height: ${(h1 * w2 / w1).toFixed(3)}px; transform: scale(${(w1 / w2).toFixed(3)});`;
        fix23 = `margin-top: -${((h2 - h1 * w2 / w1) / 2).toFixed(3)}px;`;
        if (!presrv) fix12 += `transform: scale(${(w2 / w1).toFixed(3)});`;
      }
      else {
        fix21 += `width: ${(w1 * h2 / h1).toFixed(3)}px; height: ${h2.toFixed(3)}px; transform: scale(${(h1 / h2).toFixed(3)});`;
        fix23 = `margin-left: -${((w2 - w1 * h2 / h1) / 2).toFixed(3)}px;`;
        if (!presrv) fix12 += `transform: scale(${(h2 / h1).toFixed(3)});`;
      }
      if (custom && custom.popupStyle) {
        fix21 += custom.popupStyle;
        fix22 += custom.popupStyle;
      }
    }

    this.mousemoveHandler = function (wrapElement) {
      if (break_promise || timer3) return;
      if (timer2) {
        clearTimeout(timer2); timer2 = 0;
        wrapElement.className = wrapElement.className.slice(0, -14);
        break_promise = true;
        return;
      }
      if (timer1) clearTimeout(timer1);
      timer1 = setTimeout(() => {
        // 开始蓄力，进行预备运算
        timer2 = setTimeout(() => {
          // 蓄力完成，转移元素
          setTimeout(() => {
            // fix1开始反弹，fix2预备
            timer_fatal = setTimeout(() => {
              // 反弹完成，fix12开始展示
              timer_fatal = setTimeout(() => {
                // 展示完成，触发展示事件，可以开始相应的加载
                timer_fatal = 0;
                showing = true;
                if (presrv) {
                  custom.appendTo.appendChild(origin);
                  fix1.style = 'z-index: 90; transform: scale(1);';
                }
                else
                  fix1.style = fix12 + 'z-index: 90;';
                if (onShow) onShow([wrapElement, origin, pop_up]);
              }, 300);
              fix1.style = fix12;
              fix2.style = fix22;
              fix2inside.style = '';
            }, 300);
            fix1.style.transform = 'scale(1)';
            fix2.style = fix21;
            fix2inside.style = fix23;
          }, 0);
          timer2 = 0;
          fix1.style = fix11;
          now = wrapElement;
          origin = wrapElement.firstChild;
          fix1.appendChild(origin);
          wrapElement.className = wrapElement.className.slice(0, -14);
        }, 500);
        timer1 = 0;
        var pos = wrapElement.getBoundingClientRect();
        if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1)
          w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
          calc();
        wrapElement.className += ' gt-pop-accmlt';
      }, 100);
    };
    this.mouseleaveHandler = function () {
      if (timer1) {
        clearTimeout(timer1);
        timer1 = 0;
      }
      break_promise = false;
    };
    this.clickHandler = function (wrapElement) {
      break_promise = true;
      if (timer1) {
        clearTimeout(timer1);
        timer1 = 0;
      }
      if (timer2) {
        clearTimeout(timer2);
        timer2 = 0;
        wrapElement.className = wrapElement.className.slice(0, -14);
      }
    };
    function distruct() {
      fix1.appendChild(origin);
      fix1.style = fix11 + 'transform: scale(1);';
      fix2.style = fix21;
      timer3 = setTimeout(() => {
        fix1.style = fix2.style = 'display: none;';
        now.appendChild(origin);
        timer3 = 0;
      }, 300);
    }
    fix2.onmouseleave = function () {
      if (timer3) return;
      showing = false;
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
        fix1.style = fix2.style = 'display: none;';
        now.appendChild(origin);
        return;
      }
      distruct();
    };
    gt.subscribeClick(function () {
      if (showing) {
        distruct();
        showing = false;
      }
    });
  }
}