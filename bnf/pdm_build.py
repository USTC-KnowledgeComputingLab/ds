"""
PDM build hook for generating ANTLR parsers before building the package
"""

import subprocess
from pathlib import Path


def pdm_build_hook_enabled(context):
    """Enable the PDM build hook"""
    return True


def pdm_build_initialize(context):
    """
    PDM build hook that generates ANTLR parsers before building.
    This is equivalent to the 'prepare' script in package.json.
    
    This function is called before the build process starts.
    """
    base_dir = Path(__file__).parent
    grammars_dir = base_dir
    output_dir = base_dir / "apyds_bnf"

    # Generate parsers for both grammars
    for grammar in ["Ds.g4", "Dsp.g4"]:
        grammar_path = grammars_dir / grammar

        print(f"Generating parser for {grammar}...")
        try:
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
        except subprocess.CalledProcessError as e:
            raise RuntimeError(
                f"Failed to generate parser for {grammar}. "
                f"Ensure ANTLR4 is installed and accessible. "
                f"Error: {e}"
            ) from e
