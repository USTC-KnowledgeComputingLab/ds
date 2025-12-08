"""
Setup script for apyds-bnf package with ANTLR parser generation
"""

import subprocess
import sys
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
        grammars_dir = base_dir / "grammars"
        output_dir = base_dir / "apyds_bnf" / "generated"

        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)

        # Create __init__.py for the generated package
        (output_dir / "__init__.py").touch()

        # Generate parsers for both grammars
        for grammar in ["Ds.g4", "Dsp.g4"]:
            grammar_path = grammars_dir / grammar
            if not grammar_path.exists():
                print(f"Warning: Grammar file {grammar_path} not found", file=sys.stderr)
                continue

            print(f"Generating parser for {grammar}...")
            try:
                subprocess.run(
                    [
                        "antlr4",
                        "-Dlanguage=Python3",
                        "-visitor",
                        "-no-listener",
                        "-o",
                        str(output_dir),
                        str(grammar_path),
                    ],
                    check=True,
                    cwd=base_dir,
                )
                print(f"Successfully generated parser for {grammar}")
            except subprocess.CalledProcessError as e:
                print(f"Error generating parser for {grammar}: {e}", file=sys.stderr)
                # Try using antlr4-tools if antlr4 command is not available
                try:
                    subprocess.run(
                        [
                            sys.executable,
                            "-m",
                            "antlr4_tools",
                            "-Dlanguage=Python3",
                            "-visitor",
                            "-no-listener",
                            "-o",
                            str(output_dir),
                            str(grammar_path),
                        ],
                        check=True,
                        cwd=base_dir,
                    )
                    print(f"Successfully generated parser for {grammar} using antlr4-tools")
                except (subprocess.CalledProcessError, FileNotFoundError) as e2:
                    print(
                        f"Error: Could not generate parsers. Please install antlr4 or antlr4-tools.",
                        file=sys.stderr,
                    )
                    print(f"  pip install antlr4-tools", file=sys.stderr)
                    raise


# Use pyproject.toml for configuration, but provide custom build command
if __name__ == "__main__":
    setup(
        cmdclass={
            "build_py": BuildWithAntlr,
        }
    )
