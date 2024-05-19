.. Machine Learning documentation master file, created by
   sphinx-quickstart on Sun May 12 15:58:00 2024.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. raw:: html

  <h1>Machine Learning for People</h1>
  <h5 class="pb-3">(who don't already know machine learning)</h5>

A truly introductory machine learning textbook by
`Justin Eldridge <http://eldridgejm.github.io>`_.

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

.. jsfig:: 1d-risk

   {
      data: [.1, .2, .3, .35, .37, .41, .5, .7],
      w_0: .2,
      allow_optimization: true
   }

Try moving the triangle representing :math:`h` in the figure below.

.. jsfig:: 1d-risk

.. jsfig:: 1d-risk

   { w_0: 3 }
