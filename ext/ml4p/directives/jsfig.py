"""Provides a directive for displaying JavaScript figures."""
import json
import pathlib
import uuid
import shutil
from string import Template

from docutils.parsers.rst import Directive, directives
from docutils import nodes

import genfig.js

# the root of the project
PROJECT_ROOT = pathlib.Path(__file__).parent.parent.parent.parent

# the directory containing the JS figures
FIGURES_ROOT = PROJECT_ROOT / "vis/js/figures"


class JSFigureNode(nodes.General, nodes.Element):
    def __init__(
        self,
        id: str,
        figure_name: str,
        figure_options_json: str,
        align="center",
        html_output="dynamic",
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.id = id
        self.figure_name = figure_name
        self.align = align
        self.html_output = html_output
        self.figure_options_json = figure_options_json


def _validate_html_output_option(argument) -> str:
    """Validate the `html_output` option."""
    argument = argument.lower()
    if argument not in ["static", "dynamic"]:
        raise ValueError(
            "Invalid option for `html`. Must be either 'static' or 'dynamic'."
        )
    return argument


class JSFigureDirective(Directive):
    required_arguments = 1
    optional_arguments = 1
    option_spec = {
        "align": directives.unchanged,
        "html_output": _validate_html_output_option,
    }
    final_argument_whitespace = True
    has_content = True

    def run(self):
        id = str(uuid.uuid4())
        figure_options_json = "\n".join(self.content).strip()
        figure_options_json = "{}" if not figure_options_json else figure_options_json
        figure_node = JSFigureNode(
            id,
            self.arguments[0],
            figure_options_json,
            align=self.options.get("align", "center"),
            html_output=self.options.get("html_output", "dynamic"),
        )
        return [figure_node]


def _generate_html_for_dynamic_figure(self, node):
    html_template = Template(
        """
    <script defer type="module">
      import { setup_dynamic } from "/_static/vis/js/figures/$figure_name/main.js";

      function getTheme() {
        return document.documentElement.getAttribute("data-bs-theme");
      }

      setup_dynamic(
        "$div_id",
        getTheme,
        $figure_options_json,
      );
    </script>

    <div class="ml4p-figure text-$align d-flex-inline" id="$div_id"></div>
    """
    )

    return html_template.substitute(
        figure_name=node.figure_name,
        div_id=node.id,
        figure_options_json=node.figure_options_json,
        align=node.align,
    )


def _generate_static_figures(self, node):
    figure_options = json.loads(node.figure_options_json)
    figbasename = genfig.js.generate_static(
        FIGURES_ROOT / node.figure_name, figure_options
    )

    # copy the figure to the output
    outdir = (
        pathlib.Path(self.builder.outdir) / f"_static/vis/js/figures/{node.figure_name}"
    )
    outdir.mkdir(parents=True, exist_ok=True)
    sourcedir = FIGURES_ROOT / node.figure_name / "_build"

    shutil.copy(
        sourcedir / f"{figbasename}-dark.png", outdir / f"{figbasename}-dark.png"
    )
    shutil.copy(
        sourcedir / f"{figbasename}-light.png", outdir / f"{figbasename}-light.png"
    )

    return figbasename


def _generate_html_for_static_figure(self, node, figbasename: str):
    html_template = Template(
        """
        <div class="text-$align" id="$div_id">
            <img
                src="/_static/vis/js/figures/$figure_name/$figbasename-dark.png"
                class="ml4p-figure ml4p-figure-generated-static"
                style="display: none;"
                onload="initializeGeneratedImage(this); this.style.display = 'block';"
            >
        </div>
        """
    )

    return html_template.substitute(
        figure_name=node.figure_name,
        figbasename=figbasename,
        div_id=node.id,
        align=node.align,
    )


def visit_jsfigure_node(self, node):
    if node.html_output == "dynamic":
        html = _generate_html_for_dynamic_figure(self, node)
    else:
        figbasename = _generate_static_figures(self, node)
        html = _generate_html_for_static_figure(self, node, figbasename)
    self.body.append(html)


def depart_jsfigure_node(self, node):
    pass


def setup(app):
    app.add_directive("jsfig", JSFigureDirective)
    app.add_node(JSFigureNode, html=(visit_jsfigure_node, depart_jsfigure_node))
