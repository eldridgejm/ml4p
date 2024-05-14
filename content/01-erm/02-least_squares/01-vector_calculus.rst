Vector Calculus
===============

.. math::

Recall that the empirical risk with respect to the square loss is given
by:

.. math::

    R(\vec w) = \frac{1}{n} \sum_{i=1}^n (w^T \vec x_i - y_i)^2

In matrix-vector form, we can rewrite this as:

.. math::

    R(\vec w) = \frac{1}{n} ||X \vec w - \vec y||^2

where :math:`X` is the matrix whose :math:`i`-th row is :math:`\vec x_i^T`

Now we want to take a gradient of this function with respect to :math:`\vec w`.
For this, it's useful to remember a few rules of matrix calculus:

**Rules**

1. The gradient of a scalar with respect to a vector is a vector. The :math:`i`-th
   element of this vector is the derivative of the scalar with respect to the
   :math:`i`-th element of the vector.
2. The gradient of a vector with respect to a vector is a matrix. The :math:`i,j`-th
   element of this matrix is the derivative of the :math:`i`-th element of the
   vector with respect to the :math:`j`-th element of the vector.
3. The gradient of a scalar with respect to a matrix is a matrix. The :math:`i,j`-th
   element of this matrix is the derivative of the scalar with respect to the
   :math:`i,j`-th element of the matrix.

Using these rules, we can compute the gradient of the empirical risk with respect
to :math:`\vec w`:

.. math::

    \nabla_{\vec w} R(\vec w) = \nabla_{\vec w} \frac{1}{n} ||X \vec w - \vec y||^2


testing :math:`f(x) = 42` is a tthing that :math:`f(x)`

There are two ways to compute this gradient. The first way is to expand the
squared norm and then take the gradient. The second way is to use the chain rule
and the fact that :math:`||A||^2 = A^T A`:

.. math::

    \nabla_{\vec w} R(\vec w) = \nabla_{\vec w} \frac{1}{n} (X \vec w - \vec y)^T (X \vec w - \vec y)

    = \nabla_{\vec w} \frac{1}{n} (\vec w^T X^T X \vec w - \vec w^T X^T \vec y - \vec y^T X \vec w + \vec y^T \vec y)

    = \frac{1}{n} (2 X^T X \vec w - 2 X^T \vec y)

    = \frac{2}{n} X^T (X \vec w - \vec y)

