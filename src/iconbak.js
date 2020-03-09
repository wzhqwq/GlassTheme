var IconMap = function (url, config) {
  var eh = eh + 'When creating iconMap: ';
  var icons = [];
  if (typeof url != 'string')
    throw new Error(eh + 'url must be a String');
  if (typeof config != 'object')
    throw new Error(eh + 'config must be an Object');
  checkP(eh, config, ['width', 'height', 'rows']);
  isPNumP(eh, config, ['width', 'height']);
  if (!config.rows instanceof Array || !config.rows.length)
    throw new Error(eh + 'Illegal rows array');
  
  var w = config.width, h = config.height, r = config.rows, c = [], cn = 0;
  var n = [];
  for (var i = 0, l = r.length; i < l; i++) {
    isPNumP(eh + `Row ${i}: `, r[i],['count']);
    if (r.names) {
      if (!r.names instanceof Array || !r.names.length)
        throw new Error(eh + `Row ${i}: Illegal name array`);
      for (var i = 0, l = r.names.length; i < l; i++)
        n[r.names[i]] = 
    }
  }
}