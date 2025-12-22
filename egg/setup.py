from setuptools import setup, Extension
from Cython.Build import cythonize

extensions = [
    Extension(
        "apyds_egg.__init__",
        ["apyds_egg/__init__.pyx"],
        language="c++",
    )
]

setup(
    ext_modules=cythonize(
        extensions,
        compiler_directives={
            'language_level': "3",
            'boundscheck': False,
            'wraparound': False,
            'cdivision': True,
        }
    )
)
