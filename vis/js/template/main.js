import { Palette, Plot, PlotTeX, linspace } from "../../lib/mlbook/main.js";

function configure_sketch(div_id, getTheme, opts) {
  let palette = new Palette(getTheme);
  let plot;
  let plot_tex;

  function sketch(p) {
    // setup function
    p.setup = function () {
      let canvas = p.createCanvas(400, 300);
      p.clear();

      plot = new Plot(p, [400, 300], {padding:10});
      // plot_tex = new PlotTeX(canvas, plot, ['\\(x_1\\)', '\\(x_2\\)']);
      // renderMathInElement(document.body);

    };

    // draw function
    p.draw = function () {
      p.clear();
      p.background(palette.bg());

    };
  }

  return sketch;
}

export function setup_dynamic(div_id, getTheme, opts) {
  let sketch = configure_sketch(div_id, getTheme, opts);
  new p5(sketch, div_id);
}

export let setup_static = setup_dynamic;
