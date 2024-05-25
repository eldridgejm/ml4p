Sphinx Theme
============

The book uses a custom Sphinx theme built on top of the
`Bootstrap <http://getbootstrap.com/>`_ framework. The theme is located in the
``ext/ml4p/html_theme`` directory.

Dark and Light Mode
-------------------

Bootstrap 5 supports dark and light modes. The mode is controlled by setting
the ``data-bs-theme`` attribute on the ``<html>`` tag to either ``dark`` or
``light``.

We persist the theme between page loads using ``localStorage``. When the page
is loaded, the value of the ``theme`` key is read from ``localStorage`` and the
``data-bs-theme`` attribute is set accordingly. This is done in a script placed
in the head of the book page, so by the time the DOM has fully loaded, the
``data-bs-theme`` attribute has been set.

Several toggles are provided to allow the user to switch between dark and light
mode. These toggles are implemented as buttons that 1) set the
``data-bs-theme`` attribute on the ``<html>`` tag to either ``dark`` or
``light`` and 2) update the value of the ``theme`` key in ``localStorage``.

When the data attribute changes, a custom ``ml4p-theme-changed`` event is
emitted. This event is listened for by function which change the color
of the fold icons and make sure that the toggle buttons are in sync.

Templates
---------

The HTML output of the book is rendered using several Jinja templates located
in the ``ext/ml4p/html_theme/templates`` directory. The "main" template is
``layout.html``; other templates "fill in" pieces of the layout, such as the
sidebar, the header, and the navigation links.

Context variables
~~~~~~~~~~~~~~~~~

At render time, there are several variables available to the templates. These
variables are defined in ``ext/ml4p/html_theme/_context.py``:

- ``booktree``: A list of :class:`PartInfo` objects, each of which represents a
  part of the book.
- ``key_to_html_id``: A function that takes a string and returns a string that
  is suitable for use as an HTML id attribute.
- ``active_page``: A :class:`PageInfo` object representing the page that is
  currently being rendered.
- ``supplements``: A list of :class:`PageInfo` objects representing the
  supplemental pages. These are pages that are under the root of the book,
  excluding the index page.

Information classes
~~~~~~~~~~~~~~~~~~~

The :class:`PartInfo`, :class:`ChapterInfo`, and :class:`PageInfo` classes are
used to represent the structure of the book. These classes are defined in
``ext/ml4p/html_theme/context.py``.

.. autoclass:: ml4p.html_theme.context.PartInfo
   :members:

.. autoclass:: ml4p.html_theme.context.ChapterInfo
   :members:

.. autoclass:: ml4p.html_theme.context.PageInfo
   :members:
