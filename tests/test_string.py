import pytest
import copy
import pyds


@pytest.fixture
def s() -> pyds.String:
    return pyds.String("string")


def test_str(s: pyds.String) -> None:
    assert str(s) == "string"

    with pyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(s)


def test_repr(s: pyds.String) -> None:
    assert repr(s) == "String[string]"


def test_copy_hash_and_equality(s: pyds.String) -> None:
    other = copy.copy(s)
    assert other == s
    assert hash(other) == hash(s)
    assert 1 != s


def test_create_from_same(s: pyds.String) -> None:
    string = pyds.String(s)
    assert str(string) == "string"

    with pytest.raises(ValueError):
        string = pyds.String(s, 100)


def test_create_from_base(s: pyds.String) -> None:
    string = pyds.String(s.value)
    assert str(string) == "string"


def test_create_from_text() -> None:
    string = pyds.String("string")
    assert str(string) == "string"

    # string never fails


def test_create_from_bytes(s: pyds.String) -> None:
    string = pyds.String(s.data())
    assert str(string) == "string"

    with pytest.raises(ValueError):
        string = pyds.String(s.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        string = pyds.String(100)
