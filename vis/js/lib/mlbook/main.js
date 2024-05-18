let light_theme = {
  fg: "#000000",
  bg: "#ffffff"
}

let dark_theme = {
  fg: "#ffffff",
  bg: "#000000"
}

export class Palette {
  constructor(getTheme) {
    this.theme = getTheme;
  }

  getColors() {
    return this.theme() == "light" ? light_theme : dark_theme;
  }

  fg() {
    return this.getColors().fg;
  }

  bg() {
    return this.getColors().bg;
  }

}
