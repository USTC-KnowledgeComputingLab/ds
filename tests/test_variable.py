import pytest
import copy
import pyds


@pytest.fixture
def v() -> pyds.Variable:
    return pyds.Variable("`variable")


def test_str(v: pyds.Variable) -> None:
    assert str(v) == "`variable"

    with pyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(v)


def test_repr(v: pyds.Variable) -> None:
    assert repr(v) == "Variable[`variable]"


def test_copy_hash_and_equality(v: pyds.Variable) -> None:
    other = copy.copy(v)
    assert other == v
    assert hash(other) == hash(v)
    assert 1 != v


def test_create_from_same(v: pyds.Variable) -> None:
    variable = pyds.Variable(v)
    assert str(variable) == "`variable"

    with pytest.raises(ValueError):
        variable = pyds.Variable(v, 100)


def test_create_from_base(v: pyds.Variable) -> None:
    variable = pyds.Variable(v.value)
    assert str(variable) == "`variable"


def test_create_from_text() -> None:
    variable = pyds.Variable("`variable")
    assert str(variable) == "`variable"

    # variable never fails


def test_create_from_bytes(v: pyds.Variable) -> None:
    variable = pyds.Variable(v.data())
    assert str(variable) == "`variable"

    with pytest.raises(ValueError):
        variable = pyds.Variable(v.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        variable = pyds.Variable(100)


def test_name(v: pyds.Variable) -> None:
    assert str(v.name) == "variable"
