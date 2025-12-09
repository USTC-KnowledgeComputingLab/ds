"""
PDM build hook that executes prebuild commands from pyproject.toml
"""

import subprocess
import tomllib
from pathlib import Path


def pdm_build_hook_enabled(context):
    """Enable the PDM build hook"""
    return True


def pdm_build_initialize(context):
    """
    PDM build hook that executes prebuild commands defined in pyproject.toml.
    This allows the ANTLR commands to be configured in pyproject.toml similar to package.json's prepare script.
    """
    base_dir = Path(__file__).parent
    pyproject_path = base_dir / "pyproject.toml"
    
    # Read prebuild commands from pyproject.toml
    with open(pyproject_path, "rb") as f:
        pyproject = tomllib.load(f)
    
    commands = pyproject.get("tool", {}).get("pdm", {}).get("build", {}).get("prebuild", [])
    
    # Execute each command
    # Note: shell=True is used here because commands are defined in the project's own
    # pyproject.toml file (not external user input), similar to package.json scripts.
    for cmd in commands:
        print(f"Running: {cmd}")
        try:
            subprocess.run(
                cmd,
                shell=True,
                check=True,
                cwd=base_dir,
            )
            print(f"Successfully executed: {cmd}")
        except subprocess.CalledProcessError as e:
            raise RuntimeError(
                f"Failed to execute prebuild command: {cmd}\n"
                f"Error: {e}"
            ) from e
