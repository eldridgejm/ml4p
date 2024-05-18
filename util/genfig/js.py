from string import Template
from typing import Optional
import pathlib
import subprocess


def _read_preview_template() -> str:
    """Reads the preview template from the package.

    Returns
    -------
    str
        The preview template.

    """
    with open(pathlib.Path(__file__).parent / "data" / "js-preview.html", "r") as f:
        return f.read()


def _make_build_directory(figure_directory: pathlib.Path) -> pathlib.Path:
    # check for _build directory
    build_directory = figure_directory / "_build"
    if not build_directory.exists():
        build_directory.mkdir()
    return build_directory


# Function to start the HTTP server in another process
def start_simple_http_server(cwd):
    process = subprocess.Popen(
        ["python", "-m", "http.server", "5002"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=cwd,
    )
    return process


# Function to stop the HTTP server
def stop_simple_http_server(process):
    process.terminate()
    stdout, stderr = process.communicate()


def _take_screenshot(figure_directory: pathlib.Path):
    from PIL import Image
    from io import BytesIO
    import selenium.webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    import pathlib

    options = Options()
    options.add_argument("--headless")  # Ensure GUI is off
    options.add_argument("--no-sandbox")

    # Include the path to your ChromeDriver if necessary
    driver = selenium.webdriver.Chrome(options=options)

    # open the file
    driver.get(f"http://127.0.0.1:5002/{figure_directory.name}/_build/preview.html")

    elem = driver.find_element(By.ID, "defaultCanvas0")
    pixel_ratio = driver.execute_script("return window.devicePixelRatio")

    location = elem.location
    size = elem.size

    png = driver.get_screenshot_as_png()  # saves screenshot of entire page
    driver.quit()

    img = Image.open(BytesIO(png))  # uses PIL library to open image in memory

    left = location['x'] * 2
    top = location['y'] * 2 + 1
    right = left + size['width'] * 2
    bottom = top + size['height'] * 2 - 1

    img = img.crop((left, top, right, bottom))  # defines crop points
    img.save('screenshot.png')  # saves cropped image to file


def make_preview(figure_directory: pathlib.Path):
    """Creates _build/preview.html, suitable for live previewing of the figure.

    Parameters
    ----------
    figure_directory : pathlib.Path
        The directory containing the figure.

    """
    if not (figure_directory / "main.js").exists():
        raise FileNotFoundError(f"main.js not found in {figure_directory}")

    build_directory = _make_build_directory(figure_directory)

    preview_template = Template(_read_preview_template())

    # the template has one placeholder: the name of the figure directory
    preview = preview_template.substitute(
        {"figure_directory_name": figure_directory.name}
    )

    # write the preview to _build/preview.html
    with open(build_directory / "preview.html", "w") as f:
        f.write(preview)


def generate_static(
    figure_directory: pathlib.Path, figure_options: Optional[dict] = None
):
    """Generates static figures from the JavaScript.

    Parameters
    ----------
    figure_directory : pathlib.Path
        The directory containing the figure.

    """
    if figure_options is None:
        figure_options = {}

    build_directory = _make_build_directory(figure_directory)

    process = start_simple_http_server(figure_directory.parent)

    _take_screenshot(figure_directory)

    stop_simple_http_server(process)



if __name__ == "__main__":
    path = pathlib.Path("/Users/eldridge/workbench/mlbook/vis/js/00-proof/")
    generate_static(path)
