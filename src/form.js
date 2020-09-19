var forms = new Map();
gt(function () {
  var fms = document.body.innerHTML.match(/(?<=id="gtf-)[^"]*/g);
  if (!fms) return;
  fms.forEach(name => {
    forms.set(name, { obj: null });
  })
});

