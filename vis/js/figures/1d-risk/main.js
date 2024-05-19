/*
  Demonstrates the concept of risk with a data set of scalars.

  Options
  -------

  - data: an array of scalars
      The data set to visualize. If not provided, a default list of 5 numbers is used.
  - x_min, x_max: scalars
      The left and right bounds of the x-axis. If not provided, the minimum and
      maximum of the data set are used (with 10% of the range added as buffers).

*/

import { Palette } from "../lib/mlbook/main.js";

class Plot {
  constructor(p, palette, data, hypothesis, size, top_left, x_range, y_range) {
    this.p = p;
    this.palette = palette;
    this.data = data;
    this.hypothesis = hypothesis;
    this.size = size;
    this.top_left = top_left;
    this.x_range = x_range;
    this.y_range = y_range;

    this.h_is_being_dragged = false;
  }

  cx(x) {
    // converts plot coordinates to canvas coordinates
    return (
      this.top_left[0] +
      ((x - this.x_range[0]) / (this.x_range[1] - this.x_range[0])) *
        this.size[0]
    );
  }

  cy(y) {
    // converts plot coordinates to canvas coordinates
    // "flips" the y-axis, so that positive y is up
    return (
      this.top_left[1] +
      (1 - (y - this.y_range[0]) / (this.y_range[1] - this.y_range[0])) *
        this.size[1]
    );
  }

  px(x) {
    // converts canvas coordinates to plot coordinates
    return (
      this.x_range[0] +
      ((x - this.top_left[0]) / this.size[0]) *
        (this.x_range[1] - this.x_range[0])
    );
  }

  py(y) {
    // converts canvas coordinates to plot coordinates
    return (
      this.y_range[0] +
      ((y - this.top_left[1]) / this.size[1]) *
        (this.y_range[1] - this.y_range[0])
    );
  }

  sx(x) {
    // converts plot coordinates to screen coordinates
    return this.cx(x) + this.top_left[0];
  }

  sy(y) {
    // converts plot coordinates to screen coordinates
    return this.cy(y) + this.top_left[1];
  }

  draw_axes() {
    // use rounded caps for the lines
    this.p.strokeCap(this.p.ROUND);

    // draw x axis
    this.p.line(
      this.cx(this.x_range[0]),
      this.cy(0),
      this.cx(this.x_range[1]),
      this.cy(0),
    );

    let arrow_width = 5;
    let arrow_height = 5;

    // draw arrowheads at the ends of the x-axis
    this.p.line(
      this.cx(this.x_range[1]) - 5,
      this.cy(0) + arrow_height,
      this.cx(this.x_range[1]),
      this.cy(0),
    );

    this.p.line(
      this.cx(this.x_range[1]) - 5,
      this.cy(0) - arrow_height,
      this.cx(this.x_range[1]),
      this.cy(0),
    );

    this.p.line(
      this.cx(this.x_range[0]) + arrow_width,
      this.cy(0) + arrow_height,
      this.cx(this.x_range[0]),
      this.cy(0),
    );

    this.p.line(
      this.cx(this.x_range[0]) + arrow_width,
      this.cy(0) - arrow_height,
      this.cx(this.x_range[0]),
      this.cy(0),
    );
  }

  draw_xticks(spacing = 1, opts) {
    let x = this.x_range[0] + spacing;
    while (x < this.x_range[1]) {
      this.p.strokeWeight(1);
      this.p.line(this.cx(x), this.cy(0) - 5, this.cx(x), this.cy(0) + 5);

      this.p.strokeWeight(0);
      if (opts.labels) {
        this.p.textAlign(this.p.CENTER, this.p.TOP);
        this.p.text(x, this.cx(x), this.cy(-.02));
      }
      x += spacing;
    }
  }

  draw_data(radius = 15) {
    for (let x of this.data) {
      this.p.circle(this.cx(x), this.cy(0), radius);
    }
  }

  draw_hypothesis() {
    // draws a diamond marker for the hypothesis
    this.p.strokeWeight(2);

    if (this._is_mouse_near_hypothesis_marker() || this.h_is_being_dragged) {
      this.p.fill(this.p.color(this.palette.fg()));
    } else {
      this.p.fill(this.p.color(this.palette.bg()));
    }

    let y_shift = -0.2;
    let width = 12;

    this.p.beginShape();
    this.p.vertex(this.cx(this.hypothesis), this.cy(y_shift + 0.1));
    this.p.vertex(this.cx(this.hypothesis) + width, this.cy(y_shift));
    this.p.vertex(this.cx(this.hypothesis) - width, this.cy(y_shift));
    this.p.vertex(this.cx(this.hypothesis), this.cy(y_shift + 0.1));
    this.p.endShape();

    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.strokeWeight(0);

    if (this._is_mouse_near_hypothesis_marker() || this.h_is_being_dragged) {
      this.p.fill(this.p.color(this.palette.bg()));
    } else {
      this.p.fill(this.p.color(this.palette.fg()));
    }

    // draw a solid line from the hypothesis to the x-axis
    this.p.strokeWeight(2);
    this.p.stroke(this.palette.fg());
    this.p.line(
      this.cx(this.hypothesis),
      this.cy(-0.1),
      this.cx(this.hypothesis),
      this.cy(0),
    );

    this.p.noStroke();
    this.p.text("h", this.cx(this.hypothesis), this.cy(-0.165));
  }

  draw_errors(opts) {
    opts = opts || {};
    opts.labels = opts.labels || false;

    // draw an "error bar" for each data point
    // the error bar is a line from the data point to the hypothesis
    // sort the data by their distance to the hypothesis
    this.p.strokeWeight(2);
    this.p.stroke(this.p.color(this.palette.danger()));

    let err_y = -0.25;
    for (let [index, x] of this.data.entries()) {
      this.p.drawingContext.setLineDash([]);
      this.p.strokeWeight(3);
      this.p.stroke(this.palette.danger_emphasis());
      this.p.line(
        this.cx(x),
        this.cy(err_y),
        this.cx(this.hypothesis),
        this.cy(err_y),
      );

      // draw a dashed line from the data point down to the error bar
      this.p.drawingContext.setLineDash([5, 5]);
      this.p.strokeWeight(1);
      this.p.stroke(this.palette.fg());
      this.p.line(this.cx(x), this.cy(0), this.cx(x), this.cy(err_y));

      err_y -= 0.04;
    }

    // draw a dashed line from the hypothesis down
    this.p.strokeWeight(2);
    this.p.drawingContext.setLineDash([5, 5]);
    this.p.stroke(this.palette.fg());
    this.p.line(
      this.cx(this.hypothesis),
      this.cy(-0.2),
      this.cx(this.hypothesis),
      this.cy(err_y),
    );

    this.p.drawingContext.setLineDash([]);
  }

  draw_vertical_errors() {
    // draw a vertical line upwards from the hypothesis to the total error
    let total_error = 0;
    for (let x of this.data) {
      total_error += Math.abs(this.hypothesis - x);
    }

    let top = 0;
    for (let x of this.data) {
      let error = Math.abs(this.hypothesis - x) * 0.004;
      this.p.strokeWeight(3);
      this.p.stroke(this.p.color(this.palette.danger_emphasis()));
      this.p.line(
        this.cx(this.hypothesis),
        this.cy(top),
        this.cx(this.hypothesis),
        this.cy(top + error) + 5,
      );
      top += error;
    }
  }

  draw_risk() {
    // draw the risk as line plot
    function risk(h) {
      let total_error = 0;
      for (let x of this.data) {
        total_error += Math.abs(h - x);
      }
      return total_error;
    }

    let step = 0.1;
    let x = this.x_range[0];

    this.p.strokeWeight(3);
    this.p.stroke(this.palette.danger());

    while (x < this.x_range[1]) {
      let y = risk.call(this, x);
      this.p.point(this.cx(x), this.cy(y * 0.004) + 5);
      x += step;
    }
  }

  _is_mouse_near_hypothesis_marker() {
    let mouse = [this.p.mouseX, this.p.mouseY];
    let hypothesis_marker = [this.cx(this.hypothesis), this.cy(0) + 40];
    return (
      this.p.dist(
        mouse[0],
        mouse[1],
        hypothesis_marker[0],
        hypothesis_marker[1],
      ) < 15
    );
  }

  drag() {
    if (this.h_is_being_dragged) {
      this.hypothesis = this.px(this.p.mouseX);

      // clip the hypothesis to the x-axis
      if (this.hypothesis < this.x_range[0]) {
        this.hypothesis = this.x_range[0];
      }

      if (this.hypothesis > this.x_range[1]) {
        this.hypothesis = this.x_range[1];
      }
    }
  }
}

function configure_sketch(div_id, getTheme, opts) {
  if (opts.data === undefined) {
    opts.data = [35, 42, 55, 63, 82];
    opts.x_min = 0;
    opts.x_max = 90;
  }

  if (opts.x_min === undefined || opts.x_max === undefined) {
    let range = Math.max(...opts.data) - Math.min(...opts.data);
    opts.x_min = Math.min(...opts.data) - 0.1 * range;
    opts.x_max = Math.max(...opts.data) + 0.1 * range;
  }

  opts.w_0 = opts.w_0 || (opts.x_min + opts.x_max) / 2;

  let palette = new Palette(getTheme);

  let point_tex = [];

  function sketch(p) {
    let plot;

    function canvasSize() {
      return [Math.min(0.95 * p.windowWidth, 500), 400];
    }

    // setup function
    p.setup = function () {
      let [width, height] = canvasSize();
      p.createCanvas(width, height);
      p.clear();

      plot = new Plot(
        p,
        palette,
        opts.data,
        opts.w_0,
        [width - 10, height - 10],
        [0 + 5, 0],
        [opts.x_min, opts.x_max],
        [-1, 1],
      );

      for (const [index, element] of opts.data.entries()) {
        point_tex.push(p.createP(`$$x_${index + 1}$$`));
      }

      renderMathInElement(document.getElementById(div_id));
    };

    // draw function
    p.draw = function () {
      p.clear();
      p.background(palette.bg());

      p.strokeWeight(2);

      p.stroke(palette.fg());
      plot.draw_axes();
      p.stroke(palette.fg());
      p.fill(palette.fg());
      plot.draw_xticks(10, { labels: true });

      // draw the point labels and update their colors
      for (let [index, p] of point_tex.entries()) {
        p.position(plot.cx(opts.data[index]), plot.cy(0) + 15);

        p.style("color", palette.fg());
      }

      p.stroke(palette.fg());
      p.fill(palette.bg());

      plot.draw_errors();
      plot.draw_hypothesis();

      plot.draw_vertical_errors();

      plot.draw_risk();

      if (!p.mouseIsPressed) {
        plot.h_is_being_dragged = false;
      }

      for (let x of opts.data) {
        p.strokeWeight(2);
        p.stroke(palette.bg());
        p.fill(palette.primary());
        plot.draw_data();
      }
    };

    // on drag
    p.mouseDragged = function () {
      if (plot._is_mouse_near_hypothesis_marker()) {
        plot.h_is_being_dragged = true;
      }

      plot.drag();
    };

    p.windowResized = function () {
      let [width, height] = canvasSize();
      p.resizeCanvas(width, height);
      plot.size = [width - 10, height - 10];
    };
  }

  return sketch;
}

export function setup_dynamic(div_id, getTheme, opts) {
  let sketch = configure_sketch(div_id, getTheme, opts);
  new p5(sketch, div_id);
}

export let setup_static = setup_dynamic;
