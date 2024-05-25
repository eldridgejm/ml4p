"""Populates the HTML templating context."""
from typing import Union, List, NamedTuple, Optional, Sequence

import logging
from sphinx.errors import ExtensionError
from docutils.nodes import section


class PageInfo:
    """Contains information about a book page.

    There are three types of pages:

    - Index pages: These are the `index.rst` files in each part and chapter, as
      well as the root `index.rst` file. They contain toctrees.

    - Section pages: These pages occur three levels deep in the filesystem
      (they are nested within a part and a chapter). They contain the main
      content of the book.

    - Supplement pages: These are non-index pages that are not section pages.
      They can occur at the root level (alongside the root index page), or
      within a part (but not within a chapter, because those pages would be
      section pages by definition).

    Attributes
    ----------
    title : str
        The title of the page. It is the first heading in the page's reST source.
    key : str
        The key of the page. This is the path to the page's source file, relative
        to the root of the book and without the `.rst` extension.
    parent : Optional[Union[ChapterInfo, PartInfo]]
        The collection containing the page, if any. Pages at the root level have
        no parent.
    next : Optional["PageInfo"]
        The next page in the book, if any.
    prev : Optional["PageInfo"]
        The previous page in the book, if any.
    number: Optional[int]
        The number of the page within its parent, if any.

    """

    def __init__(
        self,
        title: str,
        key: str,
        parent: Optional[Union["ChapterInfo", "PartInfo"]],
        next: Optional["PageInfo"] = None,
        prev: Optional["PageInfo"] = None,
        number: Optional[int] = None,
    ):
        self.title = title
        self.key = key
        self.parent = parent
        self.next = next
        self.prev = prev
        self.number = number

    @property
    def is_index(self):
        """Whether the page is an index page (at any level)."""
        return self.key.endswith("/index")

    @property
    def is_part_index(self):
        """Whether the page is a part index page."""
        parts = self.key.split("/")
        return len(parts) == 2 and parts[-1] == "index"

    @property
    def is_chapter_index(self):
        """Whether the page is a chapter index page."""
        parts = self.key.split("/")
        return len(parts) == 3 and parts[-1] == "index"

    @property
    def is_section(self):
        """Whether the page is a section page."""
        parts = self.key.split("/")
        return not self.is_index and len(parts) == 3

    @property
    def is_supplement(self):
        """Whether the page is a supplement page."""
        return not self.is_index and not self.is_section

    def is_active(self, docname: str):
        """Whether this page is the active page."""
        return docname == self.key

    @classmethod
    def from_app_env(cls, env, docname: str, parent, number: Optional[int] = None):
        title = env.titles[docname].astext()
        return cls(title, docname, parent, number=number)


class ChapterInfo:
    """Contains information about a book chapter."""

    def __init__(
        self,
        title: str,
        number: int,
        key: str,
        index: PageInfo,
        parent: "PartInfo",
        children: Optional[Sequence["PageInfo"]] = None,
    ):
        self.title = title
        self.number = number
        self.key = key
        self.index = index
        self.parent = parent
        self.children = list(children) if children is not None else []

    def is_active(self, docname: str):
        return docname.split("/")[:2] == self.key.split("/")[:2]

    @classmethod
    def from_app_env(cls, env, index_docname: str, parent, number: int):
        title = env.titles[index_docname].astext()
        index = PageInfo(title, index_docname, parent=None)

        chapter = cls(title, number, index_docname, index, parent)

        for i, docname in enumerate(env.toctree_includes.get(index_docname, [])):
            page = PageInfo.from_app_env(env, docname, parent=chapter, number=i + 1)
            chapter.children.append(page)

        chapter.index.parent = chapter

        return chapter


class PartInfo:
    """Contains information about a book part."""

    def __init__(
        self,
        supertitle: str,
        title: str,
        key: str,
        index: PageInfo,
        children: Optional[Sequence[ChapterInfo]] = None,
    ):
        self.supertitle = supertitle
        self.title = title
        self.key = key
        self.index = index
        self.children = list(children) if children is not None else []

    def is_active(self, docname: str):
        return docname.split("/")[0] == self.key.split("/")[0]

    @classmethod
    def from_app_env(cls, env, index_docname: str):
        metadata = env.metadata[index_docname]
        try:
            supertitle = metadata["supertitle"]
        except KeyError:
            raise ExtensionError(
                f"Part index page '{index_docname}' is missing the 'supertitle' metadata field."
            )

        title = env.titles[index_docname].astext()
        index = PageInfo(title, index_docname, parent=None)

        part = cls(supertitle, title, index_docname, index)

        for number, docname in enumerate(env.toctree_includes.get(index_docname, [])):
            chapter = ChapterInfo.from_app_env(
                env, docname, parent=part, number=number + 1
            )
            part.children.append(chapter)

        part.index.parent = part

        return part


def _make_booktree(app):
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

    """
    parts = [
        PartInfo.from_app_env(app.env, docname)
        for docname in app.env.toctree_includes["index"]
        if docname.endswith("/index")
    ]

    # now we walk the tree and set the next and prev pointers for each page
    prev = None
    for part in parts:
        prev = part.index
        for chapter in part.children:
            chapter.index.prev = prev
            prev.next = chapter.index
            prev = chapter.index
            for page in chapter.children:
                page.prev = prev
                if prev is not None:
                    prev.next = page
                prev = page

    return parts


def key_to_html_id(key: str) -> str:
    """Converts a filesystem path to an HTML id."""
    return key.replace("/", "-")


def _get_active_page(booktree, docname):
    for part in booktree:
        if part.index.is_active(docname):
            return part.index

        for chapter in part.children:
            if chapter.index.is_active(docname):
                return chapter.index

            for page in chapter.children:
                if page.is_active(docname):
                    return page

    return None


def _get_headings(doctree):
    headings = []
    prev_level = 1
    for node in doctree.traverse(section):
        level = 1
        parent = node.parent
        while parent:
            if isinstance(parent, section):
                level += 1
            parent = parent.parent
        heading = node[0].astext()
        html_id = node.get("ids", [])[0]
        headings.append((heading, html_id, level, prev_level))
        prev_level = level

    return headings


def make_context(app, pagename, templatename, context, doctree):
    if not hasattr(app.env, "cache"):
        app.env.cache = {}

    booktree = _make_booktree(app)
    context["booktree"] = booktree
    context["key_to_html_id"] = key_to_html_id
    context["active_page"] = _get_active_page(booktree, pagename)
    if doctree is not None:
        context["headings"] = _get_headings(doctree)

    context["supplements"] = [
        PageInfo.from_app_env(app.env, docname, parent=None)
        for docname in app.env.toctree_includes["index"]
        if not docname.endswith("/index")
    ]
