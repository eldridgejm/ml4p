.. Machine Learning documentation master file, created by
   sphinx-quickstart on Sun May 12 15:58:00 2024.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. raw:: html

  <h1>Machine Learning for People</h1>
  <h5 class="pb-3">(who don't already know machine learning)</h5>

A truly introductory machine learning textbook by
`Justin Eldridge <http://eldridgejm.github.io>`_.

.. raw:: html

   <div id="foobar">
   </div>

   <script type="module">
    import { setup_dynamic } from "/_static/vis/js/00-proof/main.js";

    setup_dynamic("foobar");
   </script>

.. plot::
   :scale: 50
   :caption: testing

    x = np.linspace(0, 10, 100)
    y = x * np.sin(x)

    plt.figure(figsize=(4, 2))
    plt.plot(x, y)


.. toctree::
   :maxdepth: 3
   :hidden:

   00-intro/index.rst
   01-erm/index.rst
   02-probabilistic_models/index.rst
   03-decision_trees/index.rst
   04-appendix/index.rst
   glossary.rst
   acknowledgements.rst

.. code:: python
   
    >>> import ml4p
    >>> ml4p.learn_everything_about_ml()
    Ok!
