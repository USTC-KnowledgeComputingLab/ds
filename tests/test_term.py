import pytest
import copy
import pyds


@pytest.fixture
def t() -> pyds.Term:
    return pyds.Term("(a b c)")


def test_str(t: pyds.Term) -> None:
    assert str(t) == "(a b c)"

    with pyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(t)


def test_repr(t: pyds.Term) -> None:
    assert repr(t) == "Term[(a b c)]"


def test_copy_hash_and_equality(t: pyds.Term) -> None:
    other = copy.copy(t)
    assert other == t
    assert hash(other) == hash(t)
    assert 1 != t


def test_create_from_same(t: pyds.Term) -> None:
    term = pyds.Term(t)
    assert str(term) == "(a b c)"

    with pytest.raises(ValueError):
        term = pyds.Term(t, 100)


def test_create_from_base(t: pyds.Term) -> None:
    term = pyds.Term(t.value)
    assert str(term) == "(a b c)"


def test_create_from_text() -> None:
    term = pyds.Term("(a b c)")
    assert str(term) == "(a b c)"

    # term never fails


def test_create_from_bytes(t: pyds.Term) -> None:
    term = pyds.Term(t.data())
    assert str(term) == "(a b c)"

    with pytest.raises(ValueError):
        term = pyds.Term(t.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        term = pyds.Term(100)


def test_term() -> None:
    assert isinstance(pyds.Term("()").term, pyds.List)
    assert isinstance(pyds.Term("a").term, pyds.Item)
    assert isinstance(pyds.Term("`a").term, pyds.Variable)

    # it is hard to create a invalid term


def test_ground_simple() -> None:
    a = pyds.Term("`a")
    b = pyds.Term("((`a b))")
    assert str(a // b) == "b"

    assert a // pyds.Term("((`a b c d e))") is None


def test_ground_scope() -> None:
    a = pyds.Term("`a")
    b = pyds.Term("((x y `a `b) (y x `b `c))")
    assert str(a.ground(b, "x")) == "`c"
