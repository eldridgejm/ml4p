import numpy as np
import matplotlib.pyplot as plt


def setup():
    x = np.linspace(0, 10, 100)
    y = x * np.sin(x)

    plt.figure(figsize=(4, 2))
    plt.plot(x, y)


if __name__ == "__main__":
    setup()
