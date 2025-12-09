"""
Setup script for apyds-bnf package with ANTLR parser generation
"""

import subprocess
from pathlib import Path

from setuptools import setup
from setuptools.command.build_py import build_py


class BuildWithAntlr(build_py):
    """Custom build command that generates ANTLR parsers before building"""

    def run(self):
        """Generate ANTLR parsers and then run the standard build"""
        self.generate_antlr_parsers()
        super().run()

    def generate_antlr_parsers(self):
        """Generate Python parsers from ANTLR grammars"""
        base_dir = Path(__file__).parent
        grammars_dir = base_dir
        output_dir = base_dir / "apyds_bnf"

        # Generate parsers for both grammars
        for grammar in ["Ds.g4", "Dsp.g4"]:
            grammar_path = grammars_dir / grammar

            print(f"Generating parser for {grammar}...")
            subprocess.run(
                [
                    "antlr4",
                    "-Dlanguage=Python3",
                    str(grammar_path),
                    "-visitor",
                    "-no-listener",
                    "-o",
                    str(output_dir),
                ],
                check=True,
                cwd=base_dir,
            )
            print(f"Successfully generated parser for {grammar}")


# Use pyproject.toml for configuration, but provide custom build command
if __name__ == "__main__":
    setup(
        cmdclass={
            "build_py": BuildWithAntlr,
        }
    )
