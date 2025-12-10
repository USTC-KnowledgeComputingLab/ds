import pytest
import copy
import apyds


@pytest.fixture
def t() -> apyds.Term:
    return apyds.Term("(a b c)")


def test_str(t: apyds.Term) -> None:
    assert str(t) == "(a b c)"

    with apyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(t)


def test_repr(t: apyds.Term) -> None:
    assert repr(t) == "Term[(a b c)]"


def test_copy_hash_and_equality(t: apyds.Term) -> None:
    other = copy.copy(t)
    assert other == t
    assert hash(other) == hash(t)
    assert 1 != t


def test_create_from_same(t: apyds.Term) -> None:
    term = apyds.Term(t)
    assert str(term) == "(a b c)"

    with pytest.raises(ValueError):
        term = apyds.Term(t, 100)


def test_create_from_base(t: apyds.Term) -> None:
    term = apyds.Term(t.value)
    assert str(term) == "(a b c)"


def test_create_from_text() -> None:
    term = apyds.Term("(a b c)")
    assert str(term) == "(a b c)"

    # term never fails


def test_create_from_bytes(t: apyds.Term) -> None:
    term = apyds.Term(t.data())
    assert str(term) == "(a b c)"

    with pytest.raises(ValueError):
        term = apyds.Term(t.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        term = apyds.Term(100)


def test_term() -> None:
    assert isinstance(apyds.Term("()").term, apyds.List)
    assert isinstance(apyds.Term("a").term, apyds.Item)
    assert isinstance(apyds.Term("`a").term, apyds.Variable)

    # it is hard to create a invalid term


def test_ground_simple() -> None:
    a = apyds.Term("`a")
    b = apyds.Term("((`a b))")
    assert str(a // b) == "b"

    assert a // apyds.Term("((`a b c d e))") is None


def test_ground_scope() -> None:
    a = apyds.Term("`a")
    b = apyds.Term("((x y `a `b) (y x `b `c))")
    assert str(a.ground(b, "x")) == "`c"


def test_rename_simple() -> None:
    a = apyds.Term("`x")
    b = apyds.Term("((pre_) (_suf))")
    assert str(a.rename(b)) == "`pre_x_suf"


def test_rename_empty_prefix() -> None:
    a = apyds.Term("`x")
    b = apyds.Term("(() (_suf))")
    assert str(a.rename(b)) == "`x_suf"


def test_rename_empty_suffix() -> None:
    a = apyds.Term("`x")
    b = apyds.Term("((pre_) ())")
    assert str(a.rename(b)) == "`pre_x"


def test_rename_list() -> None:
    a = apyds.Term("(`x `y)")
    b = apyds.Term("((p_) (_s))")
    assert str(a.rename(b)) == "(`p_x_s `p_y_s)"


def test_rename_invalid() -> None:
    a = apyds.Term("`x")
    b = apyds.Term("item")
    assert a.rename(b) is None


def test_match_simple() -> None:
    a = apyds.Term("`a")
    b = apyds.Term("b")
    result = a.match(b)
    assert result is not None
    assert str(result) == "((`a b))"


def test_match_complex() -> None:
    a = apyds.Term("(f `x a)")
    b = apyds.Term("(f b a)")
    result = a.match(b)
    assert result is not None
    assert str(result) == "((`x b))"


def test_match_fail() -> None:
    a = apyds.Term("(f `x)")
    b = apyds.Term("(g `y)")
    result = a.match(b)
    assert result is None


def test_match_with_scopes() -> None:
    a = apyds.Term("`a")
    b = apyds.Term("`b")
    result = a.match(b, "scope1", "scope2")
    assert result is not None
    # The result should be a dictionary with scoped variables
    result_str = str(result)
    assert "scope1" in result_str and "scope2" in result_str and "`a" in result_str and "`b" in result_str

