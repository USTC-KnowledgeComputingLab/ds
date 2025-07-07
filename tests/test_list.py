import pytest
import copy
import pyds


@pytest.fixture
def l() -> pyds.List:
    return pyds.List("(a b c)")


def test_str(l: pyds.List) -> None:
    assert str(l) == "(a b c)"

    with pyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(l)


def test_repr(l: pyds.List) -> None:
    assert repr(l) == "List[(a b c)]"


def test_copy_hash_and_equality(l: pyds.List) -> None:
    other = copy.copy(l)
    assert other == l
    assert hash(other) == hash(l)
    assert 1 != l


def test_create_from_same(l: pyds.List) -> None:
    list = pyds.List(l)
    assert str(list) == "(a b c)"

    with pytest.raises(ValueError):
        list = pyds.List(l, 100)


def test_create_from_base(l: pyds.List) -> None:
    list = pyds.List(l.value)
    assert str(list) == "(a b c)"


def test_create_from_text() -> None:
    list = pyds.List("(a b c)")
    assert str(list) == "(a b c)"

    # list never fails


def test_create_from_bytes(l: pyds.List) -> None:
    list = pyds.List(l.data())
    assert str(list) == "(a b c)"

    with pytest.raises(ValueError):
        list = pyds.List(l.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        list = pyds.List(100)


def test_len(l) -> None:
    assert len(l) == 3


def test_getitem(l) -> None:
    assert str(l[0]) == "a"
    assert str(l[1]) == "b"
    assert str(l[2]) == "c"

    with pytest.raises(TypeError):
        _ = l[-1]

    with pytest.raises(TypeError):
        _ = l[3]
