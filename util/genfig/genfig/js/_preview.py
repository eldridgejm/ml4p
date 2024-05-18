"""Provides `make_preview()` for creating an HTML preview of the JS figure."""

from string import Template
from typing import Optional
import json
import pathlib


def _read_preview_template() -> str:
    """Reads the preview template from the package.

    Returns
    -------
    str
        The preview template.

    """
    with open(pathlib.Path(__file__).parent / "js-preview.html", "r") as f:
        return f.read()


def _make_build_directory(figure_directory: pathlib.Path) -> pathlib.Path:
    # check for _build directory
    build_directory = figure_directory / "_build"
    if not build_directory.exists():
        build_directory.mkdir()
    return build_directory


def make_preview(figure_directory: pathlib.Path, dynamic=True, figure_options: Optional[dict] = None):
    """Creates an HTML page suitable for (live) previewing the figure.

    Parameters
    ----------
    figure_directory : pathlib.Path
        The directory containing the figure.

    dynamic : bool
        Whether to use `setup_dynamic()` or `setup_static()` in the preview.
        Default is True (use `setup_dynamic()`).

    figure_options : dict, optional
        Options for the figure. Default is None, in which case an empty
        dictionary is used. This is serialized to JSON and embedded in the
        preview HTML.

    """
    if not (figure_directory / "main.js").exists():
        raise FileNotFoundError(f"main.js not found in {figure_directory}")

    if figure_options is None:
        figure_options = {}

    build_directory = _make_build_directory(figure_directory)

    preview_template = Template(_read_preview_template())

    # the template has one placeholder: the name of the figure directory
    preview = preview_template.substitute(
        {
            "figure_directory_name": figure_directory.name,
            "static_or_dynamic": "dynamic" if dynamic else "static",
            "figure_options": json.dumps(figure_options),
        }
    )

    # write the preview to _build/preview.html
    filename = "preview-dynamic.html" if dynamic else "preview-static.html"
    with open(build_directory / filename, "w") as f:
        f.write(preview)
