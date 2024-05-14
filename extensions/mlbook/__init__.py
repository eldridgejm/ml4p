from .html_context import make_context

def setup(app):
    app.connect("html-page-context", make_context)
