// wait until the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // gather all of the elements whose ids start with sb-btn
  let sidebarButtons = document.querySelectorAll('[id^="sb-btn"]');

  // add a click listener to each of the buttons
  sidebarButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // find the corresponding fold icon. this is an image with id starting with
      // sb-fold-icon; the rest is the same as the button id
      let foldIcon = document.getElementById(
        "sb-fold-icon" + button.id.slice(6),
      );

      let angle = button.getAttribute("aria-expanded") === "true" ? 90 : 0;

      // rotate the fold icon 90 degrees, with animation
      foldIcon.style.transform = `rotate(${angle}deg)`;
      foldIcon.style.transition = "transform 0.35s ease";
    });

    // if the button is expanded to begin with, rotate the fold icon
    // 90 degrees
    if (button.getAttribute("aria-expanded") === "true") {
      let foldIcon = document.getElementById(
        "sb-fold-icon" + button.id.slice(6),
      );
      foldIcon.style.transform = "rotate(90deg)";
    }
  });

  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // get all of the toggle-dark-mode switches
  let toggleDarkMode = document.querySelectorAll(".toggle-dark-mode");

  const setAllDarkModeToggles = function (setting) {
    toggleDarkMode.forEach(function (toggle) {
      toggle.checked = setting;
    });
  };

  const setFoldIconColor = function (dark) {
    sidebarButtons.forEach(function (button) {
      let foldIcon = document.getElementById(
        "sb-fold-icon" + button.id.slice(6),
      );

      if (dark) {
        foldIcon.src =
          "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba%28255,255,255,.5%29' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 14l6-6-6-6'/%3e%3c/svg%3e";
      } else {
        foldIcon.src =
          "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba%280,0,0,.5%29' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 14l6-6-6-6'/%3e%3c/svg%3e";
      }
    });
  };

  // set the toggle-dark-mode switch to the correct position based on the theme
  if (getPreferredTheme() === "dark") {
    setAllDarkModeToggles(true);
    document.body.setAttribute("data-bs-theme", "dark");
    setFoldIconColor(true);
  } else {
    setAllDarkModeToggles(false);
    document.body.setAttribute("data-bs-theme", "light");
    setFoldIconColor(false);
  }

  // watch the toggle-dark-mode switches and change the theme accordingly
  toggleDarkMode.forEach(function (toggle) {
    toggle.addEventListener("change", function () {
      if (toggle.checked) {
        document.body.setAttribute("data-bs-theme", "dark");
        setAllDarkModeToggles(true);
        setFoldIconColor(true);
        localStorage.setItem("theme", "dark");
      } else {
        document.body.setAttribute("data-bs-theme", "light");
        setAllDarkModeToggles(false);
        setFoldIconColor(false);
        localStorage.setItem("theme", "light");
      }
    });
  });
});
