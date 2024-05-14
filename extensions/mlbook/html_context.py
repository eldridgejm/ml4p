"""Populates the HTML templating context."""


import typing


class Part(typing.NamedTuple):
    supertitle: str
    title: str
    id: str
    index_doc: str
    children: typing.List["Chapter"]

    def is_active(self, doc: str):
        return doc.split("/")[0] == self.index_doc.split("/")[0]


class Chapter(typing.NamedTuple):
    title: str
    id: str
    index_doc: str
    children: typing.List["Section"]
    part: Part

    def is_active(self, doc: str):
        return doc.split("/")[:2] == self.index_doc.split("/")[:2]


class Section(typing.NamedTuple):
    title: str
    id: str
    doc: str
    chapter: Chapter


def make_part(docname: str, app):
    supertitle = app.env.metadata[docname]['supertitle']
    title = app.env.titles[docname].astext()
    includes = app.env.toctree_includes.get(docname, [])
    id = docname.replace("/", "-")
    part = Part(supertitle, title, id, docname, [])

    for docname in includes:
        part.children.append(make_chapter(docname, app, part))

    return part


def make_chapter(docname: str, app, part):
    title = app.env.titles[docname].astext()
    includes = app.env.toctree_includes.get(docname, [])
    id = docname.replace("/", "-")
    chapter = Chapter(title, id, docname, [], part)

    for docname in includes:
        chapter.children.append(make_section(docname, app, chapter))

    return chapter


def make_section(docname: str, app, chapter):
    title = app.env.titles[docname].astext()
    id = docname.replace("/", "-")
    return Section(title, id, docname, chapter)


def make_navigation(app):
    """
    The filesystem structure of the book is as follows:

        index.rst
        00-intro/
            index.rst
        01-erm/
            index.rst
            01-without_features/
                index.rst
                01-a_section.rst
                02-another_section.rst
            02-with_features/
                index.rst
                01-a_section.rst
                02-another_section.rst

        The outer directories represent *parts*, their subdirectories represent
        *chapters* and the files represent *sections*. Each of the `index.rst` files
        (and only these files) contain toctrees.

        We turn this into a list of nested dictionaries representing parts:

            [
                {
                    "title": "Introduction",
                    "doc": "00-intro/index"
                    "children": [
                    ]
                },
                {
                    "title": "Empirical Risk Minimization",
                    "doc": "01-erm/index",
                    "children": [
                        {
                            "title": "Without Features",
                            "doc": "01-erm/01-without_features/index",
                            "children": [
                                {
                                    "title": "A Section",
                                    "doc": "01-erm/01-without_features/01-a_section"
                                },
                                {
                                    "title": "Another Section",
                                    "doc": "01-erm/01-without_features/02-another_section"
                                }
                            ]
                        }
                    ]
                }
            ]
    """


def make_context(app, pagename, templatename, context, doctree):
    if not hasattr(app.env, "cache"):
        app.env.cache = {}

    parts = [make_part(docname, app) for docname in app.env.toctree_includes["index"]]

    context["parts"] = parts

    name_parts = pagename.split("/")

    if len(name_parts) >= 2:
        part_name = name_parts[0]
        context["active_part"] = make_part(part_name + "/index", app)

    if len(name_parts) >= 3:
        chapter_name = "/".join(name_parts[:2])
        context["active_chapter"] = make_chapter(
            chapter_name + "/index", app, context["active_part"]
        )
