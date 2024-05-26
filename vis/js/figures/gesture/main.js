import { Palette, Plot } from "../../lib/ml4p/main.js";

function configure_sketch(div_id, getTheme, opts) {
  let palette = new Palette(getTheme);
  let video;
  let plot;
  let captureReady = false;
  let features = [];
  let standardizedFeatures = [];
  let labels = [];

  function sketch(p) {
    function grayscaleFrame() {
      // returns the current frame as a p5.Image, grayscaled
      let frame = p.createImage(video.width, video.height);

      video.loadPixels();
      frame.loadPixels();

      for (let i = 0; i < video.pixels.length; i += 4) {
        let r = video.pixels[i];
        let g = video.pixels[i + 1];
        let b = video.pixels[i + 2];
        let a = video.pixels[i + 3];

        let brightness = (r + g + b) / 3;

        frame.pixels[i] = brightness;
        frame.pixels[i + 1] = brightness;
        frame.pixels[i + 2] = brightness;
        frame.pixels[i + 3] = a;
      }

      frame.updatePixels();
      return frame;
    }

    function computeBandFeatures(k) {
      // divide the frame into k bands and compute the average brightness of each band
      // returns an array of k values
      let band_width = video.height / k;
      let features = [];
      for (let band_number = 0; band_number < k; band_number++) {
        let band_start = band_number * band_width;
        let band_end = (band_number + 1) * band_width;

        let sum = 0;
        for (let y = band_start; y < band_end; y++) {
          for (let x = 0; x < video.width; x++) {
            let i = (y * video.width + x) * 4;
            sum += video.pixels[i];
          }
        }

        features.push(sum / (band_width * video.width));
      }

      return features;
    }

    function standardize(data) {
      let x1 = data.map((d) => d[0]);
      let x2 = data.map((d) => d[1]);

      let mean = function (arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      }

      let x1_mean = mean(x1);
      let x2_mean = mean(x2);

      let x1_std = Math.sqrt(mean(x1.map((x) => (x - x1_mean) ** 2)));
      let x2_std = Math.sqrt(mean(x2.map((x) => (x - x2_mean) ** 2)));

      standardizedFeatures = data.map((d) => [
        (d[0] - x1_mean) / x1_std,
        (d[1] - x2_mean) / x2_std,
      ]);
    }

    function draw_axes() {
      p.stroke(palette.fg());
      p.strokeWeight(2);
      plot.draw_x_axis();
      plot.draw_y_axis();
    }

    function train(label, { frequency = 2 } = {}) {
      if (p.frameCount % frequency !== 0) {
        return;
      }

      let x = computeBandFeatures(2);
      features.push(x);
      standardize(features);
    }

    /** Draw the captured data on the plot */
    function draw_data() {
      let x1 = standardizedFeatures.map((d) => d[0]);
      let x2 = standardizedFeatures.map((d) => d[1]);

      plot.x_range = [-3, 3];
      plot.y_range = [-3, 3];

      p.stroke(palette.c0());
      plot.scatter(x1, x2);
    }

    // setup function
    p.setup = function () {
      p.createCanvas(400, 600);
      p.clear();

      // get the webcam
      video = p.createCapture(p.VIDEO, () => {
        captureReady = true;
      });
      video.size(400, 300);
      video.hide();

      plot = new Plot(p, [400, 280], { top_left: [0, 320] });
    };

    // draw function
    p.draw = function () {
      p.clear();
      p.background(palette.bg());

      let frame = grayscaleFrame();
      p.image(frame, 0, 0, 400, 300);

      if (captureReady) {
        train("A");
      }

      draw_axes();
      draw_data();
    };
  }

  return sketch;
}

export function setup_dynamic(div_id, getTheme, opts) {
  let sketch = configure_sketch(div_id, getTheme, opts);
  new p5(sketch, div_id);
}

export let setup_static = setup_dynamic;
