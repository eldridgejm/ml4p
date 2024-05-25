# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "Machine Learning"
copyright = "2024, Justin Eldridge"
author = "Justin Eldridge"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

import pathlib
import sys

root = pathlib.Path(__file__).parent.parent
sys.path.append(str(root / "ext"))

extensions = ["ml4p", "sphinxcontrib.katex"]

exclude_patterns = []


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = "ml4p"
html_theme_path = ["../ext/"]
templates_path = ["../ext/ml4p/theme/templates"]
