/*var con = document.createElement('div');
con.className = 'con';
document.body.appendChild(con);
window.console.log = function (message) {
  if (typeof message != 'string')
    message = message.toString();
  con.innerText += message + '\n';
}*/
gt(function () {
  /*$.getJSON('icons.json', function (data) {
    var map = new gt.iconKit.IconMap('icons.png', data);
    var Tool = gt.toolbarKit.BtnTool;
    var Group = gt.toolbarKit.Group;
    var ig = gt.iconKit.IconGroup;
    var view1 = new gt.toolbarKit.View(new Tool(map.getIcons('storage'), 'probs'),
      new Group(new Tool(map.getIcons('add'), 'addProb'), new Tool(map.getIcons('import'), 'importProb')),
      new Group(new Tool(map.getIcons('save'), 'saveProb'), new Tool(map.getIcons('saveAll'), 'saveAllPro')),
      new Tool(map.getIcons('undo'), 'undo'), new Tool(map.getIcons('redo'), 'redo'));
    var bar1 = new gt.toolbarKit.Bar(view1);
    $('.main').append(bar1.bar);
    var dbg;
    var view2 = new gt.toolbarKit.View(new Group(new Tool(map.getIcons('run'), 'run', '-green'), new Tool([new ig(map.getIcons('run', 'bfMini'))], 'runLast', '-green')),
      new Group((dbg = new Tool(map.getIcons('debug'), 'debug', '-orange')), new Tool([new ig(map.getIcons('debug', 'bfMini'))], 'debugLast', '-orange'), new Tool(map.getIcons('eye'), 'watchVar', true)),
      new Group(new Tool([new ig(map.getIcons('test', 'runMini'))], 'testRun'), new Tool([new ig(map.getIcons('test', 'addMini'))], 'testRun'), new Tool([new ig(map.getIcons('testSt1', 'testSt2'))], 'testMgr')));
    var view3 = new gt.toolbarKit.View(new Tool(map.getIcons('pause', 'play'), 'dbgPlay'), new Tool(map.getIcons('stop'), 'dbgAbort'), new Tool(map.getIcons('fw'), 'dbgStep'), new Tool(map.getIcons('stepEnt'), 'dbgEnter'), new Tool(map.getIcons('stepEsc'), 'dbgEscape'));
    var bar2 = new gt.toolbarKit.Bar(view2, view3);
    $(dbg.tool).click(function () {
      bar2.enter(1, 'debug');
    })
    $('.main').append(bar2.bar);
    //tool.setIcon(1);
    var fish = new gt.iconKit.IconAnimation('fish.png', 50, 50, 30, 0.6, '-fullR');
    fish.icon.addEventListener('click', function () {
      if (fish.current == 0) {
        fish.playTo(13).then(function () {
          $('.main').toggleClass('gt-light').toggleClass('gt-dark');
          setTimeout(() => {
            fish.playTo(0);
          }, 1000);
        })
      }
    });
    $('.main').append(fish.icon);
  });*/
  gt.setMainElement(document.getElementById("main"));
  Promise.all([gt.loadSpriteMap('icons.json', 'icons.png', 'icons2x.png')]).then(function () {
    const Tool = gt.toolbar.Tool, View = gt.toolbar.View, Bar = gt.toolbar.Bar, Group = gt.toolbar.Group;
    const Text = gt.Widget.Text, InputBox = gt.Widget.InputBox, Button = gt.Widget.Button, WidgetGroup = gt.Widget.Group;
    var FormBlock = gt.Form.FormBlock, RatioGroup = gt.Form.RatioGroup;

    var isPlay = false;
    var b1 = new View('progMain');
    var d1 = new Group(new Tool({name: 'run', icon: 'run', title: '保存、编译并运行代码'}));
    d1.append(new Tool({name: 'runBefore', icon: 'run', attach: 'bwMini', title: '运行上次编译的代码'}), function () {

    });
    b1.append(d1, function () {
      a1.enter('run');
    });
    var d2 = new Group(new Tool({name: 'debug', icon: 'debug', title: '保存、编译并调试代码'}));
    d2.append(new Tool({name: 'debugBefore', icon: 'debug', attach: 'bwMini', title: '调试上次编译的代码'}), function () {

    });
    b1.append(d2, function () {
      isPlay = true;
      c4.change('pause');
      a1.enter('debug', 'debug');
    });
    var d3 = new Group(new Tool({name: 'testRun', icon: 'test', attach: 'runMini', title: '保存、编译并测试所有数据'}));
    d3.append(new Tool({name: 'newTest', icon: 'test', attach: 'addMini', title: '新建一个测试点'}), function () {

    });
    b1.append(d3, function () {
      a1.enter('test');
    });
    var a1 = new Bar(b1);
    var b2 = new View('debug');
    var c4 = new Tool({name: 'playPause', icon: 'pause', title: '暂停/继续调试'});
    b2.append(c4, function () {
      c4.change(isPlay ? 'play' : 'pause');
      isPlay = !isPlay;
    });
    b2.append(new Tool({name: 'dbgAbort', icon: 'stop', title: '终止调试'}), function () {
      a1.exit();
      isPlay = false;
    });
    b2.append(new Tool({name: 'dbgStep', icon: 'fw', title: '运行直至下一步的函数结束'}), function () {

    });
    b2.append(new Tool({name: 'dbgEnter', icon: 'stepEnt', title: '单步进入函数'}), function () {

    });
    b2.append(new Tool({name: 'dbgEsc', icon: 'stepEsc', title: '运行直至跳出当前函数'}), function () {

    });
    a1.append(b2);

    var b3 = new View('commonMain');
    b3.append(new Tool({name: 'probCodes', icon: 'storage', title: '题目代码存档'}), function (tool) {
      if (tool.isOn) {
        tool.turnOff();
      }
      else {
        tool.turnOn();
      }
    });
    var d4 = new Group(new Tool({name: 'addProb', icon: 'add', title: '新建代码文件'}));
    d4.append(new Tool({name: 'importProb', icon: 'import', title: '导入代码文件'}), function () {

    });
    b3.append(d4, function () {

    });
    var d5 = new Group(new Tool({name: 'saveCode', icon: 'save', title: '保存代码'}));
    d5.append(new Tool({name: 'saveAllProb', icon: 'saveAll', title: '保存所有代码'}), function () {

    });
    b3.append(d5, function () {

    });
    b3.append(new Tool({name: 'codeUndo', icon: 'undo', title: '撤销操作'}), function () {

    });
    b3.append(new Tool({name: 'codeRedo', icon: 'redo', title: '恢复操作'}), function () {

    });
    var a2 = new Bar(b3);

    var b4 = new View('otherMain');
    var d6 = new Group(new Tool({name: 'submitCode', icon: 'send', title: '提交代码至OJ'}));
    d6.append(new Tool({name: 'submitHistory', icon: 'send', attach: 'historyMini', title: '提交历史'}), function () {

    });
    b4.append(d6, function () {

    });
    b4.append(new Tool({name: 'codeSearch', icon: 'search', title: '查找与替换'}), function () {

    });
    b4.append(new Tool({name: 'codeHistory', icon: 'tMachine', title: '代码备份点'}), function () {

    });
    b4.append(new Tool({name: 'groupPanel', icon: 'group', title: '打开机房互助面板'}), function () {

    });
    var a3 = new Bar(b4);
    var b5 = new View('searchBar');

    $('#code_tools').append(a2.bar).append(a1.bar).append(a3.bar);
    var e1 = new Button('e1e1', 'fetch origin');
    e1.color('primary').width(100).click(() => {
      e1.disable(true).value('fetching...');
      setTimeout(() => {
        e1.value('succ').color('green').size('large').width(80).disable(false);
      }, 1000);
    });

    var e2 = new InputBox('inputtext');
    var f1 = new FormBlock('inputtext');
    f1.color('blue');
    e2.on('change', () => {
      if (e2.value() == 'emmm')
        f1.warn('emmmm');
    });

    var f2 = new RatioGroup('radio1');
    f2.append({prefix: '<label>Select1</label>', suffix: '<br>', value: 'a1'});
    f2.append({prefix: '<label>Select2</label>', suffix: '<br>', value: 'a2'});
    f2.append({prefix: '<label>Select3</label>', suffix: '<br>', value: 'a3'});
    f2.update();

    var e3 = new Button('group-btn1', 'btn1');
    var e4 = new Button('group-btn2', 'btn2');
    var e5 = new Button('group-btn3', 'btn3');
    e3.color('red');
    e4.color('green');
    e5.size('large');
    var e6 = new WidgetGroup('large');
    e6.append(e3).append(e4).append(e5);
    $('#widget-test').gtRender([e1, f2, e6]);
  });
});