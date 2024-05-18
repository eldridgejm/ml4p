from .html_context import make_context

from . import directives

def setup(app):
    app.connect("html-page-context", make_context)

    directives.exercise.setup(app)
    directives.jsfig.setup(app)
