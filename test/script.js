/*var con = document.createElement('div');
con.className = 'con';
document.body.appendChild(con);
window.console.log = function (message) {
  if (typeof message != 'string')
    message = message.toString();
  con.innerText += message + '\n';
}*/
$(function () {
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
    var Tool = gt.toolbar.Tool, View = gt.toolbar.View, Bar = gt.toolbar.Bar, Group = gt.toolbar.Group;

    var isPlay = false;
    var b1 = new View('progMain');
    var d1 = new Group(new Tool({name: 'run', icon: 'run'}));
    d1.append(new Tool({name: 'runBefore', icon: 'run', attach: 'bwMini'}), function () {

    });
    b1.append(d1, function () {
      a1.enter('run');
    });
    var d2 = new Group(new Tool({name: 'debug', icon: 'debug'}));
    d2.append(new Tool({name: 'debugBefore', icon: 'debug', attach: 'bwMini'}), function () {

    });
    d2.append(new Tool({name: 'debugTool', icon: 'eye'}), function () {

    });
    b1.append(d2, function () {
      isPlay = true;
      c4.change('pause');
      a1.enter('debug', 'debug');
    });
    var d3 = new Group(new Tool({name: 'testRun', icon: 'test', attach: 'runMini'}));
    d3.append(new Tool({name: 'newTest', icon: 'test', attach: 'addMini'}), function () {

    });
    d3.append(new Tool({name: 'allTest', icon: 'testSt1', attach: 'testSt2'}), function () {

    });
    b1.append(d3, function () {
      a1.enter('test');
    });
    var a1 = new Bar(b1);
    var b2 = new View('debug');
    var c4 = new Tool({name: 'playPause', icon: 'pause'});
    b2.append(c4, function () {
      c4.change(isPlay ? 'play' : 'pause');
      isPlay = !isPlay;
    });
    b2.append(new Tool({name: 'dbgAbort', icon: 'stop'}), function () {
      a1.exit();
      isPlay = false;
    });
    b2.append(new Tool({name: 'dbgStep', icon: 'fw'}), function () {

    });
    b2.append(new Tool({name: 'dbgEnter', icon: 'stepEnt'}), function () {

    });
    b2.append(new Tool({name: 'dbgEsc', icon: 'stepEsc'}), function () {

    });
    a1.append(b2);

    var b3 = new View('commonMain');
    b3.append(new Tool({name: 'probCodes', icon: 'storage'}), function (tool) {
      if (tool.isOn) {
        tool.turnOff();
      }
      else {
        tool.turnOn();
      }
    });
    var d4 = new Group(new Tool({name: 'addProb', icon: 'add'}));
    d4.append(new Tool({name: 'importProb', icon: 'import'}), function () {

    });
    b3.append(d4, function () {

    });
    var d5 = new Group(new Tool({name: 'saveCode', icon: 'save'}));
    d5.append(new Tool({name: 'saveAllProb', icon: 'saveAll'}), function () {

    });
    b3.append(d5, function () {

    });
    b3.append(new Tool({name: 'codeUndo', icon: 'undo'}), function () {

    });
    b3.append(new Tool({name: 'codeRedo', icon: 'redo'}), function () {

    });
    var a2 = new Bar(b3);

    var b4 = new View('otherMain');
    b4.append(new Tool({name: 'probPanel', icon: 'problem'}), function () {
      
    });
    var d6 = new Group(new Tool({name: 'submitCode', icon: 'send'}));
    d6.append(new Tool({name: 'submitHistory', icon: 'send', attach: 'historyMini'}), function () {

    });
    b4.append(d6, function () {

    });
    b4.append(new Tool({name: 'codeSearch', icon: 'search'}), function () {

    });
    b4.append(new Tool({name: 'codeHistory', icon: 'tMachine'}), function () {

    });
    b4.append(new Tool({name: 'groupPanel', icon: 'group'}), function () {

    });
    var a3 = new Bar(b4);
    var b5 = new View('searchBar');

    $('#code_tools').append(a2.bar).append(a1.bar).append(a3.bar);
  });
});