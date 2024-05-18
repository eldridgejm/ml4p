import { Palette } from "../lib/mlbook/main.js";

function configure_sketch(div_id, getTheme, opts) {

  let palette = new Palette(getTheme);

  function sketch(p) {
    let x = 0;

    // setup function
    p.setup = function () {
      p.createCanvas(400, 100);
      p.clear();

      // add a button
      let button = p.createButton("click me")

      // set the button class
      button.class("btn btn-primary");

      // add a linebreak
      p.createP("");
    };

    // draw function
    p.draw = function () {
      p.clear();
      p.background(palette.bg());
      p.fill(opts.color || palette.fg());
      let radius = opts.radius || 50;
      p.ellipse(x, p.height / 2, radius, radius);
      x = x + 1;
      if (x > p.width) {
        x = 0;
      }
    };
  }

  return sketch;
}

export function setup_dynamic(div_id, getTheme, opts) {
  let sketch = configure_sketch(div_id, getTheme, opts);
  new p5(sketch, div_id);
}

export let setup_static = setup_dynamic;
