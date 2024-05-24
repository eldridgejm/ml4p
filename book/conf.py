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

sys.path.append(str(pathlib.Path(__file__).parent.parent / "extensions"))

extensions = ["mlbook", "sphinxcontrib.katex", "matplotlib.sphinxext.plot_directive"]

plot_formats = [("png", 300)]
plot_rcparams = {"savefig.transparent": True}

templates_path = ["_templates"]
exclude_patterns = []


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = "mlbook"
html_theme_path = ["../theme"]
html_static_path = ["_static"]
