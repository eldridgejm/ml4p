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
      draw_data_labels: false,
      loss: "square",
      draw_x_ticks: false,
      risk_style: "as-you-go",
      animation: [
        "sweep_hypothesis",
        {
          style: "back-and-forth",
          show_buttons: false
        }
      ],
   }
