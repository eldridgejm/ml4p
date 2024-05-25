// ml4p.js

document.addEventListener("DOMContentLoaded", function () {
  changeAllHeaderLinkCharacters();
  installThemeWatcher();

  setupFoldIcons();
  setupThemeModeToggles();
  setupGeneratedImages();
});

// theme change events
// ===================

// the "data-bs-theme" attribute on the html element is the ground truth for the
// current theme. We'll make a custom event that will be emitted whenever this attribute
// changes.

// returns the current theme: either "light" or "dark". This will be set by
// the script in the header of the theme, but in case not, it will default to
// "light".
function getTheme() {
  return document.documentElement.getAttribute("data-bs-theme") || "light";
}

// sets the theme to either "light" or "dark"
function setTheme(theme) {
  // change the theme by setting the attribute on the html element
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem("ml4p-theme", theme);
}

function installThemeWatcher() {
  // this will watch for changes to the theme and emit a "ml4p-theme-changed" event
  // when it changes
  let themeWatcher = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === "data-bs-theme") {
        let theme = mutation.target.getAttribute("data-bs-theme");
        let event = new CustomEvent("ml4p-theme-changed", { detail: theme });
        document.dispatchEvent(event);
      }
    });
  });

  themeWatcher.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bs-theme"],
  });
}

// theme toggles
// =============

function getThemeToggles() {
  // there are two toggles: one in the mobile sidebar and another in
  // the desktop sidebar
  return document.querySelectorAll(".ml4p-toggle-dark-mode");
}

// sets all of the toggles so that they reflect the current theme
function updateThemeModeToggles(toggles) {
  let theme = getTheme();

  // "on" is dark mode, "off" is light mode
  toggles.forEach(function (toggle) {
    toggle.checked = theme === "dark";
  });
}

function installThemeModeToggleHandlers(toggles) {
  // on toggle button change
  toggles.forEach(function (toggle) {
    toggle.addEventListener("change", function () {
      let theme = toggle.checked ? "dark" : "light";
      setTheme(theme);
      updateThemeModeToggles(toggles);
    });
  });

  // on theme change, make sure the toggles are updated
  document.addEventListener("ml4p-theme-changed", function (event) {
    let toggles = getThemeToggles();
    updateThemeModeToggles(toggles);
  });
}

function setupThemeModeToggles() {
  let toggles = getThemeToggles();
  updateThemeModeToggles(toggles);
  installThemeModeToggleHandlers(toggles);
}

// fold icons
// ==========

function getAllFoldIcons() {
  // fold icons have the string "sb-fold-icon" in their ID
  return document.querySelectorAll("[id*='sb-fold-icon']");
}

function getAllSidebarButtons() {
  // sidebar buttons have the string "sb-fold-button" in their ID
  return document.querySelectorAll("[id*='sb-btn']");
}

// updates the color of the fold icons based on the current theme
function updateFoldIconColors(foldIcons) {
  let theme = getTheme();

  foldIcons.forEach(function (foldIcon) {
    if (theme === "dark") {
      foldIcon.src =
        "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba%28255,255,255,.5%29' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 14l6-6-6-6'/%3e%3c/svg%3e";
    } else {
      foldIcon.src =
        "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba%280,0,0,.5%29' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 14l6-6-6-6'/%3e%3c/svg%3e";
    }
  });
}

function updateFoldIconRotation(button, { animate = true } = {}) {
  let foldIcon = button.querySelector("[id*='sb-fold-icon']");
  let angle = button.getAttribute("aria-expanded") === "true" ? 90 : 0;

  // rotate the fold icon 90 degrees, with animation
  foldIcon.style.transform = `rotate(${angle}deg)`;
  if (!animate) {
    foldIcon.style.transition = "none";
  } else {
    foldIcon.style.transition = "transform 0.35s ease";
  }
}

function installSidebarButtonClickHandlers(buttons) {
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      updateFoldIconRotation(button);
    });
  });
}

// changes the color of the fold icons when the theme changes
function installFoldIconColorChangers(foldIcons) {
  document.addEventListener("ml4p-theme-changed", function (event) {
    updateFoldIconColors(foldIcons);
  });
}

function setupFoldIcons() {
  let foldIcons = getAllFoldIcons();
  let buttons = getAllSidebarButtons();

  updateFoldIconColors(foldIcons);
  buttons.forEach((b) => updateFoldIconRotation(b, { animate: false }));
  installSidebarButtonClickHandlers(buttons);
  installFoldIconColorChangers(foldIcons);
}

// generated images
// ================

function updateGeneratedImageColor(image, theme) {
  // the end of the src will be either -light.png or -dark.png, and we adjust
  // it based on the current theme
  let newSrc = image.src.replace(/-(light|dark)\.png$/, `-${theme}.png`);
  // this prevents an infinite loop where setting the src triggers the
  // onload event, which triggers the src to be set again
  if (newSrc !== image.src) {
    image.src = newSrc;
  }
}

function installGeneratedImageColorChangers(images) {
  document.addEventListener("ml4p-theme-changed", function (event) {
    let theme = getTheme();
    images.forEach(function (image) {
      updateGeneratedImageColor(image, theme);
    });
  });
}

function initializeGeneratedImage(image) {
  // set its size
  image.style.width = (image.naturalWidth / 2).toString() + "px";
  image.style.height = (image.naturalHeight / 2).toString() + "px";

  let theme = getTheme();
  updateGeneratedImageColor(image, theme);
}

function setupGeneratedImages() {
  // get all of the generated images
  let images = document.querySelectorAll("img.ml4p-figure-generated-static");
  installGeneratedImageColorChangers(images);
}

// misc.
// =====

// changes all header link characters to # instead of the default "pilcrow"
function changeAllHeaderLinkCharacters() {
  let headerLinks = document.querySelectorAll(".headerlink");
  headerLinks.forEach(function (link) {
    link.textContent = "#";
  });
}
