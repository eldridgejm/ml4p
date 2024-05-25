from . import html_theme
from . import directives

def setup(app):
    app.connect("html-page-context", html_theme.make_context)

    directives.exercise.setup(app)
    directives.jsfig.setup(app)
