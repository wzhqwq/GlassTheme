import * as Widgets from "./src/Display/Widgets";
import * as Form from "./src/Display/Form";

window.gt = {
  Widgets: Widgets,
  Form: Form
}

gt.render = (destination, gtObject) => {
  if (!(destination instanceof Element)) throw new Error(eh + 'please use render function on HTMLElement');
  render(destination, gtObject);
};
gt.html = get_html;
if ($ && $.fn) {
  $.fn.gtRender = function (gtObject) {
    render(this[0], gtObject);
    return this;
  }
}
