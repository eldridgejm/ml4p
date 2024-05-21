import { Palette, Plot, PlotTeX, linspace } from "../../lib/mlbook/main.js";

function configure_sketch(div_id, getTheme, opts = {}) {
  const defaults = {
    h: null,
    h_selectable: true,
    draw_x_ticks: true,
    x_tick_spacing: null,
    x_tick_formatter: (x) => x.toFixed(2),
    draw_horizontal_error_bars: false,
    draw_vertical_error_bars: true,
    draw_hypothesis: true,
    animation: null,
    draw_risk: true,
    risk_style: null,
    risk_id: null,
    draw_data_labels: false,
    loss: "absolute",
  };

  opts = Object.assign({}, defaults, opts);

  // if there's no data specified...
  if (opts.data === undefined) {
    opts.data = [31, 42, 55, 75];
    opts.x_range = [0, 80];
    opts.x_tick_spacing = 10;
    opts.x_tick_formatter = (x) => x.toFixed(0);
    opts.h = 40;
  }

  // if data was specified, but no x_range was specified...
  if (opts.x_range === undefined) {
    let max = Math.max(...opts.data);
    opts.x_range = [0, max * 1.1];
    opts.x_tick_spacing = max / 10;
  }

  // if no initial hypothesis was specified...
  if (opts.h === null) {
    opts.h = (opts.x_range[0] + opts.x_range[1]) / 2;
  }

  // if no x_tick_spacing was specified...
  opts.x_tick_spacing =
    opts.x_tick_spacing || (opts.x_range[1] - opts.x_range[0]) / 10;

  // "global" variables
  let h = opts.h;
  let palette = new Palette(getTheme);
  let plot;
  let plot_tex;
  let h_selected = false;
  let data = opts.data;

  // "global" settings

  // vertical position of the first error bar below the x-axis, in pixels
  let HORIZONTAL_ERROR_BAR_Y_OFFSET_PIXELS = 30;

  // vertical spacing between the horizontal error bars, in pixels
  let HORIZONTAL_ERROR_BAR_SPACING_PIXELS = 10;

  // how far below the x-axis should the tip of the triangle be? depends
  // on the number of data points
  let HYPOTHESIS_Y_OFFSET_PIXELS;
  if (opts.draw_horizontal_error_bars) {
    HYPOTHESIS_Y_OFFSET_PIXELS =
      HORIZONTAL_ERROR_BAR_Y_OFFSET_PIXELS +
      data.length * HORIZONTAL_ERROR_BAR_SPACING_PIXELS;
  } else {
    HYPOTHESIS_Y_OFFSET_PIXELS = 30;
  }

  let HYPOTHESIS_HEIGHT_PIXELS = 20;

  // helper functions
  // ================

  function getLossFunction() {
    if (opts.loss === "absolute") {
      return (x, h) => Math.abs(x - h);
    } else if (opts.loss === "square") {
      return (x, h) => Math.pow(x - h, 2);
    }
  }

  function totalLoss(h) {
    let loss = getLossFunction();
    let total = 0;
    for (let xi of data) {
      total += loss(xi, h);
    }
    return total;
  }

  function maxLoss() {
    let hs = linspace(opts.x_range[0], opts.x_range[1], 100);
    let losses = hs.map((h) => totalLoss(h));
    return Math.max(...losses);
  }

  function risk(h) {
    return totalLoss(h) / data.length;
  }

  // p5.js sketch
  // ============

  function sketch(p) {
    // drawing functions
    // -----------------

    function _draw_axes() {
      // draw a number line
      p.strokeWeight(2);
      p.stroke(palette.fg());
      let x_start_arrow = !(opts.draw_risk || opts.draw_vertical_error_bars);
      plot.draw_x_axis({ start_arrow: x_start_arrow });

      if (opts.draw_risk || opts.draw_vertical_error_bars) {
        plot.draw_y_axis({ range: [0, 0.95], start_arrow: false });
      }

      if (opts.draw_x_ticks) {
        // draw ticks
        p.fill(palette.fg());
        plot.draw_xticks({
          spacing: opts.x_tick_spacing,
          labelFormatter: opts.x_tick_formatter,
          y_shift: 8,
        });
      }
    }

    function _draw_data() {
      let zeros = data.map((_, i) => 0);

      // draw a "halo" around the data points
      p.fill(palette.bg());
      p.stroke(palette.bg());
      plot.scatter(data, zeros, { radius: 20 });

      // draw the data points themselves
      let factor = getTheme() === "light" ? 1 : -1;
      p.fill(palette.c0(factor * 0.5));
      p.stroke(palette.c0());
      p.strokeWeight(2);
      plot.scatter(data, zeros, { radius: 12 });
    }

    function _draw_hypothesis() {
      let width = 20 / plot.x_scale();
      let height = HYPOTHESIS_HEIGHT_PIXELS / plot.y_scale();

      let y = plot.py(plot.cy(0) + HYPOTHESIS_Y_OFFSET_PIXELS);

      // draw a line from the x-axis to the hypothesis
      p.stroke(palette.fg());
      p.strokeWeight(2);
      plot.draw_line(h, 0, h, y);

      // draw a little circle at the tip of the hypothesis, on the x-axis
      p.fill(palette.fg());
      p.stroke(palette.fg());
      p.strokeWeight(2);
      plot.draw_point(h, 0, { radius: 4 });

      let mouse_over = _is_mouse_over_hypothesis() && opts.h_selectable;

      // draw a triangle with p5
      if (mouse_over || h_selected) {
        p.fill(palette.fg());
      } else {
        p.fill(palette.bg());
      }
      p.triangle(
        plot.cx(h),
        plot.cy(y),
        plot.cx(h - width / 2),
        plot.cy(y - height),
        plot.cx(h + width / 2),
        plot.cy(y - height),
      );

      // write an "h" on the triangle
      if (mouse_over || h_selected) {
        p.fill(palette.bg());
      } else {
        p.fill(palette.fg());
      }
      p.textSize(11);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.text("h", plot.cx(h), plot.cy(y) + HYPOTHESIS_HEIGHT_PIXELS / 2 + 4);
    }

    function _is_mouse_over_hypothesis() {
      let x = p.mouseX;
      let y = p.mouseY;

      let hx = plot.cx(h);
      let hy = plot.cy(0) + HYPOTHESIS_Y_OFFSET_PIXELS + 10;

      // compute distance from mouse to hypothesis
      let d = p.dist(x, y, hx, hy);
      return d < 13;
    }

    function _draw_horizontal_error_bars() {
      let spacing = HORIZONTAL_ERROR_BAR_SPACING_PIXELS / plot.y_scale();
      let y_init = plot.py(plot.cy(0) + HORIZONTAL_ERROR_BAR_Y_OFFSET_PIXELS);

      let y = y_init;
      for (let xi of data) {
        // drop a dashed line from the data point to the start of the error bar
        p.strokeWeight(1);
        p.stroke(palette.fg(0.4));
        p.drawingContext.setLineDash([3, 3]);
        plot.draw_line(xi, 0, xi, y);
        p.drawingContext.setLineDash([]);

        y -= spacing;
      }

      // we repeat the plot loop to draw the error bars on top of the dashed lines

      y = y_init;
      for (let xi of data) {
        p.stroke(palette.bad(0.5));
        p.strokeWeight(4);
        // make the end caps square
        p.strokeCap(p.SQUARE);
        plot.draw_line(h, y, xi, y);

        y -= spacing;
      }

      // drop a line down from the hypothesis to the bottom of the error bars
      p.strokeWeight(2);
      p.stroke(palette.fg());
      plot.draw_line(
        h,
        plot.py(plot.cy(0) + HYPOTHESIS_Y_OFFSET_PIXELS),
        h,
        y + spacing,
      );
    }

    function _draw_vertical_error_bars() {
      let y_cursor = 0;
      let max_loss = maxLoss();
      p.strokeCap(p.SQUARE);
      p.stroke(palette.bad(0.5));
      p.strokeWeight(4);
      for (let xi of data) {
        let err = getLossFunction()(xi, h) / max_loss;
        p.line(
          plot.cx(h),
          plot.cy(y_cursor),
          plot.cx(h),
          plot.cy(y_cursor + err) + 2,
        );
        y_cursor += err;
      }
    }

    function _draw_risk() {
      p.strokeCap(p.ROUND);
      p.stroke(palette.bad());
      p.strokeWeight(4);

      let x_end = opts.x_range[1];
      if (opts.risk_style === "as-you-go") {
        x_end = h;
      }
      let hs = linspace(opts.x_range[0], x_end, 100);
      let raw_risks = hs.map(risk);
      let max_risk = Math.max(...raw_risks);
      let normalized_risks = raw_risks.map((r) => r / max_risk);

      plot.plot(hs, normalized_risks);
    }

    function _draw_data_labels() {
      for (let i = 0; i < data.length; i++) {
        plot_tex.setPosition(i, data[i], 0, "bottom");
        plot_tex.elements[i].style("color", palette.fg());
        plot_tex.elements[i].style("padding-bottom", "6px");
      }
    }

    class AnimateHypothesis {
      constructor(animation_opts) {
        this.speed_factor = animation_opts.speed_factor || 1;
        this.style = animation_opts.style || "once";
        this.start_h = animation_opts.start_h || opts.x_range[0];
        this.end_h = animation_opts.end_h || opts.x_range[1];
        this.show_buttons =
          animation_opts.show_buttons === undefined
            ? true
            : animation_opts.show_buttons;

        this.running = animation_opts.start_running || true;
        this.direction = 1;

        this.stop_button = '<i class="bi bi-pause-fill"></i>';
        this.start_button = '<i class="bi bi-play-fill"></i>';
        this.restart_button = '<i class="bi bi-rewind-fill"></i>';

        h = this.start_h;
      }

      _setup_button() {
        this.running = !this.running;
        this.button.html(this.running ? this.stop_button : this.start_button);
      }

      setup() {
        if (this.show_buttons) {
          this.button = p
            .createButton(this.running ? this.stop_button : this.start_button)
            .mousePressed(this._setup_button.bind(this));

          this.button.class("btn btn-primary");
        }
      }

      draw() {
        let span = this.end_h - this.start_h;

        if (!this.running) {
          return;
        }

        if (this.style === "back-to-start") {
          h += (this.speed_factor * span) / 200;
          if (h >= this.end_h) {
            h = this.start_h;
          }
        } else if (this.style === "back-and-forth") {
          if (h >= this.end_h) {
            this.direction = -1;
          }

          if (h <= this.start_h) {
            this.direction = 1;
          }

          h += (this.direction * this.speed_factor * span) / 200;

          // h += (this.direction * this.speed_factor * span) / 100;
        } else if (this.style === "once") {
          h += (this.speed_factor * span) / 200;

          if (h >= this.end_h) {
            h = this.end_h;
            this.running = false;

            if (this.button) {
              this.button.html(this.restart_button);
              this.button.mousePressed(() => {
                h = this.start_h;
                this.running = true;
                this.button.html(this.stop_button);
                this.button.mousePressed(this._setup_button.bind(this));
              });
            }
          }
        }
      }
    }

    class DataAnimation {
      constructor(animation_opts) {
        if (animation_opts.data === undefined) {
          throw new Error("data animation requires a data array");
        }

        this.start_data = data.slice();
        this.end_data = animation_opts.data;
        this.speed_factor = animation_opts.speed_factor || 1;

        this.time = 0;
        this.direction = 1;
        this.pause = animation_opts.pause || 0;
      }

      sigmoidEasing(t) {
        return 1 / (1 + Math.exp(-12 * (t - 0.5)));
      }

      interpolateData() {
        let current_data = [];
        for (let i = 0; i < data.length; i++) {
          let factor = this.sigmoidEasing(this.time);
          current_data.push(
            this.start_data[i] * (1 - factor) + this.end_data[i] * factor,
          );
        }
        return current_data;
      }

      setup() {}

      draw() {
        data = this.interpolateData();
        this.time += this.direction * 0.01 * this.speed_factor;
        if (this.time >= 1 + this.pause) {
          this.time = 1;
          this.direction = -1;
        } else if (this.time <= 0 - this.pause) {
          this.time = 0;
          this.direction = 1;
        }
      }
    }

    class NullAnimation {
      setup() {}

      draw() {}
    }

    if (opts.animation === null) {
      opts.animation = new NullAnimation();
    } else {
      let [animation_name, animation_opts] = opts.animation;
      if (animation_name === "sweep_hypothesis") {
        opts.animation = new AnimateHypothesis(animation_opts);
      } else if (animation_name === "data") {
        opts.animation = new DataAnimation(animation_opts);
      }
    }

    /** is the plot tall? this happens when we plot the risk and/or the vertical
     * error bars
     */
    function _is_plot_tall() {
      return opts.draw_risk || opts.draw_vertical_error_bars;
    }

    // setup function
    p.setup = function () {
      let canvas_height = _is_plot_tall() ? 266 : 133;
      canvas_height +=
        HYPOTHESIS_Y_OFFSET_PIXELS + HYPOTHESIS_HEIGHT_PIXELS + 40;
      let y_max = _is_plot_tall() ? 1 : 0.05;
      let y_min = -0.1 - 0.05 * data.length;
      let canvas = p.createCanvas(400, canvas_height);
      p.clear();

      plot = new Plot(p, [400, canvas_height], {
        padding: 12,
        x_range: opts.x_range,
        y_range: [y_min, y_max],
      });

      if (opts.draw_data_labels) {
        let labels = data.map((_, i) => `\\(x_{${i + 1}}\\)`);
        plot_tex = new PlotTeX(canvas, plot, labels);
        renderMathInElement(document.body);
      }

      opts.animation.setup();
    };

    p.draw = function () {
      p.clear();
      p.background(palette.bg());

      if (opts.draw_horizontal_error_bars) _draw_horizontal_error_bars();

      _draw_axes();

      _draw_data();

      if (opts.draw_vertical_error_bars) _draw_vertical_error_bars();

      if (opts.draw_hypothesis) _draw_hypothesis();

      if (opts.draw_risk) _draw_risk();

      if (opts.draw_data_labels) {
        _draw_data_labels();
      }

      if (opts.risk_id !== null) {
        // update the span with the current risk
        let risk_span = p.select("#" + opts.risk_id);
        if (risk_span) {
          risk_span.html(risk(h).toFixed(2));
        }
      }

      opts.animation.draw();
    };

    p.mouseDragged = function () {
      if (_is_mouse_over_hypothesis() && opts.h_selectable) {
        h_selected = true;
      }

      if (h_selected) {
        h = plot.px(p.mouseX);
      }

      // clip the value of h
      h = Math.max(opts.x_range[0], Math.min(opts.x_range[1], h));
    };

    p.mouseReleased = function () {
      h_selected = false;
    };
  }

  return sketch;
}

export function setup_dynamic(div_id, getTheme, opts) {
  let sketch = configure_sketch(div_id, getTheme, opts);
  new p5(sketch, div_id);
}

export let setup_static = setup_dynamic;
