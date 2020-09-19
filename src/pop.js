/*
Animation Pop
场景：toolbar group的弹出（原地，blur）
    数据点预览（居中，replace）
    部分应用的预览（原地，replace）
    用户头像的用户资料预览（原地）
pop_up:Element
custom: {
  preserve:Boolean
  resistance:Object
  position:Object
  appendTo:Element
}
onShow, onHide:Function
Pop组件分为两个模式
预览模式：鼠标悬停时蓄力并弹出，鼠标移出或点击则收回（鼠标受限，可以使用相对位置），使用边框控制位置与大小
浮窗模式：点击后直接弹出，可以触发返回函数（鼠标可以在外部滚动，浮窗还有可能被拖动）
两者均不允许同一控制器实例同时显示两个弹出界面
弹出界面在原图标转移完成时就算做出现了
*/

var temp_pop_abort = null;

class aniTemporaryPop {
  mousemoveHandler;
  mouseleaveHandler;
  clickHandler;

  constructor(pop_up, custom, onShow, onHide) {
    // 相同的开头
    if (!pop_up instanceof Element) throw new Error(eh + "wrong pop up element used to create Pop");
    if (!~pop_up.style.width.search('px') || (!~pop_up.style.height.search('px') && !(~pop_up.style.maxHeight.search('px') && ~pop_up.style.minHeight.search('px'))))
      throw new Error(eh + "size of pop-up element should be absolute digital");
    var presrv = null, resis = {};
    if (custom) {
      if (custom.resistance) resis = custom.resistance;
      if (custom.preserve) {
        presrv = custom.position || { x: 0, y: 0, scale: 1 };
        presrv.scale = presrv.scale || 1;
        if (!custom.appendTo) throw new Error(eh + "original element need to be appended to an element in the pop-up element when you choose to preserve it");
      }
    }

    var timer1 = 0, timer2 = 0, timer3 = 0, timer_fatal = 0, break_promise = false, now, origin, showing = false;

    var fix1 = document.createElement("div");
    fix1.className = 'gt-fix1';
    fix1.style.display = 'none';
    var fix2 = document.createElement("div"), fix2inside = document.createElement("div");
    fix2inside.appendChild(pop_up);
    fix2inside.className = 'gt-fix2-inside';
    fix2.appendChild(fix2inside);
    fix2.className = 'gt-fix2';
    var fixRel = document.createElement("div");
    fixRel.className = 'gt-relative-position';
    fixRel.appendChild(fix1);
    fixRel.appendChild(fix2);

    var w1 = 0, h1 = 0, x1, y1, x2, y2;
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
      fix21 = '';
      if (presrv) {
        let ox = w1 + w2 / 2 - presrv.x, oy = h1 + h21 / 2 - presrv.y;
        x = get_nearest(area.x1, area.x2, x1 + ox) - ox;
        y = get_nearest(area.y1, area.y2, y1 + oy) - oy;
        fix12 += `left: ${(x - x1).toFixed(3)}px; top: ${(y - y1).toFixed(3)}px; transform: scale(1);`;
        fix22 = `left: ${(x - presrv.x - x1).toFixed(3)}px; top: ${((y -= presrv.y) - y1).toFixed(3)}px; transform: scale(${presrv.scale.toFixed(3)}); `;
      }
      else {
        x = get_nearest(area.x1, area.x2, x1 + w1 / 2);
        y = get_nearest(area.y1, area.y2, y1 + h1 / 2);
        fix12 += `left: ${(x - w1 / 2 - x1).toFixed(3)}px; top: ${(y - h1 / 2 - y1).toFixed(3)}px; filter: opacity(0); `;
        fix22 = `left: ${(x - w2 / 2 - x1).toFixed(3)}px; top: ${(y - h21 / 2 - y1).toFixed(3)}px; `;
      }
      fix22 += `width: ${w2.toFixed(3)}px; height: ${(h2 = Math.min(h22, resis.bottom - y + h21 / 2)).toFixed(3)}px; filter: opacity(1); `;
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
      // 防止pop1被同时使用
      if (temp_pop_abort) temp_pop_abort();
      if (timer1) clearTimeout(timer1);
      timer1 = setTimeout(() => {
        // 开始蓄力，进行预备运算
        timer2 = setTimeout(() => {
          // 蓄力完成，转移元素
          console.log("fatal1");
          timer_fatal = setTimeout(() => {
            // fix1开始反弹，fix2预备
            console.log("fatal2");
            timer_fatal = setTimeout(() => {
              // 反弹完成，fix12开始展示
              console.log("fatal3");
              timer_fatal = setTimeout(() => {
                // 展示完成，触发展示事件，可以开始相应的加载
                timer_fatal = 0;
                if (presrv) {
                  custom.appendTo.appendChild(origin);
                  fix1.style = `z-index: 90; transform: scale(${presrv.scale.toFixed(3)});`;
                }
                else
                  fix1.style = fix12 + 'z-index: 90;';
                if (onShow) onShow([wrapElement, origin, pop_up]);
              }, 300);
              fix1.style = fix12; // fix1展开
              fix2.style = fix22; // fix2展开
              fix2inside.style = '';  // 被遮罩部位展开
            }, 300);
            fix1.style.transform = 'scale(1)';  // 蓄力开始恢复，fix1大小恢复
            fix2.style = fix21; // fix2进入初态
            fix2inside.style = fix23; // 被遮罩部位设置位置
          }, 0);
          timer2 = 0; // 蓄力完成了
          showing = true; // 设置为展示动画状态，此时元素已被存储，且包含关系较混乱
          fix1.style = fix11; // fix1进入初态
          now = wrapElement;  // 存储外壳元素
          origin = wrapElement.firstChild;  // 存储被弹出元素
          if (fix1.innerHTML != '') throw new Error('foo');
          fix1.appendChild(origin); // 被弹出元素转移到fix1中
          wrapElement.appendChild(fixRel);  // 插入0px定位元素
          wrapElement.className = wrapElement.className.slice(0, -14);  // 恢复外壳元素大小
        }, 500);
        timer1 = 0; // 等待时间到了
        var pos = wrapElement.getBoundingClientRect();  // 获得外壳元素大小，应与被弹出元素大小一致
        if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1) {
          w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
          calc(); // 更新关键点
        }
        wrapElement.className += ' gt-pop-accmlt';  // 为外壳元素添加蓄力动画
        temp_pop_abort = forceStop; // 现在可以强制停止一切动画
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
    this.tabEnterHandler = function (wrapElement) {
      if (showing || timer_fatal) {
        leave();
        return;
      }
      if (temp_pop_abort) temp_pop_abort();
      timer_fatal = setTimeout(() => {
        // fix12开始展示
        timer_fatal = setTimeout(() => {
          // 展示完成，触发展示事件，可以开始相应的加载
          timer_fatal = 0;
          if (presrv) {
            custom.appendTo.appendChild(origin);
            fix1.style = `z-index: 90; transform: scale(${presrv.scale.toFixed(3)});`;
          }
          else
            fix1.style = fix12 + 'z-index: 90;';
          if (onShow) onShow([wrapElement, origin, pop_up]);
        }, 300);
        fix1.style = fix12;
        fix2.style = fix22;
        fix2inside.style = '';
      }, 0);
      var pos = wrapElement.getBoundingClientRect();
      if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1) {
        w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
        calc();
      }
      fix1.style = fix11 + 'transform: scale(1);';
      showing = true;
      temp_pop_abort = forceStop;
      now = wrapElement;
      origin = wrapElement.firstChild;
      fix1.appendChild(origin);
      wrapElement.appendChild(fixRel);
      fix2.style = fix21;
      fix2inside.style = fix23;
    }
    function stopAnim() {
      if (timer2) {
        clearTimeout(timer2);
        timer2 = 0;
      }
      if (timer3) {
        clearTimeout(timer3);
        timer3 = 0;
      }
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
      }
    }
    function distruct() {
      console.log("animation hide");
      if (!showing) return;
      stopAnim();
      timer3 = setTimeout(() => {
        timer3 = 0;
        if (!showing) return;
        now.removeChild(fixRel);
        now.appendChild(origin);
        showing = false;
        temp_pop_abort = null;
      }, 300);
      fix1.appendChild(origin);
      fix1.style = fix11 + 'transform: scale(1);';
      fix2.style = fix21;
      if (onHide) onHide();
    }
    function forceStop() {
      if (!showing) return;
      console.log("force stop");
      stopAnim();
      now.appendChild(origin);
      now.removeChild(fixRel);
      if (onHide) onHide();
      showing = false;
      temp_pop_abort = null;
    }
    this.takeBack = distruct();
    this.disappear = forceStop();
    fix2.onmouseleave = function leave() {
      if (timer3) return;
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
        forceStop();
        return;
      }
      distruct();
    }
    fix2.onmousemove = function (e) {
      e.stopPropagation();
    };
    gt.subscribeClick(function () {
      if (showing)
        forceStop();
    });
  }
}

class aniFixedPop {
  clickHandler;

  constructor(pop_up, custom, onShow, onHide) {
    // 相同的开头
    if (!pop_up instanceof Element) throw new Error(eh + "wrong pop up element used to create Pop");
    if (!~pop_up.style.width.search('px') || (!~pop_up.style.height.search('px') && !(~pop_up.style.maxHeight.search('px') && ~pop_up.style.minHeight.search('px'))))
      throw new Error(eh + "size of pop-up element should be absolute digital");
    var presrv = null, resis = {};
    if (custom) {
      if (custom.resistance) resis = custom.resistance;
      if (custom.preserve) {
        presrv = custom.position || { x: 0, y: 0, scale: 1 };
        presrv.scale = presrv.scale || 1;
        if (!custom.appendTo) throw new Error(eh + "original element need to be appended to an element in the pop-up element when you choose to preserve it");
      }
    }

    var timer3, timer_fatal = 0, now, origin, showing = false;

    var fix1 = document.createElement("div");
    fix1.className = 'gt-fix1';
    fix1.style.display = 'none';
    var fix2 = document.createElement("div"), fix2inside = document.createElement("div");
    fix2inside.appendChild(pop_up);
    fix2inside.className = 'gt-fix2-inside';
    fix2.appendChild(fix2inside);
    fix2.className = 'gt-fix2';
    mainElement.appendChild(fix1);
    mainElement.appendChild(fix2);

    var w1 = 0, h1 = 0, x1, y1, x2, y2;
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
      fix11 += `left: ${x1.toFixed(3)}px; top: ${y1.toFixed(3)}px; `;
      fix21 = '';
      if (presrv) {
        let ox = w1 + w2 / 2 - presrv.x, oy = h1 + h21 / 2 - presrv.y;
        x = get_nearest(area.x1, area.x2, x1 + ox) - ox;
        y = get_nearest(area.y1, area.y2, y1 + oy) - oy;
        fix12 += `left: ${x.toFixed(3)}px; top: ${y.toFixed(3)}px; transform: scale(1);`;
        fix22 = `left: ${(x - presrv.x).toFixed(3)}px; top: ${(y -= presrv.y).toFixed(3)}px; transiform: scale(${presrv.scale.toFixed(3)}); `;
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

    this.enterHandler = function (wrapElement) {
      if (showing || timer_fatal) {
        leave();
        return;
      }
      if (temp_pop_abort) temp_pop_abort();
      timer_fatal = setTimeout(() => {
        // 反弹完成，fix12开始展示
        timer_fatal = setTimeout(() => {
          // 展示完成，触发展示事件，可以开始相应的加载
          timer_fatal = 0;
          showing = true;
          temp_pop_abort = forceStop;
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
      }, 0);
      var pos = wrapElement.getBoundingClientRect();
      if (pos.width != w1 || pos.height != h1 || pos.left != x1 || pos.top != y1) {
        w1 = pos.width; h1 = pos.height; x1 = pos.left; y1 = pos.top;
        calc();
      }
      fix1.style = fix11 + 'transform: scale(1);';
      now = wrapElement;
      origin = wrapElement.firstChild;
      fix1.appendChild(origin);
      wrapElement.appendChild(fixRel);
      fix2.style = fix21;
      fix2inside.style = fix23;
    }
    function stopAnim() {
      if (timer_fatal) {
        clearTimeout(timer_fatal);
        timer_fatal = 0;
      }
    }
    function distruct() {
      console.log("animation hide");
      if (!showing) return;
      stopAnim();
      timer3 = setTimeout(() => {
        timer3 = 0;
        if (!showing) return;
        fix1.style = 'display: none;';
        now.removeChild(fixRel);
        now.appendChild(origin);
        showing = false;
        temp_pop_abort = null;
      }, 300);
      fix1.appendChild(origin);
      fix1.style = fix11 + 'transform: scale(1);';
      fix2.style = fix21;
      if (onHide) onHide();
    }
    function forceStop() {
      if (!showing) return;
      console.log("force stop");
      stopAnim();
      fix1.style = 'display: none;';
      now.appendChild(origin);
      now.removeChild(fixRel);
      if (onHide) onHide();
      showing = false;
      temp_pop_abort = null;
    }
    this.takeBack = distruct();
    this.disappear = forceStop();
  }
}

gt.Animation.TemporaryPop = aniTemporaryPop;
gt.Animation.FixedPop = aniFixedPop;