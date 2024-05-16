from .html_context import make_context

from .directives import exercise

def setup(app):
    app.connect("html-page-context", make_context)

    exercise.setup(app)
