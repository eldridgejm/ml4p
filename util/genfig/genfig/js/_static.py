"""Provides `generate_static()` for creating PNGs from JavaScript figures."""

import pathlib
import json
import subprocess
import hashlib
from typing import Optional
from io import BytesIO

import selenium.webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

from PIL import Image

from ._preview import make_preview

PORT = 5028


def _start_webserver(directory: pathlib.Path):
    process = subprocess.Popen(
        ["python", "-m", "http.server", str(PORT)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=directory,
    )
    return process


def _take_browser_screenshot(
    figure_directory: pathlib.Path, theme: str = "light"
) -> Image.Image:
    options = Options()
    # options.add_argument("--headless")  # Ensure GUI is off
    options.add_argument("--no-sandbox")

    # Include the path to your ChromeDriver if necessary
    driver = selenium.webdriver.Chrome(options=options)

    # open the file
    driver.get(
        f"http://127.0.0.1:{PORT}/figures/{figure_directory.name}/_build/preview-static.html"
    )

    # run some JavaScript to set the theme
    driver.execute_script(f"FIGTHEME = '{theme}'")

    elem = driver.find_element(By.ID, "defaultCanvas0")
    pixel_ratio = driver.execute_script("return window.devicePixelRatio")

    location = elem.location
    size = elem.size

    png = driver.get_screenshot_as_png()  # saves screenshot of entire page
    driver.quit()

    left = location["x"] * pixel_ratio
    top = location["y"] * pixel_ratio + 1
    right = left + size["width"] * pixel_ratio
    bottom = top + size["height"] * pixel_ratio - 1

    img = Image.open(BytesIO(png))  # uses PIL library to open image in memory
    img = img.crop((left, top, right, bottom))  # defines crop points
    return img


def _stop_webserver(process):
    process.terminate()


def _make_figure_basename(figure_options: dict) -> str:
    if figure_options:
        opts_json = json.dumps(figure_options, sort_keys=True)
        return "figure-" + hashlib.md5(opts_json.encode()).hexdigest()
    else:
        return "figure"


def generate_static(
    figure_directory: pathlib.Path, figure_options: Optional[dict] = None
):
    """Generates static figures from the JavaScript.

    This works by 1) making an HTML preview of the figure, 2) starting a webserver in
    the /vis/js directory (to serve the javascript modules), 3) opening the preview in
    a headless browser and taking a screenshot of the canvas.

    Parameters
    ----------
    figure_directory : pathlib.Path
        The directory containing the figure.

    figure_options : dict, optional
        Options for the figure. Default is None.

    """
    if figure_options is None:
        figure_options = {}

    figbasename = _make_figure_basename(figure_options)

    make_preview(figure_directory, dynamic=False, figure_options=figure_options)
    process = _start_webserver(figure_directory.parent.parent)
    img_light = _take_browser_screenshot(figure_directory, theme="light")
    img_dark = _take_browser_screenshot(figure_directory, theme="dark")
    _stop_webserver(process)

    img_light.save(figure_directory / "_build" / f"{figbasename}-light.png")
    img_dark.save(figure_directory / "_build" / f"{figbasename}-dark.png")
