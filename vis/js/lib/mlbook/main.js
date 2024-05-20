function hex2rgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgb2hex(rgb) {
  return (
    "#" +
    rgb
      .map(function (x) {
        return x.toString(16).padStart(2, "0");
      })
      .join("")
  );
}

/**
 * Interpolates between two colors expressed as RGB arrays.
 * @param {array} color1 - The first color as an RGB array.
 * @param {array} color2 - The second color as an RGB array.
 * @param {number} factor - The interpolation factor. If 0, the color will be
 * `color1`, if 1, the color will be `color2`.
 * @returns {array} The interpolated color as an RGB array.
 */
function interpolateColors(color1, color2, factor) {
  let result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
}

let common_colors = {
  blue: "#0D6EFD",
  indigo: "#6610f2",
  purple: "#6f42c1",
  pink: "#d63384",
  red: "#dc3545",
  orange: "#fd7e14",
  yellow: "#ffc107",
  green: "#198754",
  teal: "#20c997",
  cyan: "#0dcaf0",
  white: "#ffffff",
  black: "#000000",
};

let semantic_colors = {
  primary: common_colors.blue,
  good: common_colors.green,
  bad: common_colors.red,
  caution: common_colors.yellow,
};

let ordered_colors = {
  c0: common_colors.blue,
  c1: common_colors.red,
  c2: common_colors.green,
  c3: common_colors.yellow,
  c4: common_colors.purple,
  c5: common_colors.orange,
  c6: common_colors.teal,
  c7: common_colors.pink,
  c8: common_colors.indigo,
};

let light_theme = {
  fg: "#000000",
  bg: "#ffffff",
};

let dark_theme = {
  fg: "#ffffff",
  bg: "#212529",
};

// extend the light and dark themes with the common, semantic, and ordered colors
Object.assign(light_theme, common_colors, semantic_colors, ordered_colors);
Object.assign(dark_theme, common_colors, semantic_colors, ordered_colors);

export class Palette {
  constructor(getTheme) {
    this.theme = getTheme;
  }

  getColors() {
    return this.theme() == "light" ? light_theme : dark_theme;
  }
}

function interpolatedColorFactory(color) {
  return function (factor = 1) {
    // get the color as a hex string
    let main_color = this.getColors()[color];

    let other_color;
    if (factor < 0) {
      other_color = this.getColors().fg;
      factor = 1 + factor;
    } else {
      other_color = this.getColors().bg;
    }

    // convert to rgb
    main_color = hex2rgb(main_color);
    other_color = hex2rgb(other_color);

    // interpolate
    let interpolated = interpolateColors(other_color, main_color, factor);

    // convert back to hex
    return rgb2hex(interpolated);
  };
}

Palette.prototype.fg = interpolatedColorFactory("fg");
Palette.prototype.bg = interpolatedColorFactory("bg");

for (let color in common_colors) {
  Palette.prototype[color] = interpolatedColorFactory(color);
}

for (let color in semantic_colors) {
  Palette.prototype[color] = interpolatedColorFactory(color);
}

for (let color in ordered_colors) {
  Palette.prototype[color] = interpolatedColorFactory(color);
}

/**
 * A simple class for 2d plotting with p5js.
 * @param {p5} p - The p5 instance.
 * @param {tuple} size - The size (width, height) of the plot in pixels.
 */
export class Plot {
  constructor(
    p,
    size,
    {
      x_range = [-1, 1],
      y_range = [-1, 1],
      top_left = [0, 0],
      padding = 2,
    } = {},
  ) {
    this.p = p;
    this.size = size;
    this.top_left = top_left;
    this.padding = padding;
    this.x_range = x_range;
    this.y_range = y_range;

    this.inner_top_left = [
      this.top_left[0] + this.padding,
      this.top_left[1] + this.padding,
    ];

    this.inner_size = [
      this.size[0] - 2 * this.padding,
      this.size[1] - 2 * this.padding,
    ];
  }

  /**
   * The number of pixels per unit in the x direction.
   */
  x_scale() {
    return this.inner_size[0] / (this.x_range[1] - this.x_range[0]);
  }

  /**
   * The number of pixels per unit in the y direction.
   */
  y_scale() {
    return this.inner_size[1] / (this.y_range[1] - this.y_range[0]);
  }

  /**
   * Convert from plot coordinates to canvas coordinates.
   * @param {number} x - The x coordinate in plot space.
   */
  cx(x) {
    return (x - this.x_range[0]) * this.x_scale() + this.inner_top_left[0];
  }

  /**
   * Convert from plot coordinates to canvas coordinates.
   * @param {number} y - The y coordinate in plot space.
   */
  cy(y) {
    return (
      this.inner_size[1] -
      (y - this.y_range[0]) * this.y_scale() +
      this.inner_top_left[1]
    );
  }

  /**
   * Convert from canvas coordinates to plot coordinates.
   * @param {number} x - The x coordinate in canvas space.
   * @returns {number} The x coordinate in plot space.
   */
  px(x) {
    return (x - this.inner_top_left[0]) / this.x_scale() + this.x_range[0];
  }

  /**
   * Convert from canvas coordinates to plot coordinates.
   * @param {number} y - The y coordinate in canvas space.
   * @returns {number} The y coordinate in plot space.
   * */
  py(y) {
    return (
      (this.inner_size[1] - y + this.inner_top_left[1]) / this.y_scale() +
      this.y_range[0]
    );
  }

  /**
   * Draw a point at the given (plot) coordinates.
   *
   * This uses the p5 `circle` function. Any styling should be done before
   * calling this function.
   *
   * @param {number} x - The x coordinate in plot space.
   * @param {number} y - The y coordinate in plot space.
   * @param {object} options - An object with optional parameters.
   * @param {number} options.radius - The radius of the circle in pixels.
   */
  draw_point(x, y, { radius = 10 } = {}) {
    this.p.circle(this.cx(x), this.cy(y), radius);
  }

  /**
   * Draw a line between the given (plot) coordinates.
   * @param {number} x1 - The x coordinate of the start of the line.
   * @param {number} y1 - The y coordinate of the start of the line.
   * @param {number} x2 - The x coordinate of the end of the line.
   * @param {number} y2 - The y coordinate of the end of the line.
   */
  draw_line(x1, y1, x2, y2) {
    this.p.line(this.cx(x1), this.cy(y1), this.cx(x2), this.cy(y2));
  }

  /**
   * Draws a line plot of the given data.
   * @param {array} x_arr - An array of x values.
   * @param {array} y_arr - An array of y values.
   */
  plot(x_arr, y_arr) {
    for (let i = 1; i < x_arr.length; i++) {
      this.draw_line(x_arr[i - 1], y_arr[i - 1], x_arr[i], y_arr[i]);
    }
  }

  /**
   * Draws a scatter plot of the given data.
   * @param {array} x_arr - An array of x values.
   * @param {array} y_arr - An array of y values.
   */
  scatter(x_arr, y_arr, { radius = 10 } = {}) {
    for (let i = 0; i < x_arr.length; i++) {
      this.draw_point(x_arr[i], y_arr[i], { radius: radius });
    }
  }

  _draw_arrowhead(x, y, angle, { width = 10, length = 10 } = {}) {
    // it will be easier to work in canvas coordinates and then convert
    // to plot coordinates; this ensures that the arrowhead will always
    // be the same size regardless of the scale of the plot
    let x_c = this.cx(x);
    let y_c = this.cy(y);

    // these represent the "tails" of the arrowhead
    let t1_x = x_c - length;
    let t1_y = y_c + width;
    let t2_x = x_c - length;
    let t2_y = y_c - width;

    let t1_x_rot =
      (t1_x - x_c) * Math.cos(angle) + (t1_y - y_c) * Math.sin(angle) + x_c;
    let t1_y_rot =
      -(t1_x - x_c) * Math.sin(angle) + (t1_y - y_c) * Math.cos(angle) + y_c;
    let t2_x_rot =
      (t2_x - x_c) * Math.cos(angle) + (t2_y - y_c) * Math.sin(angle) + x_c;
    let t2_y_rot =
      -(t2_x - x_c) * Math.sin(angle) + (t2_y - y_c) * Math.cos(angle) + y_c;

    this.draw_line(
      this.px(x_c),
      this.py(y_c),
      this.px(t1_x_rot),
      this.py(t1_y_rot),
    );
    this.draw_line(
      this.px(x_c),
      this.py(y_c),
      this.px(t2_x_rot),
      this.py(t2_y_rot),
    );
  }

  draw_x_axis({
    range = this.x_range,
    start_arrow = true,
    end_arrow = true,
    y = 0,
    arrow_width = 5,
    arrow_length = 10,
  } = {}) {
    this.draw_line(range[0], y, range[1], y);

    if (end_arrow) {
      this._draw_arrowhead(range[1], y, 0, {
        width: arrow_width,
        length: arrow_length,
      });
    }
    if (start_arrow) {
      this._draw_arrowhead(range[0], y, Math.PI, {
        width: arrow_width,
        length: arrow_length,
      });
    }
  }

  draw_y_axis({
    range = null,
    start_arrow = true,
    end_arrow = true,
    x = 0,
    arrow_width = 5,
    arrow_length = 10,
  } = {}) {
    range = range || this.y_range;
    this.draw_line(x, range[0], x, range[1]);

    if (end_arrow) {
      this._draw_arrowhead(x, range[1], Math.PI / 2, {
        width: arrow_width,
        length: arrow_length,
      });
    }
    if (start_arrow) {
      this._draw_arrowhead(x, range[0], -Math.PI / 2, {
        width: arrow_width,
        length: arrow_length,
      });
    }
  }

  draw_xticks({
    spacing = 0.1,
    y = 0,
    length = 8,
    interval = [this.x_range[0], this.x_range[1]],
    labels = "below",
    no_label_near = null,
    tickStyler = (x) => {
      this.p.strokeWeight(1);
    },
    labelFormatter = (x) => x.toFixed(2),
    labelStyler = (x) => {
      this.p.noStroke();
    },
  } = {}) {
    let x = interval[0] + spacing;
    // get
    while (x < interval[1]) {
      tickStyler(x);
      this.p.line(
        this.cx(x),
        this.cy(y) - length / 2,
        this.cx(x),
        this.cy(y) + length / 2,
      );

      x += spacing;
    }

    // we split into two loops to ensure that the styling for ticks
    // isn't overridden by the styling for labels

    x = interval[0] + spacing;
    while (x < interval[1]) {
      let show_label = true;
      if (no_label_near !== null) {
        let d = Math.abs(x - no_label_near);
        // convert to pixels
        let d_px = d * this.x_scale();
        show_label = d_px > 20;
      }

      if (show_label) {
        if (labels == "below") {
          labelStyler(x);
          this.p.textAlign(this.p.CENTER, this.p.TOP);
          this.p.text(labelFormatter(x), this.cx(x), this.cy(y) + 5);
        } else if (labels == "above") {
          labelStyler(x);
          this.p.textAlign(this.p.CENTER, this.p.BOTTOM);
          this.p.text(labelFormatter(x), this.cx(x), this.cy(y) - 5);
        }
      }

      x += spacing;
    }
  }

  draw_yticks({
    spacing = 0.1,
    x = 0,
    length = 8,
    interval = [this.y_range[0], this.y_range[1]],
    labels = "left",
    no_label_near = null,
    tickStyler = (y) => {
      this.p.strokeWeight(1);
    },
    labelFormatter = (y) => y.toFixed(2),
    labelStyler = (y) => {
      this.p.noStroke();
    },
  } = {}) {
    let y = interval[0] + spacing;
    while (y < interval[1]) {
      tickStyler(y);
      this.p.line(
        this.cx(x) - length / 2,
        this.cy(y),
        this.cx(x) + length / 2,
        this.cy(y),
      );

      y += spacing;
    }

    // we split into two loops to ensure that the styling for ticks
    // isn't overridden by the styling for labels

    y = interval[0] + spacing;
    while (y < interval[1]) {
      let show_label = true;
      if (no_label_near !== null) {
        let d = Math.abs(y - no_label_near);
        // convert to pixels
        let d_py = d * this.y_scale();
        show_label = d_py > 20;
      }

      if (show_label) {
        if (labels == "left") {
          labelStyler(y);
          this.p.textAlign(this.p.RIGHT, this.p.CENTER);
          this.p.text(labelFormatter(y), this.cx(x) - 5, this.cy(y));
        } else if (labels == "right") {
          labelStyler(y);
          this.p.textAlign(this.p.LEFT, this.p.CENTER);
          this.p.text(labelFormatter(y), this.cx(x) + 5, this.cy(y));
        }
      }

      y += spacing;
    }
  }

  draw_grid({
    x_interval = this.x_range,
    y_interval = this.y_range,
    x_spacing = 0.1,
    y_spacing = 0.1,
  } = {}) {
    let x = x_interval[0];
    while (x <= x_interval[1]) {
      this.draw_line(x, y_interval[0], x, y_interval[1]);
      x += x_spacing;
    }

    let y = y_interval[0];
    while (y <= y_interval[1]) {
      this.draw_line(x_interval[0], y, x_interval[1], y);
      y += y_spacing;
    }
  }
}

export function linspace(start, stop, num) {
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + step * i);
}

export class PlotTeX {
  constructor(canvas_element, plot, text) {
    this.canvas = canvas_element;
    this.plot = plot;

    this.elements = text.map((t) => {
      let element = plot.p.createElement("span", t);
      element.style("position", "absolute");
      return element;
    });
  }

  /**
   * Converts from plot coordinates to page coordinates.
   */
  page_x(x) {
    let canvasPosition = this.canvas.elt.getBoundingClientRect();
    return this.plot.cx(x) + canvasPosition.left;
  }

  /**
   * Converts from plot coordinates to page coordinates.
   */
  page_y(y) {
    let canvasPosition = this.canvas.elt.getBoundingClientRect();
    return this.plot.cy(y) + canvasPosition.top;
  }

  setPosition(i, x, y, anchor = "center") {
    // get the span of the i-th element
    let element = this.elements[i];

    let delta_x = 0;
    let delta_y = 0;

    // get offsets
    let width = element.elt.offsetWidth;
    let height = element.elt.offsetHeight;

    if (anchor == "center") {
      delta_x = -width / 2;
      delta_y = -height / 2;
    } else if (anchor == "top-left") {
      delta_x = 0;
      delta_y = 0;
    } else if (anchor == "top-right") {
      delta_x = -width;
      delta_y = 0;
    } else if (anchor == "bottom-left") {
      delta_x = 0;
      delta_y = -height;
    } else if (anchor == "bottom-right") {
      delta_x = -width;
      delta_y = -height;
    } else if (anchor == "top") {
      delta_x = -width / 2;
      delta_y = 0;
    } else if (anchor == "bottom") {
      delta_x = -width / 2;
      delta_y = -height;
    } else if (anchor == "left") {
      delta_x = 0;
      delta_y = -height / 2;
    } else if (anchor == "right") {
      delta_x = -width;
      delta_y = -height / 2;
    }

    // set the absolute position
    element.position(this.page_x(x) + delta_x, this.page_y(y) + delta_y);
  }
}
