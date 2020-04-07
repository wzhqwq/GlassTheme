/*var con = document.createElement('div');
con.className = 'con';
document.body.appendChild(con);
window.console.log = function (message) {
  if (typeof message != 'string')
    message = message.toString();
  con.innerText += message + '\n';
}*/
$(function () {
  $.getJSON('icons.json', function (data) {
    var map = new gt.iconKit.IconMap('icons.png', data);
    var Tool = gt.toolbarKit.BtnTool;
    var Group = gt.toolbarKit.Group;
    var ig = gt.iconKit.IconGroup;
    try {
      var view1 = new gt.toolbarKit.View(new Tool(map.getIcons('storage'), 'probs'),
        new Group(new Tool(map.getIcons('add'), 'addProb'), new Tool(map.getIcons('import'), 'importProb')),
        new Group(new Tool(map.getIcons('save'), 'saveProb'), new Tool(map.getIcons('saveAll'), 'saveAllPro')),
        new Tool(map.getIcons('undo'), 'undo'), new Tool(map.getIcons('redo'), 'redo'));
      var bar1 = new gt.toolbarKit.Bar(view1);
      $('.main').append(bar1.bar);
      var run;
      var view2 = new gt.toolbarKit.View(new Group((run = new Tool(map.getIcons('run'), 'run', '-green')), new Tool([new ig(map.getIcons('run', 'bfMini'))], 'runLast', '-green')),
        new Group(new Tool(map.getIcons('debug'), 'debug', '-orange'), new Tool([new ig(map.getIcons('debug', 'bfMini'))], 'debugLast', '-orange'), new Tool(map.getIcons('eye'), 'watchVar', true)),
        new Group(new Tool([new ig(map.getIcons('test', 'runMini'))], 'testRun'), new Tool([new ig(map.getIcons('test', 'addMini'))], 'testRun'), new Tool([new ig(map.getIcons('testSt1', 'testSt2'))], 'testMgr')));
      var view3 = new gt.toolbarKit.View(new Tool(map.getIcons('pause', 'play'), 'dbgPlay'), new Tool(map.getIcons('stop'), 'dbgAbort'), new Tool(map.getIcons('fw'), 'dbgStep'), new Tool(map.getIcons('stepEnt'), 'dbgEnter'), new Tool(map.getIcons('stepEsc'), 'dbgEscape'));
      var bar2 = new gt.toolbarKit.Bar(view2, view3);
      $(run.tool).click(function () {
        bar2.enter(1, 'run');
      })
      $('.main').append(bar2.bar);
    }catch (e) {
      console.log(e);
    }
    //tool.setIcon(1);
  });
});