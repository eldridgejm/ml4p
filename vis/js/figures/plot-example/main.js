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
      plot_tex = new PlotTeX(canvas, plot, ['\\(x_1\\)', '\\(x_2\\)']);

      plot_tex.setPosition(0, 1, 0);
      renderMathInElement(document.body);

    };

    // draw function
    p.draw = function () {
      p.clear();
      p.background(palette.bg());

      p.stroke(palette.fg(.15));
      p.strokeWeight(1);
      plot.draw_grid({
        x_spacing: 0.25,
        y_spacing: 0.25,
      });

      p.stroke(palette.fg());
      p.strokeWeight(2);
      plot.draw_x_axis();
      plot.draw_y_axis();

      p.fill(palette.fg(1));
      p.stroke(palette.fg(1));
      plot.draw_xticks({
        spacing: 0.25,
        labels: "below",
        no_label_near: 0,
      });

      p.fill(palette.fg(1));
      p.stroke(palette.fg(1));
      plot.draw_yticks({
        spacing: 0.25,
        labels: "left",
        no_label_near: 0,
      });


      let f = function (x) {
        return 0.9 * Math.sin(x * Math.PI);
      };

      let xs = linspace(-1, 1, 100);
      let ys = xs.map(f);

      p.strokeWeight(2);
      p.stroke(palette.indigo());
      plot.plot(xs, ys);

      let x1 = -1 + p.frameCount / 200;
      let x2 = -.8 + p.frameCount / 200;

      if (p.frameCount > 500) {
        p.frameCount = 0;
      }

      x1 = Math.min(.8, x1);
      x2 = Math.min(1, x2);

      p.fill(palette.indigo(.2));
      plot.scatter([x1, x2], [f(x1), f(x2)]);

      plot_tex.elements[0].style('color', palette.fg());
      plot_tex.setPosition(0, x1, f(x1), 'top');

      plot_tex.elements[1].style('color', palette.fg());
      plot_tex.setPosition(1, x2, f(x2), 'top');

    };
  }

  return sketch;
}

export function setup_dynamic(div_id, getTheme, opts) {
  let sketch = configure_sketch(div_id, getTheme, opts);
  new p5(sketch, div_id);
}

export let setup_static = setup_dynamic;
