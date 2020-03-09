var con = document.createElement('div');
con.className = 'con';
document.body.appendChild(con);
window.console.log = function (message) {
  if (typeof message != 'string')
    message = message.toString();
  con.innerText += message + '\n';
}
$(function () {
  $.getJSON('icons.json', function (data) {
    console.log(data);
    var map = new gt.iconKit.IconMap('icons.png', data);
    var Tool = gt.toolbarKit.BtnTool;
    try {
      
      var view = new gt.toolbarKit.View([new Tool(map.getIcons('storage'), 'codes'), new Tool(map.getIcons('add'), 'addProb'), new Tool(map.getIcons('save'), 'saveProb'), new Tool(map.getIcons('undo'), 'undo'), new Tool(map.getIcons('redo'), 'redo')]);
      var bar = new gt.toolbarKit.Bar([view]);
      $('.main').append(bar.bar);
    }catch (e) {
      console.log(e);
    }
    //tool.setIcon(1);
  });
});