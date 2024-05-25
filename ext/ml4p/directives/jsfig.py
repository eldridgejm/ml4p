"""Provides a directive for displaying JavaScript figures."""
import uuid
from string import Template

from docutils.parsers.rst import Directive, directives
from docutils import nodes


class JSFigureNode(nodes.General, nodes.Element):
    def __init__(
        self,
        id: str,
        figure_name: str,
        figure_options_json: str,
        align="center",
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.id = id
        self.figure_name = figure_name
        self.align = align
        self.figure_options_json = figure_options_json


class JSFigureDirective(Directive):
    required_arguments = 1
    optional_arguments = 1
    option_spec = {"align": directives.unchanged}
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
        )
        return [figure_node]


def visit_jsfigure_node(self, node):
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

    html = html_template.substitute(
        figure_name=node.figure_name,
        div_id=node.id,
        figure_options_json=node.figure_options_json,
        align=node.align,
    )

    self.body.append(html)


def depart_jsfigure_node(self, node):
    pass


def setup(app):
    app.add_directive("jsfig", JSFigureDirective)
    app.add_node(JSFigureNode, html=(visit_jsfigure_node, depart_jsfigure_node))
