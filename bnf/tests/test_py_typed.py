"""Test that py.typed marker file exists in the package."""

import importlib.util
import pathlib


def test_py_typed_exists() -> None:
    """Verify that py.typed marker file is present in the package."""
    spec = importlib.util.find_spec("apyds_bnf")
    assert spec is not None and spec.origin is not None, "apyds_bnf package not found"
    
    package_path = pathlib.Path(spec.origin).parent
    py_typed_path = package_path / "py.typed"
    
    assert py_typed_path.exists(), "py.typed marker file not found in package"
    assert py_typed_path.is_file(), "py.typed should be a file"
